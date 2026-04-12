from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_distributor
from app.models.models import (
    DistributorUser, DistributorCustomer, DistributorOrder,
    DistributorContract, DistributorInvoice, DistributorPayment,
    Asset,
)

router = APIRouter(prefix="/dashboard", tags=["distributor-dashboard"])


@router.get("/")
def distributor_dashboard(
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    dist_id = current.id

    total_customers = db.query(func.count(DistributorCustomer.id)).filter(
        DistributorCustomer.distributor_id == dist_id
    ).scalar() or 0

    total_orders = db.query(func.count(DistributorOrder.id)).filter(
        DistributorOrder.distributor_id == dist_id
    ).scalar() or 0

    active_orders = db.query(func.count(DistributorOrder.id)).filter(
        DistributorOrder.distributor_id == dist_id,
        DistributorOrder.status.in_(["confirmed", "active"]),
    ).scalar() or 0

    total_contracts = db.query(func.count(DistributorContract.id)).filter(
        DistributorContract.distributor_id == dist_id
    ).scalar() or 0

    active_contracts = db.query(func.count(DistributorContract.id)).filter(
        DistributorContract.distributor_id == dist_id,
        DistributorContract.status == "active",
    ).scalar() or 0

    # Revenue from invoices
    total_revenue = db.query(func.coalesce(func.sum(DistributorInvoice.total), 0)).filter(
        DistributorInvoice.distributor_id == dist_id,
        DistributorInvoice.status == "paid",
    ).scalar() or 0

    total_outstanding = db.query(func.coalesce(func.sum(DistributorInvoice.total), 0)).filter(
        DistributorInvoice.distributor_id == dist_id,
        DistributorInvoice.status.in_(["sent", "overdue"]),
    ).scalar() or 0

    # Monthly spread (profit)
    total_spread = db.query(func.coalesce(func.sum(DistributorOrder.spread), 0)).filter(
        DistributorOrder.distributor_id == dist_id,
        DistributorOrder.status.in_(["confirmed", "active"]),
    ).scalar() or 0

    # Assets deployed to this distributor (from Rentr's asset table)
    total_assets = db.query(func.count(Asset.id)).filter(
        Asset.customer_email == current.partner_email,
        Asset.status == "deployed",
    ).scalar() or 0 if current.partner_email else 0

    # Recent orders
    recent_orders = (
        db.query(DistributorOrder)
        .filter(DistributorOrder.distributor_id == dist_id)
        .order_by(DistributorOrder.created_at.desc())
        .limit(5)
        .all()
    )

    # Recent invoices
    recent_invoices = (
        db.query(DistributorInvoice)
        .filter(DistributorInvoice.distributor_id == dist_id)
        .order_by(DistributorInvoice.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_customers": total_customers,
        "total_orders": total_orders,
        "active_orders": active_orders,
        "total_contracts": total_contracts,
        "active_contracts": active_contracts,
        "total_revenue": float(total_revenue),
        "total_outstanding": float(total_outstanding),
        "monthly_spread": float(total_spread),
        "total_assets": total_assets,
        "credit_limit": current.credit_limit,
        "credit_used": current.credit_used,
        "recent_orders": [
            {
                "id": o.id, "order_number": o.order_number, "customer_name": o.customer_name,
                "total_monthly": o.total_monthly, "spread": o.spread, "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in recent_orders
        ],
        "recent_invoices": [
            {
                "id": i.id, "invoice_number": i.invoice_number, "customer_name": i.customer_name,
                "total": i.total, "status": i.status, "due_date": i.due_date.isoformat() if i.due_date else None,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in recent_invoices
        ],
    }
