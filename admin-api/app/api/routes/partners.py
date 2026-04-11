from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    AdminUser, Asset, Contract, Invoice, KYCSubmission,
    Order, Payment, ReturnRequest, SupportTicket,
)

router = APIRouter(prefix="/partners", tags=["partners"])


def _compute_tier(credit_limit: float) -> str:
    if credit_limit is None:
        return "Silver"
    if credit_limit >= 2_00_00_000:  # > 2 Cr
        return "Platinum"
    if credit_limit >= 50_00_000:  # >= 50 L
        return "Gold"
    return "Silver"


@router.get("/")
def list_partners(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """List all channel partners with performance summary."""
    query = db.query(KYCSubmission).filter(
        KYCSubmission.account_type == "channel_partner"
    )

    if search:
        query = query.filter(
            (KYCSubmission.customer_email.ilike(f"%{search}%"))
            | (KYCSubmission.customer_name.ilike(f"%{search}%"))
            | (KYCSubmission.company_name.ilike(f"%{search}%"))
        )

    total = query.count()
    partners = query.order_by(KYCSubmission.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for p in partners:
        email = p.customer_email

        total_orders = db.query(func.count(Order.id)).filter(
            Order.customer_email == email
        ).scalar() or 0

        total_assets = db.query(func.count(Asset.id)).filter(
            Asset.customer_email == email
        ).scalar() or 0

        monthly_revenue = db.query(func.coalesce(func.sum(Order.total_monthly), 0)).filter(
            Order.customer_email == email,
            Order.status.in_(["confirmed", "active", "delivered"]),
        ).scalar() or 0

        total_invoiced = db.query(func.coalesce(func.sum(Invoice.total), 0)).filter(
            Invoice.customer_email == email
        ).scalar() or 0

        total_paid = db.query(func.coalesce(func.sum(Invoice.total), 0)).filter(
            Invoice.customer_email == email,
            Invoice.status == "paid",
        ).scalar() or 0

        outstanding = db.query(func.coalesce(func.sum(Invoice.total), 0)).filter(
            Invoice.customer_email == email,
            Invoice.status == "overdue",
        ).scalar() or 0

        active_contracts = db.query(func.count(Contract.id)).filter(
            Contract.customer_email == email,
            Contract.status == "active",
        ).scalar() or 0

        open_tickets = db.query(func.count(SupportTicket.id)).filter(
            SupportTicket.customer_email == email,
            SupportTicket.status.notin_(["closed", "resolved"]),
        ).scalar() or 0

        items.append({
            "email": email,
            "name": p.customer_name,
            "company_name": p.company_name,
            "gstin": p.gstin,
            "kyc_status": p.status,
            "credit_limit": float(p.credit_limit or 0),
            "credit_used": float(p.credit_used or 0),
            "tier": _compute_tier(p.credit_limit),
            "total_orders": total_orders,
            "total_assets": total_assets,
            "monthly_revenue": float(monthly_revenue),
            "total_invoiced": float(total_invoiced),
            "total_paid": float(total_paid),
            "outstanding": float(outstanding),
            "active_contracts": active_contracts,
            "open_tickets": open_tickets,
        })

    return {"items": items, "total": total}


@router.get("/{email}")
def get_partner(
    email: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Full partner detail with everything."""
    kyc = db.query(KYCSubmission).filter(
        KYCSubmission.customer_email == email,
        KYCSubmission.account_type == "channel_partner",
    ).first()

    if not kyc:
        raise HTTPException(status_code=404, detail="Partner not found")

    # ── Linked data ──────────────────────────────────────────────────────
    orders = (
        db.query(Order)
        .filter(Order.customer_email == email)
        .order_by(Order.created_at.desc())
        .all()
    )
    assets = (
        db.query(Asset)
        .filter(Asset.customer_email == email)
        .order_by(Asset.created_at.desc())
        .all()
    )
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
    returns = (
        db.query(ReturnRequest)
        .filter(ReturnRequest.customer_email == email)
        .order_by(ReturnRequest.created_at.desc())
        .all()
    )
    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.customer_email == email)
        .order_by(SupportTicket.created_at.desc())
        .all()
    )

    # ── Performance metrics ──────────────────────────────────────────────
    total_orders = len(orders)
    active_orders = sum(1 for o in orders if o.status in ("confirmed", "active", "delivered"))
    total_assets_count = len(assets)
    deployed_assets = sum(1 for a in assets if a.status == "deployed")

    total_revenue = sum(inv.total for inv in invoices if inv.status == "paid")
    monthly_recurring = sum(o.total_monthly for o in orders if o.status in ("confirmed", "active", "delivered"))
    outstanding = sum(inv.total for inv in invoices if inv.status == "overdue")

    # Avg payment days: average days between invoice created_at and payment paid_at
    payment_days_list = []
    for inv in invoices:
        if inv.payments:
            for pay in inv.payments:
                if pay.status == "completed" and pay.paid_at and inv.created_at:
                    delta = (pay.paid_at - inv.created_at).total_seconds() / 86400
                    payment_days_list.append(delta)
    avg_payment_days = round(sum(payment_days_list) / len(payment_days_list), 1) if payment_days_list else None

    # On-time payment rate: % of invoices paid on or before due_date
    paid_invoices = [inv for inv in invoices if inv.status == "paid"]
    if paid_invoices:
        on_time = sum(
            1 for inv in paid_invoices
            if inv.paid_date and inv.due_date and inv.paid_date <= inv.due_date
        )
        on_time_payment_rate = round((on_time / len(paid_invoices)) * 100, 1)
    else:
        on_time_payment_rate = None

    total_returns = len(returns)
    pending_returns = sum(1 for r in returns if r.status == "pending")
    total_tickets = len(tickets)
    open_tickets = sum(1 for t in tickets if t.status not in ("closed", "resolved"))

    # SLA compliance: % of resolved/closed tickets out of all non-open tickets
    resolved_tickets = sum(1 for t in tickets if t.status in ("resolved", "closed"))
    non_open_tickets = sum(1 for t in tickets if t.status != "open")
    sla_compliance = round((resolved_tickets / non_open_tickets) * 100, 1) if non_open_tickets else None

    credit_available = float(kyc.credit_limit or 0) - float(kyc.credit_used or 0)

    return {
        "profile": {
            "name": kyc.customer_name,
            "email": kyc.customer_email,
            "company_name": kyc.company_name,
            "account_type": kyc.account_type,
            "gstin": kyc.gstin,
            "pan": kyc.pan,
        },
        "kyc": {
            "status": kyc.status,
            "credit_limit": float(kyc.credit_limit or 0),
            "credit_used": float(kyc.credit_used or 0),
            "credit_available": credit_available,
            "documents": kyc.documents or [],
            "reviewer": kyc.reviewer,
            "review_notes": kyc.review_notes,
            "reviewed_at": kyc.reviewed_at.isoformat() if kyc.reviewed_at else None,
        },
        "tier": _compute_tier(kyc.credit_limit),
        "metrics": {
            "total_orders": total_orders,
            "active_orders": active_orders,
            "total_assets": total_assets_count,
            "deployed_assets": deployed_assets,
            "total_revenue": float(total_revenue),
            "monthly_recurring": float(monthly_recurring),
            "outstanding": float(outstanding),
            "avg_payment_days": avg_payment_days,
            "on_time_payment_rate": on_time_payment_rate,
            "total_returns": total_returns,
            "pending_returns": pending_returns,
            "open_tickets": open_tickets,
            "total_tickets": total_tickets,
            "sla_compliance": sla_compliance,
        },
        "orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "total_monthly": o.total_monthly,
                "rental_months": o.rental_months,
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ],
        "assets": [
            {
                "id": a.id,
                "uid": a.uid,
                "oem": a.oem,
                "model": a.model,
                "status": a.status,
                "condition_grade": a.condition_grade,
                "monthly_rate": a.monthly_rate,
            }
            for a in assets
        ],
        "invoices": [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "total": inv.total,
                "status": inv.status,
                "due_date": inv.due_date.isoformat() if inv.due_date else None,
            }
            for inv in invoices
        ],
        "contracts": [
            {
                "id": c.id,
                "contract_number": c.contract_number,
                "status": c.status,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
            }
            for c in contracts
        ],
        "returns": [
            {
                "id": r.id,
                "return_number": r.return_number,
                "status": r.status,
                "reason": r.reason,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in returns
        ],
        "tickets": [
            {
                "id": t.id,
                "ticket_number": t.ticket_number,
                "subject": t.subject,
                "priority": t.priority,
                "status": t.status,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in tickets
        ],
    }
