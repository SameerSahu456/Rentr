from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.order import Order
from app.models.rental import Asset, Contract, Invoice, SupportTicket, Return

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return aggregate stats for the admin dashboard."""
    # Orders
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar() or 0
    pending_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status.in_(["pending", "confirmed", "processing"]))
        .scalar() or 0
    )

    # Assets
    total_assets = db.query(func.count(Asset.id)).scalar() or 0
    deployed_assets = db.query(func.count(Asset.id)).filter(Asset.status == "deployed").scalar() or 0
    in_warehouse_assets = db.query(func.count(Asset.id)).filter(Asset.status == "in_warehouse").scalar() or 0

    # Contracts
    active_contracts = db.query(func.count(Contract.id)).filter(Contract.status.in_(["active", "expiring"])).scalar() or 0

    # Invoices
    total_invoices = db.query(func.count(Invoice.id)).scalar() or 0
    invoice_revenue = db.query(func.coalesce(func.sum(Invoice.total), 0)).scalar() or 0

    # Tickets
    open_tickets = db.query(func.count(SupportTicket.id)).filter(SupportTicket.status.in_(["open", "in_progress", "waiting"])).scalar() or 0

    # Recent orders
    recent_orders_q = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = []
    for o in recent_orders_q:
        customer = db.query(User).filter(User.id == o.user_id).first()
        recent_orders.append({
            "id": o.id,
            "order_number": f"ORD-{o.id:05d}",
            "customer_name": customer.full_name if customer else "Unknown",
            "customer_email": customer.email if customer else "",
            "total_monthly": float(o.total_amount or 0),
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })

    # Recent invoices
    recent_invoices_q = db.query(Invoice).order_by(Invoice.created_at.desc()).limit(5).all()
    recent_invoices = [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "customer_name": inv.customer_name,
            "customer_email": inv.customer_email,
            "total": float(inv.total or 0),
            "status": inv.status,
            "due_date": inv.due_date.isoformat() if inv.due_date else None,
        }
        for inv in recent_invoices_q
    ]

    # Recent tickets
    recent_tickets_q = db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).limit(5).all()
    recent_tickets = [
        {
            "id": t.id,
            "ticket_number": t.ticket_number,
            "subject": t.subject,
            "customer_name": t.customer_name,
            "priority": t.priority,
            "status": t.status,
        }
        for t in recent_tickets_q
    ]

    # Alerts
    alerts = []
    overdue_invoices = db.query(func.count(Invoice.id)).filter(Invoice.status == "overdue").scalar() or 0
    if overdue_invoices > 0:
        alerts.append({"message": f"{overdue_invoices} invoices are overdue and require attention", "urgency": "high", "action_url": "/invoices"})

    expiring_contracts = db.query(func.count(Contract.id)).filter(Contract.status == "expiring").scalar() or 0
    if expiring_contracts > 0:
        alerts.append({"message": f"{expiring_contracts} contracts expiring soon — review for renewal", "urgency": "medium", "action_url": "/contracts"})

    pending_returns = db.query(func.count(Return.id)).filter(Return.status.in_(["initiated", "pickup_scheduled"])).scalar() or 0
    if pending_returns > 0:
        alerts.append({"message": f"{pending_returns} return requests pending pickup", "urgency": "medium", "action_url": "/returns"})

    critical_tickets = db.query(func.count(SupportTicket.id)).filter(SupportTicket.priority == "critical", SupportTicket.status.in_(["open", "in_progress"])).scalar() or 0
    if critical_tickets > 0:
        alerts.append({"message": f"{critical_tickets} critical support tickets require immediate action", "urgency": "high", "action_url": "/support"})

    return {
        "stats": {
            "total_orders": total_orders,
            "total_invoices": total_invoices,
            "total_revenue": float(max(total_revenue, invoice_revenue)),
            "open_tickets": open_tickets,
            "active_contracts": active_contracts,
            "total_assets": total_assets,
            "deployed_assets": deployed_assets,
            "in_warehouse_assets": in_warehouse_assets,
            "pending_orders": pending_orders,
        },
        "alerts": alerts,
        "recent_orders": recent_orders,
        "recent_invoices": recent_invoices,
        "recent_tickets": recent_tickets,
    }
