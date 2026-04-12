from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_distributor
from app.models.models import (
    DistributorUser, DistributorPayment, DistributorInvoice,
)

router = APIRouter(prefix="/payments", tags=["distributor-payments"])


class PaymentCreate(BaseModel):
    invoice_id: int
    amount: float
    method: str | None = None
    transaction_id: str | None = None


class PaymentUpdate(BaseModel):
    status: str | None = None
    method: str | None = None
    transaction_id: str | None = None


@router.get("/")
def list_payments(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    query = db.query(DistributorPayment).filter(DistributorPayment.distributor_id == current.id)
    if status:
        query = query.filter(DistributorPayment.status == status)
    total = query.count()
    items = query.order_by(DistributorPayment.created_at.desc()).offset(skip).limit(limit).all()

    # Enrich with invoice info
    result = []
    for p in items:
        inv = db.query(DistributorInvoice).filter(DistributorInvoice.id == p.invoice_id).first()
        result.append({
            "id": p.id, "invoice_id": p.invoice_id,
            "invoice_number": inv.invoice_number if inv else None,
            "customer_name": inv.customer_name if inv else None,
            "amount": p.amount, "method": p.method,
            "transaction_id": p.transaction_id, "status": p.status,
            "paid_at": p.paid_at.isoformat() if p.paid_at else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return {"items": result, "total": total}


@router.post("/", status_code=201)
def create_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    inv = db.query(DistributorInvoice).filter(
        DistributorInvoice.id == payload.invoice_id,
        DistributorInvoice.distributor_id == current.id,
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = DistributorPayment(
        distributor_id=current.id,
        invoice_id=inv.id,
        amount=payload.amount,
        method=payload.method,
        transaction_id=payload.transaction_id,
        status="completed",
        paid_at=datetime.now(timezone.utc),
    )
    db.add(payment)

    # Update invoice status if fully paid
    total_paid = sum(
        p.amount for p in (inv.payments or []) if p.status == "completed"
    ) + payload.amount
    if total_paid >= inv.total:
        inv.status = "paid"
        inv.paid_date = datetime.now(timezone.utc).date()

    db.commit()
    db.refresh(payment)
    return {"id": payment.id, "message": "Payment recorded"}


@router.put("/{payment_id}")
def update_payment(
    payment_id: int,
    payload: PaymentUpdate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    p = db.query(DistributorPayment).filter(
        DistributorPayment.id == payment_id,
        DistributorPayment.distributor_id == current.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")

    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(p, key, val)
    db.commit()
    return {"message": "Payment updated"}
