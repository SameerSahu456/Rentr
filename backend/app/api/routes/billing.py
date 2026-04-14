import logging
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import (
    BillingRun,
    BillingRunStatus,
    Contract,
    ContractStatus,
    Invoice,
    InvoiceStatus,
    Asset,
)

logger = logging.getLogger(__name__)

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


def _next_inv_number(db: Session) -> str:
    count = db.query(func.count(Invoice.id)).scalar() or 0
    return f"INV-{date.today().year}-{count + 1:05d}"


def generate_billing_invoices(db: Session) -> dict:
    """Core billing logic: create invoices for active contracts due for billing.

    For each active contract whose billing cycle is due (based on start_date
    and monthly cadence), creates a draft invoice using the contract's linked
    assets to compute line items.

    Returns a summary dict with the list of created invoices.
    """
    today = date.today()

    # Get all active contracts
    active_contracts = (
        db.query(Contract)
        .filter(
            Contract.status == ContractStatus.active,
            Contract.start_date.isnot(None),
        )
        .all()
    )

    created_invoices = []

    for contract in active_contracts:
        # Determine if this contract is due for billing this month.
        # A contract is due if today >= the next billing date.
        # The billing date each month matches the contract start day-of-month.
        start = contract.start_date
        end = contract.end_date

        # Skip if contract hasn't started yet or has ended
        if start > today:
            continue
        if end and end < today:
            continue

        # Calculate how many months since start
        months_elapsed = (today.year - start.year) * 12 + (today.month - start.month)

        # The next billing date is start + N months where N is the smallest
        # integer such that start + N months > last invoiced month.
        # Check if an invoice already exists for this billing period.
        next_billing = start + relativedelta(months=months_elapsed)
        # If today is before the billing day this month, the billing is for last month's cycle
        if next_billing > today:
            next_billing = start + relativedelta(months=max(0, months_elapsed - 1))

        # Check if invoice already exists for this contract in this billing period
        existing = (
            db.query(Invoice)
            .filter(
                Invoice.contract_id == contract.id,
                Invoice.due_date >= next_billing,
                Invoice.due_date <= next_billing + timedelta(days=15),
            )
            .first()
        )
        if existing:
            continue

        # Build line items from contract's linked assets
        assets = (
            db.query(Asset)
            .filter(Asset.contract_id == contract.id)
            .all()
        )

        if not assets:
            # Also try JSONB assets field on contract
            json_assets = contract.assets or []
            if not json_assets:
                continue
            items = [
                {
                    "description": f"{a.get('oem', '')} {a.get('model', '')} ({a.get('uid', '')})".strip(),
                    "quantity": 1,
                    "unit_price": float(a.get("monthly_rate", 0)),
                }
                for a in json_assets
            ]
        else:
            items = [
                {
                    "description": f"{a.oem} {a.model} ({a.uid})",
                    "quantity": 1,
                    "unit_price": float(a.monthly_rate or 0),
                }
                for a in assets
            ]

        subtotal = sum(item["unit_price"] * item["quantity"] for item in items)
        if subtotal <= 0:
            continue

        gst = round(subtotal * 0.18, 2)
        total = round(subtotal + gst, 2)
        due = next_billing + timedelta(days=15)

        invoice = Invoice(
            invoice_number=_next_inv_number(db),
            customer_name=contract.customer_name,
            customer_email=contract.customer_email,
            contract_id=contract.id,
            items=items,
            total=total,
            gst_amount=gst,
            status=InvoiceStatus.draft,
            due_date=due,
        )
        db.add(invoice)
        db.flush()  # get the id

        created_invoices.append({
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "contract_id": contract.id,
            "contract_number": contract.contract_number,
            "customer_name": contract.customer_name,
            "subtotal": subtotal,
            "gst": gst,
            "total": total,
            "due_date": due.isoformat(),
        })

    if created_invoices:
        # Create a billing run record
        billing_run = BillingRun(
            run_date=today,
            status=BillingRunStatus.completed,
            total_invoices=len(created_invoices),
            total_amount=sum(inv["total"] for inv in created_invoices),
        )
        db.add(billing_run)

    db.commit()

    return {
        "run_date": today.isoformat(),
        "total_invoices_created": len(created_invoices),
        "total_amount": sum(inv["total"] for inv in created_invoices),
        "invoices": created_invoices,
    }


@router.post("/generate-invoices")
def generate_invoices_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate invoices for all active contracts with billing due today or earlier."""
    result = generate_billing_invoices(db)
    return result
