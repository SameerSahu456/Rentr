from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, Asset, Contract, Invoice, KYCSubmission, Order, ReturnRequest, SupportTicket

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    # Order stats
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    active_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status == "active")
        .scalar()
        or 0
    )

    # Invoice stats
    total_invoices = db.query(func.count(Invoice.id)).scalar() or 0
    paid_invoices = (
        db.query(func.count(Invoice.id)).filter(Invoice.status == "paid").scalar() or 0
    )
    pending_invoices = (
        db.query(func.count(Invoice.id))
        .filter(Invoice.status == "pending")
        .scalar()
        or 0
    )
    overdue_invoices = (
        db.query(func.count(Invoice.id))
        .filter(Invoice.status == "overdue")
        .scalar()
        or 0
    )
    total_revenue = (
        db.query(func.coalesce(func.sum(Invoice.total), 0))
        .filter(Invoice.status == "paid")
        .scalar()
    )

    # Ticket stats
    total_tickets = db.query(func.count(SupportTicket.id)).scalar() or 0
    open_tickets = (
        db.query(func.count(SupportTicket.id))
        .filter(SupportTicket.status == "open")
        .scalar()
        or 0
    )
    resolved_tickets = (
        db.query(func.count(SupportTicket.id))
        .filter(SupportTicket.status == "resolved")
        .scalar()
        or 0
    )

    # Contract stats
    total_contracts = db.query(func.count(Contract.id)).scalar() or 0
    active_contracts = (
        db.query(func.count(Contract.id))
        .filter(Contract.status == "active")
        .scalar()
        or 0
    )

    # Recent items
    recent_invoices = (
        db.query(Invoice).order_by(Invoice.created_at.desc()).limit(5).all()
    )
    recent_tickets = (
        db.query(SupportTicket)
        .order_by(SupportTicket.created_at.desc())
        .limit(5)
        .all()
    )

    # Recent orders
    recent_orders = (
        db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    )

    # Asset stats
    total_assets = db.query(func.count(Asset.id)).scalar() or 0
    deployed_assets = (
        db.query(func.count(Asset.id))
        .filter(Asset.status == "deployed")
        .scalar()
        or 0
    )
    in_warehouse_assets = (
        db.query(func.count(Asset.id))
        .filter(Asset.status == "in_warehouse")
        .scalar()
        or 0
    )

    # Return stats
    pending_returns = (
        db.query(func.count(ReturnRequest.id))
        .filter(ReturnRequest.status == "pending")
        .scalar()
        or 0
    )

    # KYC stats
    pending_kyc = (
        db.query(func.count(KYCSubmission.id))
        .filter(KYCSubmission.status == "pending")
        .scalar()
        or 0
    )

    # Alerts
    alerts = []

    if overdue_invoices > 0:
        alerts.append({
            "type": "overdue_invoices",
            "message": f"{overdue_invoices} overdue invoice(s) require attention",
            "urgency": "high",
            "action_url": "/invoices?status=overdue",
        })

    if pending_kyc > 0:
        alerts.append({
            "type": "pending_kyc",
            "message": f"{pending_kyc} KYC submission(s) awaiting review",
            "urgency": "medium",
            "action_url": "/kyc?status=pending",
        })

    # Warranty expiring within 30 days
    thirty_days = date.today() + timedelta(days=30)
    warranty_expiring = (
        db.query(func.count(Asset.id))
        .filter(
            Asset.warranty_expiry.isnot(None),
            Asset.warranty_expiry <= thirty_days,
            Asset.warranty_expiry >= date.today(),
            Asset.status != "retired",
        )
        .scalar()
        or 0
    )
    if warranty_expiring > 0:
        alerts.append({
            "type": "warranty_expiring",
            "message": f"{warranty_expiring} asset(s) with warranty expiring within 30 days",
            "urgency": "medium",
            "action_url": "/assets?warranty_expiring=true",
        })

    # Contracts expiring within 30 days
    contracts_expiring = (
        db.query(func.count(Contract.id))
        .filter(
            Contract.end_date.isnot(None),
            Contract.end_date <= thirty_days,
            Contract.end_date >= date.today(),
            Contract.status == "active",
        )
        .scalar()
        or 0
    )
    if contracts_expiring > 0:
        alerts.append({
            "type": "contract_expiring",
            "message": f"{contracts_expiring} contract(s) expiring within 30 days",
            "urgency": "high",
            "action_url": "/contracts?expiring=true",
        })

    if pending_returns > 0:
        alerts.append({
            "type": "pending_returns",
            "message": f"{pending_returns} return request(s) pending approval",
            "urgency": "medium",
            "action_url": "/returns?status=pending",
        })

    # Monthly recurring revenue from active orders
    monthly_recurring = (
        db.query(func.coalesce(func.sum(Order.total_monthly), 0))
        .filter(Order.status.in_(["active", "confirmed"]))
        .scalar()
    )

    # Outstanding amount from overdue invoices
    outstanding = (
        db.query(func.coalesce(func.sum(Invoice.total), 0))
        .filter(Invoice.status == "overdue")
        .scalar()
    )

    # Overdue invoice details for aging analysis
    overdue_invoice_list = (
        db.query(Invoice)
        .filter(Invoice.status == "overdue")
        .all()
    )

    return {
        "total_orders": total_orders,
        "active_orders": active_orders,
        "total_invoices": total_invoices,
        "paid_invoices": paid_invoices,
        "pending_invoices": pending_invoices,
        "overdue_invoices": overdue_invoices,
        "total_revenue": float(total_revenue),
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "resolved_tickets": resolved_tickets,
        "total_contracts": total_contracts,
        "active_contracts": active_contracts,
        "total_assets": total_assets,
        "deployed_assets": deployed_assets,
        "in_warehouse_assets": in_warehouse_assets,
        "pending_returns": pending_returns,
        "pending_kyc": pending_kyc,
        "monthly_recurring": float(monthly_recurring),
        "outstanding": float(outstanding),
        "overdue_invoice_details": [
            {"id": inv.id, "invoice_number": inv.invoice_number, "total": inv.total,
             "due_date": inv.due_date.isoformat() if inv.due_date else None,
             "customer_name": inv.customer_name}
            for inv in overdue_invoice_list
        ],
        "alerts": alerts,
        "recent_orders": recent_orders,
        "recent_invoices": recent_invoices,
        "recent_tickets": recent_tickets,
    }
