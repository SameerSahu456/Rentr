import os
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
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
    if hasattr(invoice, "is_deleted"):
        invoice.is_deleted = True
        db.commit()
    else:
        db.delete(invoice)
        db.commit()


# ── Invoice PDF download ───────────────────────────────────────────────────


@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    from app.services.invoice_pdf import generate_invoice_pdf

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    media_root = os.path.join(base_dir, "media")
    pdf_url = generate_invoice_pdf(invoice, media_root=media_root)

    file_path = os.path.join(base_dir, pdf_url.lstrip("/"))
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"{invoice.invoice_number}.pdf",
    )


# ── Send invoice (mark as sent) ───────────────────────────────────────────


@router.post("/{invoice_id}/send")
def send_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == "draft":
        invoice.status = "sent"
        db.commit()
        db.refresh(invoice)

    return {
        "message": f"Invoice {invoice.invoice_number} sent to {invoice.customer_email}",
        "status": invoice.status,
        "customer_email": invoice.customer_email,
    }


# ── Record payment against invoice ────────────────────────────────────────


class PaymentRecord(BaseModel):
    amount: float
    method: str = "bank_transfer"
    transaction_id: str | None = None


@router.post("/{invoice_id}/payments")
def record_payment(
    invoice_id: int,
    payload: PaymentRecord,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = Payment(
        invoice_id=invoice.id,
        amount=payload.amount,
        method=payload.method,
        transaction_id=payload.transaction_id,
        status="completed",
        paid_at=datetime.utcnow(),
    )
    db.add(payment)

    # Check if fully paid
    existing_paid = sum(p.amount for p in (invoice.payments or []) if p.status == "completed")
    if existing_paid + payload.amount >= invoice.total:
        invoice.status = "paid"
        invoice.paid_date = date.today()

    db.commit()
    db.refresh(payment)
    return {"id": payment.id, "message": "Payment recorded"}


# ── Edit invoice dates with contract sync ──────────────────────────────────


class InvoiceDateEdit(BaseModel):
    due_date: date | None = None
    contract_id: str | None = None  # sync contract end_date if provided


@router.patch("/{invoice_id}")
def patch_invoice(
    invoice_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    allowed = {"due_date", "status", "notes", "paid_date"}
    for key, val in payload.items():
        if key in allowed:
            if key in ("due_date", "paid_date") and val:
                val = date.fromisoformat(val) if isinstance(val, str) else val
            setattr(invoice, key, val)

    # Sync due_date change to linked contract end_date
    if "due_date" in payload and invoice.contract_id:
        contract = db.query(Contract).filter(
            Contract.contract_number == invoice.contract_id
        ).first()
        if contract and payload.get("due_date"):
            # Update contract end_date to match the latest invoice due_date
            latest_due = (
                db.query(func.max(Invoice.due_date))
                .filter(Invoice.contract_id == invoice.contract_id)
                .scalar()
            )
            if latest_due and contract.end_date and latest_due > contract.end_date:
                contract.end_date = latest_due

    db.commit()
    db.refresh(invoice)
    return {c.name: getattr(invoice, c.name) for c in Invoice.__table__.columns}
