from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.order import Order
from app.models.rental import (
    Customer, KYC, Asset, Contract, Invoice, Payment, Return, SupportTicket,
)

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/")
def list_customers(
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Customer)
    if search:
        query = query.filter(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
                Customer.company_name.ilike(f"%{search}%"),
            )
        )
    customers = query.order_by(Customer.created_at.desc()).all()
    items = []
    for c in customers:
        user = db.query(User).filter(User.email == c.email).first()
        user_orders = db.query(Order).filter(Order.user_id == user.id).all() if user else []
        items.append({
            "id": c.id,
            "email": c.email,
            "name": c.name,
            "customer_type": c.customer_type.value if c.customer_type else None,
            "company_name": c.company_name,
            "gstin": c.gstin,
            "pan": c.pan,
            "tier": c.tier.value if c.tier else None,
            "kyc_status": c.kyc_status.value if c.kyc_status else None,
            "credit_limit": c.credit_limit,
            "credit_used": c.credit_used,
            "monthly_revenue": c.monthly_revenue,
            "outstanding": c.outstanding,
            "total_assets": c.total_assets,
            "open_tickets": c.open_tickets,
            "total_orders": len(user_orders),
            "total_monthly_value": sum(float(o.total_amount or 0) for o in user_orders),
            "first_order": min((o.created_at for o in user_orders), default=None),
            "last_order": max((o.created_at for o in user_orders), default=None),
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return {"items": items}


@router.get("/{email}")
def get_customer(
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.email == email).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # Link orders via User table
    user = db.query(User).filter(User.email == email).first()
    user_orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all() if user else []
    assets = db.query(Asset).filter(Asset.customer_email == email).all()
    invoices = db.query(Invoice).filter(Invoice.customer_email == email).all()
    contracts = db.query(Contract).filter(Contract.customer_email == email).all()
    returns = db.query(Return).filter(Return.customer_email == email).all()
    tickets = db.query(SupportTicket).filter(SupportTicket.customer_email == email).all()

    return {
        "id": customer.id,
        "email": customer.email,
        "name": customer.name,
        "customer_type": customer.customer_type.value if customer.customer_type else None,
        "company_name": customer.company_name,
        "gstin": customer.gstin,
        "pan": customer.pan,
        "tier": customer.tier.value if customer.tier else None,
        "kyc_status": customer.kyc_status.value if customer.kyc_status else None,
        "credit_limit": customer.credit_limit,
        "credit_used": customer.credit_used,
        "monthly_revenue": customer.monthly_revenue,
        "outstanding": customer.outstanding,
        "total_assets": customer.total_assets,
        "open_tickets": customer.open_tickets,
        "created_at": customer.created_at.isoformat() if customer.created_at else None,
        "total_orders": len(user_orders),
        "total_monthly_value": sum(float(o.total_amount or 0) for o in user_orders),
        "total_paid": sum(
            float(p.amount or 0)
            for inv in invoices
            for p in db.query(Payment).filter(Payment.invoice_id == inv.id, Payment.status == "completed").all()
        ),
        "first_order": user_orders[-1].created_at.isoformat() if user_orders else None,
        "last_order": user_orders[0].created_at.isoformat() if user_orders else None,
        "orders": [
            {
                "id": o.id, "order_number": f"ORD-{o.id:05d}",
                "total_monthly": float(o.total_amount or 0),
                "rental_months": o.rental_months,
                "status": o.status.value if hasattr(o.status, "value") else o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in user_orders
        ],
        "assets": [
            {
                "id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model,
                "category": a.category.value if a.category else None,
                "status": a.status.value if a.status else None,
                "serial_number": a.serial_number,
            }
            for a in assets
        ],
        "invoices": [
            {
                "id": i.id, "invoice_number": i.invoice_number,
                "total": i.total, "status": i.status.value if i.status else None,
                "due_date": i.due_date.isoformat() if i.due_date else None,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in invoices
        ],
        "contracts": [
            {
                "id": c.id, "contract_number": c.contract_number,
                "status": c.status.value if c.status else None,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
            }
            for c in contracts
        ],
        "returns": [
            {
                "id": r.id, "return_number": r.return_number,
                "status": r.status.value if r.status else None,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in returns
        ],
        "tickets": [
            {
                "id": t.id, "ticket_number": t.ticket_number,
                "subject": t.subject,
                "status": t.status.value if t.status else None,
                "priority": t.priority.value if t.priority else None,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in tickets
        ],
    }
