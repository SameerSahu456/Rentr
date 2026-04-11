from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, Invoice, Payment
from app.schemas.schemas import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/")
def list_payments(
    status_filter: Optional[str] = Query(None, alias="status"),
    invoice_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(Payment)
    if status_filter:
        query = query.filter(Payment.status == status_filter)
    if invoice_id:
        query = query.filter(Payment.invoice_id == invoice_id)

    total = query.count()
    items = query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()

    # Enrich with invoice_number for display
    result = []
    for p in items:
        row = {
            "id": p.id,
            "invoice_id": p.invoice_id,
            "amount": p.amount,
            "method": p.method,
            "transaction_id": p.transaction_id,
            "status": p.status,
            "paid_at": p.paid_at,
            "created_at": p.created_at,
        }
        inv = db.query(Invoice).filter(Invoice.id == p.invoice_id).first()
        row["invoice_number"] = inv.invoice_number if inv else None
        result.append(row)

    return {"items": result, "total": total}


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == payload.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    payment = Payment(**payload.model_dump())
    db.add(payment)

    # Check if total payments now cover the invoice amount
    from sqlalchemy import func

    total_paid = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.invoice_id == invoice.id, Payment.status == "completed")
        .scalar()
    )
    # Include the new payment amount if it is completed
    incoming = payload.amount if payload.status == "completed" else 0
    if (total_paid + incoming) >= invoice.total:
        invoice.status = "paid"

    db.commit()
    db.refresh(payment)
    return payment


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment
