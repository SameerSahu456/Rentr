from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, Order, ProformaInvoice
from app.schemas.schemas import (
    ProformaInvoiceCreate,
    ProformaInvoiceResponse,
    ProformaInvoiceUpdate,
)

router = APIRouter(prefix="/proforma-invoices", tags=["proforma-invoices"])


def _generate_pi_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"PI-{year}-"
    last = (
        db.query(ProformaInvoice)
        .filter(ProformaInvoice.pi_number.like(f"{prefix}%"))
        .order_by(ProformaInvoice.pi_number.desc())
        .first()
    )
    seq = int(last.pi_number.split("-")[-1]) + 1 if last else 1
    return f"{prefix}{seq:04d}"


@router.get("/")
def list_proforma_invoices(
    order_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_email: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(ProformaInvoice)
    if order_id:
        query = query.filter(ProformaInvoice.order_id == order_id)
    if status_filter:
        query = query.filter(ProformaInvoice.status == status_filter)
    if customer_email:
        query = query.filter(ProformaInvoice.customer_email == customer_email)

    total = query.count()
    items = query.order_by(ProformaInvoice.created_at.desc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_proforma_invoice(
    payload: ProformaInvoiceCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    pi_number = _generate_pi_number(db)
    pi = ProformaInvoice(
        pi_number=pi_number,
        **payload.model_dump(),
    )
    db.add(pi)

    # Update order with PI reference
    order = db.query(Order).filter(Order.order_number == payload.order_id).first()
    if order:
        order.proforma_invoice_number = pi_number
        order.delivery_status = "proforma_sent"

    db.commit()
    db.refresh(pi)
    return pi


@router.get("/{pi_id}")
def get_proforma_invoice(
    pi_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    pi = db.query(ProformaInvoice).filter(ProformaInvoice.id == pi_id).first()
    if not pi:
        raise HTTPException(status_code=404, detail="Proforma invoice not found")

    data = {c.name: getattr(pi, c.name) for c in ProformaInvoice.__table__.columns}

    # Cross-link order
    order = db.query(Order).filter(Order.order_number == pi.order_id).first()
    if order:
        data["order"] = {
            "id": order.id, "order_number": order.order_number,
            "status": order.status, "delivery_status": order.delivery_status,
        }
    return data


@router.put("/{pi_id}")
def update_proforma_invoice(
    pi_id: int,
    payload: ProformaInvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    pi = db.query(ProformaInvoice).filter(ProformaInvoice.id == pi_id).first()
    if not pi:
        raise HTTPException(status_code=404, detail="Proforma invoice not found")

    update_data = payload.model_dump(exclude_unset=True)

    # If accepting PI, set accepted_at and update order delivery_status
    if update_data.get("status") == "accepted" and pi.status != "accepted":
        pi.accepted_at = datetime.utcnow()
        order = db.query(Order).filter(Order.order_number == pi.order_id).first()
        if order:
            order.delivery_status = "confirmed"

    for field, value in update_data.items():
        setattr(pi, field, value)

    db.commit()
    db.refresh(pi)
    return pi
