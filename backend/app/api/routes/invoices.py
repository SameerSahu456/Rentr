from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import Invoice, InvoiceStatus, Payment, PaymentStatus

router = APIRouter(prefix="/invoices", tags=["Invoices"])


class InvoiceCreate(BaseModel):
    customer_name: str
    customer_email: str
    contract_id: Optional[int] = None
    items: Optional[List[dict]] = None
    total: float
    gst_amount: Optional[float] = 0
    due_date: Optional[str] = None


class InvoicePatch(BaseModel):
    status: Optional[str] = None


class PaymentRecord(BaseModel):
    amount: float
    method: Optional[str] = None
    transaction_id: Optional[str] = None


def _next_invoice_number(db: Session) -> str:
    count = db.query(func.count(Invoice.id)).scalar() or 0
    return f"RENTR-INV-{date.today().year}-{count + 1:05d}"


@router.get("/")
def list_invoices(
    status: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Invoice)
    if status:
        query = query.filter(Invoice.status == status)
    if search:
        query = query.filter(
            or_(
                Invoice.invoice_number.ilike(f"%{search}%"),
                Invoice.customer_name.ilike(f"%{search}%"),
                Invoice.customer_email.ilike(f"%{search}%"),
            )
        )
    invoices = query.order_by(Invoice.created_at.desc()).all()
    return {
        "items": [
            {
                "id": i.id,
                "invoice_number": i.invoice_number,
                "customer_name": i.customer_name,
                "customer_email": i.customer_email,
                "contract_id": i.contract_id,
                "total": i.total,
                "gst_amount": i.gst_amount,
                "status": i.status.value if i.status else None,
                "due_date": i.due_date.isoformat() if i.due_date else None,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in invoices
        ]
    }


@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payments = db.query(Payment).filter(Payment.invoice_id == invoice.id).all()

    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "customer_name": invoice.customer_name,
        "customer_email": invoice.customer_email,
        "contract_id": invoice.contract_id,
        "items": invoice.items or [],
        "total": invoice.total,
        "gst_amount": invoice.gst_amount,
        "status": invoice.status.value if invoice.status else None,
        "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
        "created_at": invoice.created_at.isoformat() if invoice.created_at else None,
        "payments": [
            {
                "id": p.id,
                "amount": p.amount,
                "method": p.method,
                "transaction_id": p.transaction_id,
                "status": p.status.value if p.status else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ],
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = Invoice(
        invoice_number=_next_invoice_number(db),
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        contract_id=payload.contract_id,
        items=payload.items or [],
        total=payload.total,
        gst_amount=payload.gst_amount or 0,
        status=InvoiceStatus.draft,
        due_date=date.fromisoformat(payload.due_date) if payload.due_date else None,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "status": invoice.status.value,
        "total": invoice.total,
        "created_at": invoice.created_at.isoformat() if invoice.created_at else None,
    }


@router.patch("/{invoice_id}")
def patch_invoice(
    invoice_id: int,
    payload: InvoicePatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if payload.status is not None:
        invoice.status = payload.status

    db.commit()
    db.refresh(invoice)
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "status": invoice.status.value if hasattr(invoice.status, "value") else invoice.status,
    }


@router.post("/{invoice_id}/payments", status_code=status.HTTP_201_CREATED)
def record_payment(
    invoice_id: int,
    payload: PaymentRecord,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = Payment(
        invoice_id=invoice.id,
        invoice_number=invoice.invoice_number,
        amount=payload.amount,
        method=payload.method,
        transaction_id=payload.transaction_id,
        status=PaymentStatus.completed,
    )
    db.add(payment)

    # Check if invoice is fully paid
    existing_payments = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
        Payment.invoice_id == invoice.id,
        Payment.status == PaymentStatus.completed,
    ).scalar() or 0
    if (existing_payments + payload.amount) >= invoice.total:
        invoice.status = InvoiceStatus.paid

    db.commit()
    db.refresh(payment)
    return {
        "id": payment.id,
        "amount": payment.amount,
        "method": payment.method,
        "transaction_id": payment.transaction_id,
        "status": payment.status.value,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
    }
