from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_distributor
from app.models.models import (
    DistributorUser, DistributorInvoice, DistributorCustomer,
)

router = APIRouter(prefix="/invoices", tags=["distributor-invoices"])


class InvoiceCreate(BaseModel):
    customer_id: int
    contract_id: int | None = None
    order_id: int | None = None
    items: list = []
    subtotal: float = 0
    tax: float = 0
    total: float = 0
    due_date: date | None = None
    notes: str | None = None


class InvoiceUpdate(BaseModel):
    items: list | None = None
    subtotal: float | None = None
    tax: float | None = None
    total: float | None = None
    status: str | None = None
    due_date: date | None = None
    paid_date: date | None = None
    notes: str | None = None


def _next_invoice_number(db: Session, dist_id: int) -> str:
    count = db.query(func.count(DistributorInvoice.id)).filter(
        DistributorInvoice.distributor_id == dist_id
    ).scalar() or 0
    return f"DIST-INV-{date.today().year}-{count + 1:04d}"


@router.get("/")
def list_invoices(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    query = db.query(DistributorInvoice).filter(DistributorInvoice.distributor_id == current.id)
    if search:
        query = query.filter(
            (DistributorInvoice.invoice_number.ilike(f"%{search}%"))
            | (DistributorInvoice.customer_name.ilike(f"%{search}%"))
        )
    if status:
        query = query.filter(DistributorInvoice.status == status)
    total = query.count()
    items = query.order_by(DistributorInvoice.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "items": [
            {
                "id": i.id, "invoice_number": i.invoice_number,
                "customer_name": i.customer_name, "customer_email": i.customer_email,
                "items": i.items, "subtotal": i.subtotal, "tax": i.tax, "total": i.total,
                "status": i.status,
                "due_date": i.due_date.isoformat() if i.due_date else None,
                "paid_date": i.paid_date.isoformat() if i.paid_date else None,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in items
        ],
        "total": total,
    }


@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    inv = db.query(DistributorInvoice).filter(
        DistributorInvoice.id == invoice_id,
        DistributorInvoice.distributor_id == current.id,
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        "id": inv.id, "invoice_number": inv.invoice_number,
        "customer_id": inv.customer_id, "contract_id": inv.contract_id,
        "order_id": inv.order_id,
        "customer_name": inv.customer_name, "customer_email": inv.customer_email,
        "items": inv.items, "subtotal": inv.subtotal, "tax": inv.tax, "total": inv.total,
        "status": inv.status, "notes": inv.notes,
        "due_date": inv.due_date.isoformat() if inv.due_date else None,
        "paid_date": inv.paid_date.isoformat() if inv.paid_date else None,
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
        "payments": [
            {"id": p.id, "amount": p.amount, "method": p.method, "status": p.status,
             "transaction_id": p.transaction_id,
             "paid_at": p.paid_at.isoformat() if p.paid_at else None}
            for p in (inv.payments or [])
        ],
    }


@router.post("/", status_code=201)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    cust = db.query(DistributorCustomer).filter(
        DistributorCustomer.id == payload.customer_id,
        DistributorCustomer.distributor_id == current.id,
    ).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    inv = DistributorInvoice(
        invoice_number=_next_invoice_number(db, current.id),
        distributor_id=current.id,
        customer_id=cust.id,
        contract_id=payload.contract_id,
        order_id=payload.order_id,
        customer_name=cust.name,
        customer_email=cust.email,
        items=payload.items,
        subtotal=payload.subtotal,
        tax=payload.tax,
        total=payload.total,
        due_date=payload.due_date,
        notes=payload.notes,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return {"id": inv.id, "invoice_number": inv.invoice_number, "message": "Invoice created"}


@router.put("/{invoice_id}")
def update_invoice(
    invoice_id: int,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    inv = db.query(DistributorInvoice).filter(
        DistributorInvoice.id == invoice_id,
        DistributorInvoice.distributor_id == current.id,
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(inv, key, val)
    db.commit()
    db.refresh(inv)
    return {"message": "Invoice updated"}
