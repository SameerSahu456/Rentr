from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, Asset, Contract, Invoice, Order, Payment
from app.schemas.schemas import (
    InvoiceCreate,
    InvoiceResponse,
    InvoiceUpdate,
)

router = APIRouter(prefix="/invoices", tags=["invoices"])


def _generate_invoice_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"INV-{year}-"
    last = (
        db.query(Invoice)
        .filter(Invoice.invoice_number.like(f"{prefix}%"))
        .order_by(Invoice.invoice_number.desc())
        .first()
    )
    if last:
        seq = int(last.invoice_number.split("-")[-1]) + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"


@router.get("/")
def list_invoices(
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_email: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(Invoice)
    if status_filter:
        query = query.filter(Invoice.status == status_filter)
    if customer_email:
        query = query.filter(Invoice.customer_email.ilike(f"%{customer_email}%"))
    if date_from:
        query = query.filter(Invoice.issue_date >= date_from)
    if date_to:
        query = query.filter(Invoice.issue_date <= date_to)

    total = query.count()
    items = query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    invoice_number = _generate_invoice_number(db)
    invoice = Invoice(**payload.model_dump(), invoice_number=invoice_number)
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    # Eagerly load payments so they appear in the response
    _ = invoice.payments

    # Cross-linked related data
    order_data = None
    if invoice.order_id:
        order_obj = db.query(Order).filter(Order.order_number == invoice.order_id).first()
        if order_obj:
            order_data = {
                "id": order_obj.id, "order_number": order_obj.order_number,
                "status": order_obj.status, "customer_name": order_obj.customer_name,
                "customer_type": order_obj.customer_type,
            }

    contract_data = None
    if invoice.order_id:
        contract_obj = db.query(Contract).filter(Contract.order_id == invoice.order_id).first()
        if contract_obj:
            contract_data = {
                "id": contract_obj.id, "contract_number": contract_obj.contract_number,
                "status": contract_obj.status,
            }

    inv_dict = {c.name: getattr(invoice, c.name) for c in Invoice.__table__.columns}
    inv_dict["payments"] = [
        {c.name: getattr(p, c.name) for c in Payment.__table__.columns}
        for p in (invoice.payments or [])
    ]
    inv_dict["order"] = order_data
    inv_dict["contract"] = contract_data

    # Linked assets (via order)
    if invoice.order_id:
        asset_objs = db.query(Asset).filter(Asset.order_id == invoice.order_id).all()
        inv_dict["assets"] = [
            {"id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model,
             "category": a.category, "status": a.status,
             "condition_grade": a.condition_grade, "monthly_rate": a.monthly_rate}
            for a in asset_objs
        ]
    else:
        inv_dict["assets"] = []

    return inv_dict


@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(invoice, field, value)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    # Soft-delete if the model supports it, otherwise hard-delete
    if hasattr(invoice, "is_deleted"):
        invoice.is_deleted = True
        db.commit()
    else:
        db.delete(invoice)
        db.commit()
