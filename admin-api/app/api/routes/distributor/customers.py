from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_distributor
from app.models.models import DistributorUser, DistributorCustomer

router = APIRouter(prefix="/customers", tags=["distributor-customers"])


class CustomerCreate(BaseModel):
    email: EmailStr
    name: str
    phone: str | None = None
    company_name: str | None = None
    gstin: str | None = None
    pan: str | None = None
    shipping_address: dict | None = None
    billing_address: dict | None = None


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    company_name: str | None = None
    gstin: str | None = None
    pan: str | None = None
    shipping_address: dict | None = None
    billing_address: dict | None = None
    is_active: bool | None = None


@router.get("/")
def list_customers(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    query = db.query(DistributorCustomer).filter(
        DistributorCustomer.distributor_id == current.id
    )
    if search:
        query = query.filter(
            (DistributorCustomer.name.ilike(f"%{search}%"))
            | (DistributorCustomer.email.ilike(f"%{search}%"))
            | (DistributorCustomer.company_name.ilike(f"%{search}%"))
        )
    total = query.count()
    items = query.order_by(DistributorCustomer.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "items": [
            {
                "id": c.id, "email": c.email, "name": c.name, "phone": c.phone,
                "company_name": c.company_name, "gstin": c.gstin, "pan": c.pan,
                "kyc_status": c.kyc_status, "is_active": c.is_active,
                "shipping_address": c.shipping_address, "billing_address": c.billing_address,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in items
        ],
        "total": total,
    }


@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    cust = db.query(DistributorCustomer).filter(
        DistributorCustomer.id == customer_id,
        DistributorCustomer.distributor_id == current.id,
    ).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    from app.models.models import DistributorOrder, DistributorContract, DistributorInvoice

    orders = db.query(DistributorOrder).filter(
        DistributorOrder.customer_id == customer_id,
        DistributorOrder.distributor_id == current.id,
    ).order_by(DistributorOrder.created_at.desc()).all()

    contracts = db.query(DistributorContract).filter(
        DistributorContract.customer_id == customer_id,
        DistributorContract.distributor_id == current.id,
    ).order_by(DistributorContract.created_at.desc()).all()

    invoices = db.query(DistributorInvoice).filter(
        DistributorInvoice.customer_id == customer_id,
        DistributorInvoice.distributor_id == current.id,
    ).order_by(DistributorInvoice.created_at.desc()).all()

    return {
        "id": cust.id, "email": cust.email, "name": cust.name, "phone": cust.phone,
        "company_name": cust.company_name, "gstin": cust.gstin, "pan": cust.pan,
        "kyc_status": cust.kyc_status, "is_active": cust.is_active,
        "shipping_address": cust.shipping_address, "billing_address": cust.billing_address,
        "created_at": cust.created_at.isoformat() if cust.created_at else None,
        "orders": [
            {"id": o.id, "order_number": o.order_number, "total_monthly": o.total_monthly,
             "status": o.status, "created_at": o.created_at.isoformat() if o.created_at else None}
            for o in orders
        ],
        "contracts": [
            {"id": c.id, "contract_number": c.contract_number, "status": c.status,
             "start_date": c.start_date.isoformat() if c.start_date else None,
             "end_date": c.end_date.isoformat() if c.end_date else None}
            for c in contracts
        ],
        "invoices": [
            {"id": i.id, "invoice_number": i.invoice_number, "total": i.total,
             "status": i.status, "due_date": i.due_date.isoformat() if i.due_date else None}
            for i in invoices
        ],
    }


@router.post("/", status_code=201)
def create_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    existing = db.query(DistributorCustomer).filter(
        DistributorCustomer.distributor_id == current.id,
        DistributorCustomer.email == payload.email,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")

    cust = DistributorCustomer(
        distributor_id=current.id,
        email=payload.email,
        name=payload.name,
        phone=payload.phone,
        company_name=payload.company_name,
        gstin=payload.gstin,
        pan=payload.pan,
        shipping_address=payload.shipping_address,
        billing_address=payload.billing_address,
    )
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return {"id": cust.id, "message": "Customer created"}


@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    cust = db.query(DistributorCustomer).filter(
        DistributorCustomer.id == customer_id,
        DistributorCustomer.distributor_id == current.id,
    ).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(cust, key, val)
    db.commit()
    db.refresh(cust)
    return {"message": "Customer updated"}
