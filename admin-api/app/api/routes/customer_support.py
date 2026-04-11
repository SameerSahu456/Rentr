from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_customer
from app.models.models import Customer, SupportTicket, TicketMessage
from app.schemas.schemas import (
    SupportTicketCreate,
    SupportTicketResponse,
    TicketMessageCreate,
    TicketMessageResponse,
)

router = APIRouter(prefix="/customer-support", tags=["customer-support"])


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


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: SupportTicketCreate,
    db: Session = Depends(get_db),
    customer: Customer = Depends(get_current_customer),
):
    """Customer creates a support ticket from the frontend."""
    ticket_number = _generate_ticket_number(db)
    ticket = SupportTicket(
        ticket_number=ticket_number,
        customer_name=customer.full_name,
        customer_email=customer.email,
        order_id=payload.order_id,
        asset_uid=payload.asset_uid,
        contract_id=payload.contract_id,
        invoice_id=payload.invoice_id,
        return_id=payload.return_id,
        subject=payload.subject,
        description=payload.description,
        priority=payload.priority,
        category=payload.category,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/tickets")
def list_my_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    customer: Customer = Depends(get_current_customer),
):
    """Customer lists their own support tickets."""
    query = db.query(SupportTicket).filter(
        SupportTicket.customer_email == customer.email
    )
    if status_filter:
        query = query.filter(SupportTicket.status == status_filter)

    total = query.count()
    items = (
        query.order_by(SupportTicket.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {"items": items, "total": total}


@router.get("/tickets/{ticket_id}")
def get_my_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    customer: Customer = Depends(get_current_customer),
):
    """Customer views their own ticket with messages."""
    ticket = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.id == ticket_id,
            SupportTicket.customer_email == customer.email,
        )
        .first()
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    _ = ticket.messages
    data = {c.name: getattr(ticket, c.name) for c in SupportTicket.__table__.columns}
    data["messages"] = [
        {c.name: getattr(m, c.name) for c in TicketMessage.__table__.columns}
        for m in ticket.messages
    ]
    return data


@router.post(
    "/tickets/{ticket_id}/messages",
    response_model=TicketMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_message(
    ticket_id: int,
    payload: TicketMessageCreate,
    db: Session = Depends(get_db),
    customer: Customer = Depends(get_current_customer),
):
    """Customer adds a message to their own ticket."""
    ticket = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.id == ticket_id,
            SupportTicket.customer_email == customer.email,
        )
        .first()
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )
    message = TicketMessage(
        ticket_id=ticket_id,
        sender=customer.full_name,
        sender_type="customer",
        message=payload.message,
        attachment_url=payload.attachment_url,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
