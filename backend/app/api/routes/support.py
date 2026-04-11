from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import (
    SupportTicket, TicketStatus, TicketPriority, TicketMessage, SenderType,
    Asset, Contract, Replacement,
)
from app.models.order import Order

router = APIRouter(prefix="/support", tags=["Support"])


class TicketCreate(BaseModel):
    customer_name: str
    customer_email: str
    subject: str
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = "medium"
    asset_uid: Optional[str] = None
    contract_id: Optional[int] = None


class TicketPatch(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None


class MessageCreate(BaseModel):
    message: str
    sender: Optional[str] = None
    sender_type: Optional[str] = "agent"


def _next_ticket_number(db: Session) -> str:
    count = db.query(func.count(SupportTicket.id)).scalar() or 0
    return f"RENTR-TKT-{date.today().year}-{count + 1:05d}"


@router.get("/tickets")
def list_tickets(
    status: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(SupportTicket)
    if status:
        query = query.filter(SupportTicket.status == status)
    if search:
        query = query.filter(
            or_(
                SupportTicket.ticket_number.ilike(f"%{search}%"),
                SupportTicket.customer_name.ilike(f"%{search}%"),
                SupportTicket.customer_email.ilike(f"%{search}%"),
                SupportTicket.subject.ilike(f"%{search}%"),
            )
        )
    tickets = query.order_by(SupportTicket.created_at.desc()).all()
    return {
        "items": [
            {
                "id": t.id,
                "ticket_number": t.ticket_number,
                "customer_name": t.customer_name,
                "customer_email": t.customer_email,
                "subject": t.subject,
                "category": t.category,
                "priority": t.priority.value if t.priority else None,
                "status": t.status.value if t.status else None,
                "assigned_to": t.assigned_to,
                "asset_uid": t.asset_uid,
                "sla_deadline": t.sla_deadline.isoformat() if t.sla_deadline else None,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in tickets
        ]
    }


@router.get("/tickets/{ticket_id}")
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    messages = (
        db.query(TicketMessage)
        .filter(TicketMessage.ticket_id == ticket.id)
        .order_by(TicketMessage.timestamp.asc())
        .all()
    )

    # Linked asset
    asset_data = None
    if ticket.asset_uid:
        a = db.query(Asset).filter(Asset.uid == ticket.asset_uid).first()
        if a:
            asset_data = {
                "id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model,
                "status": a.status.value if a.status else None,
            }

    # Linked contract
    contract_data = None
    if ticket.contract_id:
        c = db.query(Contract).filter(Contract.id == ticket.contract_id).first()
        if c:
            contract_data = {
                "id": c.id, "contract_number": c.contract_number,
                "status": c.status.value if c.status else None,
            }

    # Linked advance replacements
    linked_replacements = db.query(Replacement).filter(Replacement.ticket_id == ticket.id).all()
    adv_replacements_data = [
        {"id": r.id, "replacement_number": r.replacement_number,
         "faulty_asset_uid": r.faulty_asset_uid, "replacement_asset_uid": r.replacement_asset_uid,
         "reason": r.faulty_reason, "notes": r.faulty_reason,
         "status": r.status.value if r.status else None}
        for r in linked_replacements
    ]

    return {
        "id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "category": ticket.category,
        "priority": ticket.priority.value if ticket.priority else None,
        "status": ticket.status.value if ticket.status else None,
        "assigned_to": ticket.assigned_to,
        "asset_uid": ticket.asset_uid,
        "asset": asset_data,
        "contract_id": ticket.contract_id,
        "contract": contract_data,
        "sla_deadline": ticket.sla_deadline.isoformat() if ticket.sla_deadline else None,
        "sla_response_deadline": ticket.sla_response_deadline.isoformat() if ticket.sla_response_deadline else None,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "messages": [
            {
                "id": m.id,
                "message": m.message,
                "content": m.message,
                "sender": m.sender,
                "sender_name": m.sender,
                "sender_type": m.sender_type.value if m.sender_type else None,
                "timestamp": m.timestamp.isoformat() if m.timestamp else None,
                "created_at": m.timestamp.isoformat() if m.timestamp else None,
            }
            for m in messages
        ],
        "advance_replacements": adv_replacements_data,
    }


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = SupportTicket(
        ticket_number=_next_ticket_number(db),
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        subject=payload.subject,
        description=payload.description,
        category=payload.category,
        priority=payload.priority or "medium",
        status=TicketStatus.open,
        asset_uid=payload.asset_uid,
        contract_id=payload.contract_id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {
        "id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "status": ticket.status.value,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
    }


@router.patch("/tickets/{ticket_id}")
def patch_ticket(
    ticket_id: int,
    payload: TicketPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if payload.status is not None:
        ticket.status = payload.status
    if payload.assigned_to is not None:
        ticket.assigned_to = payload.assigned_to
    if payload.priority is not None:
        ticket.priority = payload.priority

    db.commit()
    db.refresh(ticket)
    return {
        "id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "status": ticket.status.value if hasattr(ticket.status, "value") else ticket.status,
        "assigned_to": ticket.assigned_to,
    }


@router.post("/tickets/{ticket_id}/messages", status_code=status.HTTP_201_CREATED)
def add_message(
    ticket_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    message = TicketMessage(
        ticket_id=ticket.id,
        message=payload.message,
        sender=payload.sender or current_user.email,
        sender_type=payload.sender_type or "agent",
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return {
        "id": message.id,
        "message": message.message,
        "sender": message.sender,
        "sender_type": message.sender_type.value if hasattr(message.sender_type, "value") else message.sender_type,
        "timestamp": message.timestamp.isoformat() if message.timestamp else None,
    }
