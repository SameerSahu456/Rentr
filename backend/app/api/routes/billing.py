from datetime import date

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import BillingRun, BillingRunStatus

router = APIRouter(prefix="/billing", tags=["Billing"])


class BillingRunCreate(BaseModel):
    run_date: Optional[str] = None


@router.get("/runs")
def list_billing_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    runs = db.query(BillingRun).order_by(BillingRun.created_at.desc()).all()
    return {
        "items": [
            {
                "id": r.id,
                "run_date": r.run_date.isoformat() if r.run_date else None,
                "status": r.status.value if r.status else None,
                "total_invoices": r.total_invoices,
                "total_amount": r.total_amount,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in runs
        ]
    }


@router.get("/tally-status")
def get_tally_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    last_run = db.query(BillingRun).order_by(BillingRun.created_at.desc()).first()
    return {
        "last_sync": last_run.created_at.isoformat() if last_run and last_run.created_at else None,
        "status": "synced" if last_run and last_run.status == BillingRunStatus.completed else "pending",
        "total_invoices_synced": last_run.total_invoices if last_run else 0,
    }


@router.post("/runs", status_code=status.HTTP_201_CREATED)
def create_billing_run(
    payload: BillingRunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    run_date = date.fromisoformat(payload.run_date) if payload.run_date else date.today()
    billing_run = BillingRun(
        run_date=run_date,
        status=BillingRunStatus.pending,
        total_invoices=0,
        total_amount=0,
    )
    db.add(billing_run)
    db.commit()
    db.refresh(billing_run)
    return {
        "id": billing_run.id,
        "run_date": billing_run.run_date.isoformat(),
        "status": billing_run.status.value,
        "created_at": billing_run.created_at.isoformat() if billing_run.created_at else None,
    }


@router.post("/tally-sync")
def trigger_tally_sync(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # In production, this would trigger an async task to sync with Tally
    return {
        "detail": "Tally sync triggered",
        "status": "queued",
    }
