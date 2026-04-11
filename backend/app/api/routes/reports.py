from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import (
    Asset, AssetStatus, Contract, ContractStatus, Invoice, InvoiceStatus,
    SupportTicket, TicketStatus, Return, ReturnStatus,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


# In-memory store for scheduled reports (in production, use a DB table)
_scheduled_reports: list = []


class ScheduledReportCreate(BaseModel):
    name: str
    report_type: str
    schedule: str  # e.g. "daily", "weekly", "monthly"
    recipients: Optional[list] = None
    filters: Optional[dict] = None


@router.get("/scheduled")
def list_scheduled_reports(
    current_user: User = Depends(get_current_user),
):
    return {
        "items": _scheduled_reports
    }


@router.post("/scheduled", status_code=status.HTTP_201_CREATED)
def create_scheduled_report(
    payload: ScheduledReportCreate,
    current_user: User = Depends(get_current_user),
):
    report = {
        "id": len(_scheduled_reports) + 1,
        "name": payload.name,
        "report_type": payload.report_type,
        "schedule": payload.schedule,
        "recipients": payload.recipients or [],
        "filters": payload.filters or {},
        "created_by": current_user.email,
    }
    _scheduled_reports.append(report)
    return report


@router.get("/custom")
def get_custom_report(
    report_type: str = Query("overview"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if report_type == "assets":
        total = db.query(func.count(Asset.id)).scalar() or 0
        deployed = db.query(func.count(Asset.id)).filter(Asset.status == AssetStatus.deployed).scalar() or 0
        in_warehouse = db.query(func.count(Asset.id)).filter(Asset.status == AssetStatus.in_warehouse).scalar() or 0
        in_repair = db.query(func.count(Asset.id)).filter(Asset.status == AssetStatus.in_repair).scalar() or 0
        return {
            "report_type": "assets",
            "data": {
                "total": total,
                "deployed": deployed,
                "in_warehouse": in_warehouse,
                "in_repair": in_repair,
            },
        }

    elif report_type == "revenue":
        total_invoiced = db.query(func.coalesce(func.sum(Invoice.total), 0)).scalar() or 0
        total_paid = (
            db.query(func.coalesce(func.sum(Invoice.total), 0))
            .filter(Invoice.status == InvoiceStatus.paid)
            .scalar() or 0
        )
        total_overdue = (
            db.query(func.coalesce(func.sum(Invoice.total), 0))
            .filter(Invoice.status == InvoiceStatus.overdue)
            .scalar() or 0
        )
        return {
            "report_type": "revenue",
            "data": {
                "total_invoiced": float(total_invoiced),
                "total_paid": float(total_paid),
                "total_overdue": float(total_overdue),
            },
        }

    elif report_type == "contracts":
        total = db.query(func.count(Contract.id)).scalar() or 0
        active = db.query(func.count(Contract.id)).filter(Contract.status == ContractStatus.active).scalar() or 0
        expiring = db.query(func.count(Contract.id)).filter(Contract.status == ContractStatus.expiring).scalar() or 0
        expired = db.query(func.count(Contract.id)).filter(Contract.status == ContractStatus.expired).scalar() or 0
        return {
            "report_type": "contracts",
            "data": {
                "total": total,
                "active": active,
                "expiring": expiring,
                "expired": expired,
            },
        }

    elif report_type == "support":
        total = db.query(func.count(SupportTicket.id)).scalar() or 0
        open_tickets = db.query(func.count(SupportTicket.id)).filter(SupportTicket.status == TicketStatus.open).scalar() or 0
        in_progress = db.query(func.count(SupportTicket.id)).filter(SupportTicket.status == TicketStatus.in_progress).scalar() or 0
        resolved = db.query(func.count(SupportTicket.id)).filter(SupportTicket.status == TicketStatus.resolved).scalar() or 0
        return {
            "report_type": "support",
            "data": {
                "total": total,
                "open": open_tickets,
                "in_progress": in_progress,
                "resolved": resolved,
            },
        }

    # Default overview
    total_assets = db.query(func.count(Asset.id)).scalar() or 0
    total_contracts = db.query(func.count(Contract.id)).scalar() or 0
    total_invoices = db.query(func.count(Invoice.id)).scalar() or 0
    total_tickets = db.query(func.count(SupportTicket.id)).scalar() or 0
    total_returns = db.query(func.count(Return.id)).scalar() or 0
    return {
        "report_type": "overview",
        "data": {
            "total_assets": total_assets,
            "total_contracts": total_contracts,
            "total_invoices": total_invoices,
            "total_tickets": total_tickets,
            "total_returns": total_returns,
        },
    }
