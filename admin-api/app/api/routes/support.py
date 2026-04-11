from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    AdminUser, Asset, Contract, Invoice, Order, ReturnRequest, SupportTicket, TicketMessage,
)
from app.schemas.schemas import (
    SupportTicketCreate,
    SupportTicketResponse,
    SupportTicketUpdate,
    TicketMessageCreate,
    TicketMessageResponse,
)

router = APIRouter(prefix="/support", tags=["support"])

SLA_CONFIG = {
    "critical": {"response_hours": 4, "resolution_hours": 8},
    "high": {"response_hours": 8, "resolution_hours": 24},
    "medium": {"response_hours": 24, "resolution_hours": 72},
    "low": {"response_hours": 48, "resolution_hours": 120},
}


def _enrich_ticket_with_sla(ticket) -> dict:
    """Add SLA computed fields to a ticket dict."""
    data = {c.name: getattr(ticket, c.name) for c in ticket.__table__.columns}

    priority = ticket.priority or "medium"
    sla = SLA_CONFIG.get(priority, SLA_CONFIG["medium"])
    data["sla_response_hours"] = sla["response_hours"]
    data["sla_resolution_hours"] = sla["resolution_hours"]

    # Compute SLA status
    created = ticket.created_at
    if created is not None:
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        deadline = created + timedelta(hours=sla["resolution_hours"])
        total_seconds = (deadline - created).total_seconds()
        elapsed_seconds = (now - created).total_seconds()

        if now > deadline:
            data["sla_status"] = "breached"
        elif elapsed_seconds > 0.75 * total_seconds:
            data["sla_status"] = "at_risk"
        else:
            data["sla_status"] = "on_track"
    else:
        data["sla_status"] = "on_track"

    # Include messages if loaded
    if "messages" in ticket.__dict__:
        data["messages"] = ticket.messages

    return data


def _generate_ticket_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"TKT-{year}-"
    last = (
        db.query(SupportTicket)
        .filter(SupportTicket.ticket_number.like(f"{prefix}%"))
        .order_by(SupportTicket.ticket_number.desc())
        .first()
    )
    if last:
        seq = int(last.ticket_number.split("-")[-1]) + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"


@router.get("/tickets")
def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    assigned_to: Optional[int] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(SupportTicket)
    if status_filter:
        query = query.filter(SupportTicket.status == status_filter)
    if priority:
        query = query.filter(SupportTicket.priority == priority)
    if assigned_to:
        query = query.filter(SupportTicket.assigned_to == assigned_to)
    if category:
        query = query.filter(SupportTicket.category == category)

    total = query.count()
    items = (
        query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()
    )
    return {"items": [_enrich_ticket_with_sla(t) for t in items], "total": total}


@router.post(
    "/tickets",
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    payload: SupportTicketCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    ticket_number = _generate_ticket_number(db)
    ticket = SupportTicket(**payload.model_dump(), ticket_number=ticket_number)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return _enrich_ticket_with_sla(ticket)


@router.get("/tickets/{ticket_id}")
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    # Eagerly load messages
    _ = ticket.messages
    data = _enrich_ticket_with_sla(ticket)

    # Cross-linked: order
    if ticket.order_id:
        order_obj = db.query(Order).filter(Order.order_number == ticket.order_id).first()
        if order_obj:
            data["order"] = {
                "id": order_obj.id, "order_number": order_obj.order_number,
                "status": order_obj.status, "customer_name": order_obj.customer_name,
            }

    # Cross-linked: asset
    if ticket.asset_uid:
        asset_obj = db.query(Asset).filter(Asset.uid == ticket.asset_uid).first()
        if asset_obj:
            data["asset"] = {
                "id": asset_obj.id, "uid": asset_obj.uid, "oem": asset_obj.oem,
                "model": asset_obj.model, "category": asset_obj.category,
                "status": asset_obj.status, "condition_grade": asset_obj.condition_grade,
            }

    # Cross-linked: contract
    if ticket.contract_id:
        contract_obj = db.query(Contract).filter(Contract.contract_number == ticket.contract_id).first()
        if contract_obj:
            data["contract"] = {
                "id": contract_obj.id, "contract_number": contract_obj.contract_number,
                "status": contract_obj.status, "start_date": contract_obj.start_date,
                "end_date": contract_obj.end_date,
            }

    # Cross-linked: invoice
    if ticket.invoice_id:
        inv_obj = db.query(Invoice).filter(Invoice.invoice_number == ticket.invoice_id).first()
        if inv_obj:
            data["invoice"] = {
                "id": inv_obj.id, "invoice_number": inv_obj.invoice_number,
                "total": inv_obj.total, "status": inv_obj.status, "due_date": inv_obj.due_date,
            }

    # Cross-linked: return
    if ticket.return_id:
        ret_obj = db.query(ReturnRequest).filter(ReturnRequest.return_number == ticket.return_id).first()
        if ret_obj:
            data["return_request"] = {
                "id": ret_obj.id, "return_number": ret_obj.return_number,
                "status": ret_obj.status, "reason": ret_obj.reason,
            }

    return data


@router.put("/tickets/{ticket_id}")
def update_ticket(
    ticket_id: int,
    payload: SupportTicketUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)
    db.commit()
    db.refresh(ticket)
    return _enrich_ticket_with_sla(ticket)


@router.get("/tickets/{ticket_id}/messages")
def list_ticket_messages(
    ticket_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    query = db.query(TicketMessage).filter(TicketMessage.ticket_id == ticket_id)
    total = query.count()
    items = query.order_by(TicketMessage.created_at.asc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


@router.post(
    "/tickets/{ticket_id}/messages",
    response_model=TicketMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_ticket_message(
    ticket_id: int,
    payload: TicketMessageCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    message = TicketMessage(
        **payload.model_dump(),
        ticket_id=ticket_id,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
