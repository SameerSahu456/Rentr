from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, Asset, Contract, Invoice, Order, ReturnRequest, SupportTicket

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/")
def list_customers(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    # Aggregate customers from orders
    query = (
        db.query(
            Order.customer_email,
            func.max(Order.customer_name).label("customer_name"),
            func.max(Order.customer_type).label("customer_type"),
            func.count(Order.id).label("total_orders"),
            func.sum(Order.total_monthly).label("total_monthly_value"),
            func.min(Order.created_at).label("first_order"),
            func.max(Order.created_at).label("last_order"),
        )
        .group_by(Order.customer_email)
    )

    if search:
        query = query.filter(
            (Order.customer_email.ilike(f"%{search}%"))
            | (Order.customer_name.ilike(f"%{search}%"))
        )

    total = query.count()
    rows = query.order_by(func.max(Order.created_at).desc()).offset(skip).limit(limit).all()

    items = []
    for row in rows:
        items.append({
            "email": row.customer_email,
            "name": row.customer_name,
            "customer_type": row.customer_type or "customer",
            "total_orders": row.total_orders,
            "total_monthly_value": float(row.total_monthly_value or 0),
            "first_order": row.first_order.isoformat() if row.first_order else None,
            "last_order": row.last_order.isoformat() if row.last_order else None,
        })

    return {"items": items, "total": total}


@router.get("/{email}")
def get_customer(
    email: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    orders = (
        db.query(Order)
        .filter(Order.customer_email == email)
        .order_by(Order.created_at.desc())
        .all()
    )
    if not orders:
        raise HTTPException(status_code=404, detail="Customer not found")

    invoices = (
        db.query(Invoice)
        .filter(Invoice.customer_email == email)
        .order_by(Invoice.created_at.desc())
        .all()
    )

    contracts = (
        db.query(Contract)
        .filter(Contract.customer_email == email)
        .order_by(Contract.created_at.desc())
        .all()
    )

    total_paid = sum(
        inv.total for inv in invoices if inv.status == "paid"
    )

    return {
        "email": email,
        "name": orders[0].customer_name,
        "customer_type": orders[0].customer_type or "customer",
        "total_orders": len(orders),
        "total_invoices": len(invoices),
        "total_contracts": len(contracts),
        "total_paid": float(total_paid),
        "orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "total_monthly": o.total_monthly,
                "rental_months": o.rental_months,
                "status": o.status,
                "items": o.items,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ],
        "invoices": [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "total": inv.total,
                "status": inv.status,
                "due_date": inv.due_date.isoformat() if inv.due_date else None,
                "created_at": inv.created_at.isoformat() if inv.created_at else None,
            }
            for inv in invoices
        ],
        "contracts": [
            {
                "id": c.id,
                "contract_number": c.contract_number,
                "order_id": c.order_id,
                "status": c.status,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
            }
            for c in contracts
        ],
        "assets": [
            {
                "id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model,
                "status": a.status, "condition_grade": a.condition_grade,
                "monthly_rate": a.monthly_rate, "category": a.category, "site": a.site,
            }
            for a in db.query(Asset).filter(Asset.customer_email == email).all()
        ],
        "returns": [
            {
                "id": r.id, "return_number": r.return_number, "status": r.status,
                "reason": r.reason, "asset_uids": r.asset_uids,
                "pickup_date": r.pickup_date,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in db.query(ReturnRequest).filter(ReturnRequest.customer_email == email).all()
        ],
        "tickets": [
            {
                "id": t.id, "ticket_number": t.ticket_number, "subject": t.subject,
                "priority": t.priority, "status": t.status, "category": t.category,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in db.query(SupportTicket).filter(SupportTicket.customer_email == email).all()
        ],
    }
