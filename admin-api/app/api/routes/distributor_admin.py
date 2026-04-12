"""Admin-side routes for managing distributors and viewing their data."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, hash_password
from app.models.models import (
    AdminUser, DistributorUser, DistributorCustomer, DistributorOrder,
    DistributorContract, DistributorInvoice, DistributorPayment, DistributorKYC,
)

router = APIRouter(prefix="/distributors", tags=["distributors-admin"])


class DistributorCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    phone: str | None = None
    company_name: str
    gstin: str | None = None
    pan: str | None = None
    partner_email: str | None = None
    commission_rate: float = 0
    credit_limit: float = 0


class DistributorUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    company_name: str | None = None
    gstin: str | None = None
    pan: str | None = None
    partner_email: str | None = None
    commission_rate: float | None = None
    credit_limit: float | None = None
    credit_used: float | None = None
    is_active: bool | None = None


@router.get("/")
def list_distributors(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(DistributorUser)
    if search:
        query = query.filter(
            (DistributorUser.name.ilike(f"%{search}%"))
            | (DistributorUser.email.ilike(f"%{search}%"))
            | (DistributorUser.company_name.ilike(f"%{search}%"))
        )
    total = query.count()
    items = query.order_by(DistributorUser.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for d in items:
        cust_count = db.query(func.count(DistributorCustomer.id)).filter(
            DistributorCustomer.distributor_id == d.id
        ).scalar() or 0
        order_count = db.query(func.count(DistributorOrder.id)).filter(
            DistributorOrder.distributor_id == d.id
        ).scalar() or 0
        revenue = db.query(func.coalesce(func.sum(DistributorInvoice.total), 0)).filter(
            DistributorInvoice.distributor_id == d.id,
            DistributorInvoice.status == "paid",
        ).scalar() or 0
        monthly_spread = db.query(func.coalesce(func.sum(DistributorOrder.spread), 0)).filter(
            DistributorOrder.distributor_id == d.id,
            DistributorOrder.status.in_(["confirmed", "active"]),
        ).scalar() or 0

        result.append({
            "id": d.id, "email": d.email, "name": d.name, "phone": d.phone,
            "company_name": d.company_name, "gstin": d.gstin, "pan": d.pan,
            "partner_email": d.partner_email, "commission_rate": d.commission_rate,
            "credit_limit": d.credit_limit, "credit_used": d.credit_used,
            "is_active": d.is_active,
            "total_customers": cust_count, "total_orders": order_count,
            "total_revenue": float(revenue), "monthly_spread": float(monthly_spread),
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })
    return {"items": result, "total": total}


@router.get("/{distributor_id}")
def get_distributor(
    distributor_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    d = db.query(DistributorUser).filter(DistributorUser.id == distributor_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Distributor not found")

    customers = db.query(DistributorCustomer).filter(
        DistributorCustomer.distributor_id == d.id
    ).order_by(DistributorCustomer.created_at.desc()).all()

    orders = db.query(DistributorOrder).filter(
        DistributorOrder.distributor_id == d.id
    ).order_by(DistributorOrder.created_at.desc()).all()

    contracts = db.query(DistributorContract).filter(
        DistributorContract.distributor_id == d.id
    ).order_by(DistributorContract.created_at.desc()).all()

    invoices = db.query(DistributorInvoice).filter(
        DistributorInvoice.distributor_id == d.id
    ).order_by(DistributorInvoice.created_at.desc()).all()

    revenue = sum(i.total for i in invoices if i.status == "paid")
    outstanding = sum(i.total for i in invoices if i.status in ("sent", "overdue"))
    monthly_spread = sum(o.spread for o in orders if o.status in ("confirmed", "active"))

    return {
        "id": d.id, "email": d.email, "name": d.name, "phone": d.phone,
        "company_name": d.company_name, "gstin": d.gstin, "pan": d.pan,
        "partner_email": d.partner_email, "commission_rate": d.commission_rate,
        "credit_limit": d.credit_limit, "credit_used": d.credit_used,
        "is_active": d.is_active,
        "total_revenue": float(revenue), "total_outstanding": float(outstanding),
        "monthly_spread": float(monthly_spread),
        "created_at": d.created_at.isoformat() if d.created_at else None,
        "customers": [
            {"id": c.id, "email": c.email, "name": c.name, "company_name": c.company_name,
             "kyc_status": c.kyc_status, "is_active": c.is_active,
             "created_at": c.created_at.isoformat() if c.created_at else None}
            for c in customers
        ],
        "orders": [
            {"id": o.id, "order_number": o.order_number, "customer_name": o.customer_name,
             "total_monthly": o.total_monthly, "rentr_monthly": o.rentr_monthly,
             "spread": o.spread, "status": o.status,
             "created_at": o.created_at.isoformat() if o.created_at else None}
            for o in orders
        ],
        "contracts": [
            {"id": c.id, "contract_number": c.contract_number, "customer_name": c.customer_name,
             "status": c.status,
             "start_date": c.start_date.isoformat() if c.start_date else None,
             "end_date": c.end_date.isoformat() if c.end_date else None}
            for c in contracts
        ],
        "invoices": [
            {"id": i.id, "invoice_number": i.invoice_number, "customer_name": i.customer_name,
             "total": i.total, "status": i.status,
             "due_date": i.due_date.isoformat() if i.due_date else None}
            for i in invoices
        ],
    }


@router.post("/", status_code=201)
def create_distributor(
    payload: DistributorCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    existing = db.query(DistributorUser).filter(DistributorUser.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Distributor with this email already exists")

    dist = DistributorUser(
        email=payload.email,
        name=payload.name,
        phone=payload.phone,
        company_name=payload.company_name,
        gstin=payload.gstin,
        pan=payload.pan,
        password_hash=hash_password(payload.password),
        partner_email=payload.partner_email,
        commission_rate=payload.commission_rate,
        credit_limit=payload.credit_limit,
        is_active=True,
    )
    db.add(dist)
    db.commit()
    db.refresh(dist)
    return {"id": dist.id, "message": "Distributor created"}


@router.put("/{distributor_id}")
def update_distributor(
    distributor_id: int,
    payload: DistributorUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    d = db.query(DistributorUser).filter(DistributorUser.id == distributor_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Distributor not found")

    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(d, key, val)
    db.commit()
    db.refresh(d)
    return {"message": "Distributor updated"}
