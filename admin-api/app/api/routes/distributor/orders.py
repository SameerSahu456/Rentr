from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_distributor
from app.models.models import (
    DistributorUser, DistributorOrder, DistributorCustomer,
)

router = APIRouter(prefix="/orders", tags=["distributor-orders"])


class OrderCreate(BaseModel):
    customer_id: int
    items: list = []
    total_monthly: float = 0
    rentr_monthly: float = 0
    rental_months: int = 12
    asset_uids: list = []
    shipping_address: dict | None = None
    notes: str | None = None
    billing_start_date: date | None = None


class OrderUpdate(BaseModel):
    items: list | None = None
    total_monthly: float | None = None
    rentr_monthly: float | None = None
    rental_months: int | None = None
    asset_uids: list | None = None
    status: str | None = None
    shipping_address: dict | None = None
    notes: str | None = None
    billing_start_date: date | None = None
    billing_end_date: date | None = None


def _next_order_number(db: Session, dist_id: int) -> str:
    count = db.query(func.count(DistributorOrder.id)).filter(
        DistributorOrder.distributor_id == dist_id
    ).scalar() or 0
    return f"DIST-ORD-{date.today().year}-{count + 1:04d}"


@router.get("/")
def list_orders(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    query = db.query(DistributorOrder).filter(DistributorOrder.distributor_id == current.id)
    if search:
        query = query.filter(
            (DistributorOrder.order_number.ilike(f"%{search}%"))
            | (DistributorOrder.customer_name.ilike(f"%{search}%"))
        )
    if status:
        query = query.filter(DistributorOrder.status == status)
    total = query.count()
    items = query.order_by(DistributorOrder.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "items": [
            {
                "id": o.id, "order_number": o.order_number, "customer_name": o.customer_name,
                "customer_email": o.customer_email, "items": o.items,
                "total_monthly": o.total_monthly, "rentr_monthly": o.rentr_monthly,
                "spread": o.spread, "rental_months": o.rental_months,
                "status": o.status, "asset_uids": o.asset_uids,
                "billing_start_date": o.billing_start_date.isoformat() if o.billing_start_date else None,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in items
        ],
        "total": total,
    }


@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    order = db.query(DistributorOrder).filter(
        DistributorOrder.id == order_id,
        DistributorOrder.distributor_id == current.id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "id": order.id, "order_number": order.order_number,
        "customer_id": order.customer_id, "customer_name": order.customer_name,
        "customer_email": order.customer_email, "items": order.items,
        "total_monthly": order.total_monthly, "rentr_monthly": order.rentr_monthly,
        "spread": order.spread, "rental_months": order.rental_months,
        "status": order.status, "asset_uids": order.asset_uids,
        "shipping_address": order.shipping_address, "notes": order.notes,
        "billing_start_date": order.billing_start_date.isoformat() if order.billing_start_date else None,
        "billing_end_date": order.billing_end_date.isoformat() if order.billing_end_date else None,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


@router.post("/", status_code=201)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    cust = db.query(DistributorCustomer).filter(
        DistributorCustomer.id == payload.customer_id,
        DistributorCustomer.distributor_id == current.id,
    ).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    spread = payload.total_monthly - payload.rentr_monthly
    order = DistributorOrder(
        order_number=_next_order_number(db, current.id),
        distributor_id=current.id,
        customer_id=cust.id,
        customer_name=cust.name,
        customer_email=cust.email,
        items=payload.items,
        total_monthly=payload.total_monthly,
        rentr_monthly=payload.rentr_monthly,
        spread=spread,
        rental_months=payload.rental_months,
        asset_uids=payload.asset_uids,
        shipping_address=payload.shipping_address,
        notes=payload.notes,
        billing_start_date=payload.billing_start_date,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return {"id": order.id, "order_number": order.order_number, "message": "Order created"}


@router.put("/{order_id}")
def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    order = db.query(DistributorOrder).filter(
        DistributorOrder.id == order_id,
        DistributorOrder.distributor_id == current.id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    data = payload.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(order, key, val)
    # Recalculate spread
    order.spread = (order.total_monthly or 0) - (order.rentr_monthly or 0)
    db.commit()
    db.refresh(order)
    return {"message": "Order updated"}
