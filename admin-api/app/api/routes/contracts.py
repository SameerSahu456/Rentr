import base64
import os
import uuid
from datetime import datetime, date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    AdminUser, Asset, Contract, ContractReminder, ContractReminderLog,
    Invoice, Order, Payment, ReturnRequest, SupportTicket,
)
from app.schemas.schemas import (
    ContractCreate,
    ContractExtendRequest,
    ContractResponse,
    ContractSigningInfo,
    ContractUpdate,
    ReminderCreate,
    ReminderResponse,
    ReminderUpdate,
    SignatureSubmit,
)

router = APIRouter(prefix="/contracts", tags=["contracts"])


def _generate_contract_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"CTR-{year}-"
    last = (
        db.query(Contract)
        .filter(Contract.contract_number.like(f"{prefix}%"))
        .order_by(Contract.contract_number.desc())
        .first()
    )
    if last:
        seq = int(last.contract_number.split("-")[-1]) + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"


# ── Public signing endpoints (no auth) ──────────────────────────────────────


@router.get("/sign/{signing_token}", response_model=ContractSigningInfo)
def get_contract_for_signing(signing_token: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.signing_token == signing_token).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.status != "pending_signature":
        raise HTTPException(status_code=400, detail="Contract already signed or not pending")
    return contract


@router.post("/sign/{signing_token}")
def submit_signature(
    signing_token: str,
    payload: SignatureSubmit,
    db: Session = Depends(get_db),
):
    contract = db.query(Contract).filter(Contract.signing_token == signing_token).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.status != "pending_signature":
        raise HTTPException(status_code=400, detail="Contract already signed or not pending")

    # Save signature image
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    media_root = os.path.join(base_dir, "media")
    sig_dir = os.path.join(media_root, "signatures")
    os.makedirs(sig_dir, exist_ok=True)

    sig_filename = f"{contract.contract_number}.png"
    sig_path = os.path.join(sig_dir, sig_filename)

    img_data = base64.b64decode(payload.signature_data)
    with open(sig_path, "wb") as f:
        f.write(img_data)

    # Update contract
    contract.signature_url = f"/media/signatures/{sig_filename}"
    contract.status = "active"
    contract.signed_at = datetime.utcnow()
    contract.signing_token = None  # Invalidate token

    # Regenerate PDF with embedded signature
    order = db.query(Order).filter(Order.order_number == contract.order_id).first()
    if order:
        from app.services.contract_pdf import generate_contract_pdf
        document_url = generate_contract_pdf(contract, order, media_root=media_root)
        contract.document_url = document_url

    db.commit()
    db.refresh(contract)
    return {"status": "signed", "contract_number": contract.contract_number}


# ── Admin endpoints ─────────────────────────────────────────────────────────


@router.get("/")
def list_contracts(
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_email: Optional[str] = None,
    order_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(Contract)
    if status_filter:
        query = query.filter(Contract.status == status_filter)
    if customer_email:
        query = query.filter(Contract.customer_email.ilike(f"%{customer_email}%"))
    if order_id:
        query = query.filter(Contract.order_id == order_id)

    total = query.count()
    items = query.order_by(Contract.created_at.desc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


# ── Global reminder endpoints (must be before {contract_id} routes) ────────


@router.get("/reminders/due")
def get_due_reminders(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Get all reminders that are due today or overdue (for dashboard)."""
    today = date.today()
    due_reminders = (
        db.query(ContractReminder)
        .filter(
            ContractReminder.is_active == True,
            ContractReminder.next_trigger_date <= today,
        )
        .all()
    )
    results = []
    for r in due_reminders:
        contract = db.query(Contract).filter(Contract.id == r.contract_id).first()
        if contract:
            results.append({
                "reminder_id": r.id,
                "contract_id": contract.id,
                "contract_number": contract.contract_number,
                "customer_name": contract.customer_name,
                "customer_email": contract.customer_email,
                "end_date": str(contract.end_date) if contract.end_date else None,
                "days_before": r.days_before,
                "reminder_type": r.reminder_type,
                "channel": r.channel,
                "days_until_expiry": (contract.end_date - today).days if contract.end_date else None,
            })
    return results


@router.post("/reminders/{reminder_id}/send")
def send_reminder_now(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Manually trigger sending a reminder and log it."""
    reminder = db.query(ContractReminder).filter(ContractReminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    contract = db.query(Contract).filter(Contract.id == reminder.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    days_left = (contract.end_date - date.today()).days if contract.end_date else 0
    message = (
        f"Dear {contract.customer_name},\n\n"
        f"This is a reminder that your rental contract {contract.contract_number} "
        f"is expiring on {contract.end_date}. "
        f"You have {days_left} days remaining.\n\n"
        f"Please contact us to renew or extend your contract.\n\n"
        f"Best regards,\nRentr Team"
    )

    log = ContractReminderLog(
        reminder_id=reminder.id,
        contract_id=contract.id,
        channel=reminder.channel,
        status="sent",
        recipient_email=contract.customer_email,
        message_preview=message[:500],
    )
    db.add(log)

    reminder.last_sent_at = datetime.utcnow()
    if contract.end_date:
        next_trigger = contract.end_date - timedelta(days=reminder.days_before)
        if next_trigger > date.today():
            reminder.next_trigger_date = next_trigger
        else:
            reminder.next_trigger_date = None

    db.commit()
    db.refresh(reminder)

    return {
        "status": "sent",
        "message_preview": message,
        "recipient": contract.customer_email,
        "channel": reminder.channel,
    }


@router.post("/", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
def create_contract(
    payload: ContractCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    contract_number = _generate_contract_number(db)
    contract = Contract(**payload.model_dump(), contract_number=contract_number)
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract


@router.get("/{contract_id}")
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

    contract_dict = {c.name: getattr(contract, c.name) for c in Contract.__table__.columns}

    # Linked order
    if contract.order_id:
        order_obj = db.query(Order).filter(Order.order_number == contract.order_id).first()
        if order_obj:
            contract_dict["order"] = {
                "id": order_obj.id, "order_number": order_obj.order_number,
                "status": order_obj.status, "customer_name": order_obj.customer_name,
                "total_monthly": order_obj.total_monthly, "rental_months": order_obj.rental_months,
            }

        # Linked assets for this order
        assets = db.query(Asset).filter(Asset.order_id == contract.order_id).all()
        contract_dict["assets"] = [
            {"id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model,
             "category": a.category, "status": a.status,
             "condition_grade": a.condition_grade, "monthly_rate": a.monthly_rate}
            for a in assets
        ]

        # Linked invoices
        invoices = db.query(Invoice).filter(Invoice.order_id == contract.order_id).all()
        contract_dict["invoices"] = [
            {"id": inv.id, "invoice_number": inv.invoice_number,
             "total": inv.total, "status": inv.status, "due_date": inv.due_date}
            for inv in invoices
        ]

        # Linked returns
        returns = db.query(ReturnRequest).filter(ReturnRequest.order_id == contract.order_id).all()
        contract_dict["returns"] = [
            {"id": r.id, "return_number": r.return_number, "status": r.status,
             "reason": r.reason, "asset_uids": r.asset_uids}
            for r in returns
        ]

        # Linked support tickets
        tickets = db.query(SupportTicket).filter(SupportTicket.order_id == contract.order_id).all()
        contract_dict["tickets"] = [
            {"id": t.id, "ticket_number": t.ticket_number, "subject": t.subject,
             "priority": t.priority, "status": t.status, "category": t.category}
            for t in tickets
        ]

        # Linked payments (via invoices)
        invoice_ids = [inv.id for inv in invoices]
        if invoice_ids:
            payments = db.query(Payment).filter(Payment.invoice_id.in_(invoice_ids)).all()
            contract_dict["payments"] = [
                {"id": p.id, "amount": p.amount, "method": p.method,
                 "status": p.status, "transaction_id": p.transaction_id, "paid_at": p.paid_at}
                for p in payments
            ]
        else:
            contract_dict["payments"] = []
    else:
        contract_dict["order"] = None
        contract_dict["assets"] = []
        contract_dict["invoices"] = []
        contract_dict["returns"] = []
        contract_dict["tickets"] = []
        contract_dict["payments"] = []

    return contract_dict


@router.put("/{contract_id}", response_model=ContractResponse)
def update_contract(
    contract_id: int,
    payload: ContractUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(contract, field, value)
    db.commit()
    db.refresh(contract)
    return contract


@router.post("/{contract_id}/extend")
def extend_contract(
    contract_id: int,
    payload: ContractExtendRequest,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Extend a contract by N months. Saves original end date on first extension."""
    from dateutil.relativedelta import relativedelta

    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.status not in ("active", "expired"):
        raise HTTPException(status_code=400, detail="Only active or expired contracts can be extended")
    if not contract.end_date:
        raise HTTPException(status_code=400, detail="Contract has no end date to extend")

    # Save original end date on first extension
    if not contract.original_end_date:
        contract.original_end_date = contract.end_date

    new_end = contract.end_date + relativedelta(months=payload.extend_months)
    contract.end_date = new_end
    contract.extended_months = (contract.extended_months or 0) + payload.extend_months

    # Reactivate if expired
    if contract.status == "expired":
        contract.status = "active"

    # Update rental_months on linked order
    if contract.order_id:
        order = db.query(Order).filter(Order.order_number == contract.order_id).first()
        if order:
            order.rental_months = (order.rental_months or 0) + payload.extend_months

    db.commit()
    db.refresh(contract)

    # Return full contract dict with cross-links
    contract_dict = {c.name: getattr(contract, c.name) for c in Contract.__table__.columns}
    contract_dict["extension_info"] = {
        "original_end_date": contract.original_end_date,
        "extended_months": contract.extended_months,
        "new_end_date": contract.end_date,
        "reason": payload.reason,
    }
    return contract_dict


@router.post("/{contract_id}/resend-signing-link")
def resend_signing_link(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.status != "pending_signature":
        raise HTTPException(status_code=400, detail="Contract is not pending signature")

    if not contract.signing_token:
        contract.signing_token = str(uuid.uuid4())
        db.commit()
        db.refresh(contract)

    return {"signing_token": contract.signing_token, "customer_email": contract.customer_email}


@router.get("/{contract_id}/pdf")
def download_contract_pdf(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if not contract.document_url:
        raise HTTPException(status_code=404, detail="No PDF available for this contract")

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    file_path = os.path.join(base_dir, contract.document_url.lstrip("/"))
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"{contract.contract_number}.pdf",
    )


@router.post("/{contract_id}/regenerate-pdf", response_model=ContractResponse)
def regenerate_contract_pdf(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    order = db.query(Order).filter(Order.order_number == contract.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Associated order not found")

    from app.services.contract_pdf import generate_contract_pdf

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    media_root = os.path.join(base_dir, "media")
    document_url = generate_contract_pdf(contract, order, media_root=media_root)
    contract.document_url = document_url
    db.commit()
    db.refresh(contract)
    return contract


# ── Contract Reminder endpoints ────────────────────────────────────────────


def _compute_next_trigger(contract_end_date, days_before):
    """Compute the next trigger date based on end_date and days_before."""
    if not contract_end_date:
        return None
    trigger = contract_end_date - timedelta(days=days_before)
    if trigger <= date.today():
        return None  # already past
    return trigger


@router.get("/{contract_id}/reminders", response_model=list[ReminderResponse])
def list_reminders(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    reminders = (
        db.query(ContractReminder)
        .filter(ContractReminder.contract_id == contract_id)
        .order_by(ContractReminder.days_before.desc())
        .all()
    )
    return reminders


@router.post("/{contract_id}/reminders", response_model=ReminderResponse, status_code=201)
def create_reminder(
    contract_id: int,
    payload: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    next_trigger = _compute_next_trigger(contract.end_date, payload.days_before)

    reminder = ContractReminder(
        contract_id=contract_id,
        reminder_type=payload.reminder_type,
        days_before=payload.days_before,
        channel=payload.channel,
        is_active=True,
        next_trigger_date=next_trigger,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.put("/{contract_id}/reminders/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    contract_id: int,
    reminder_id: int,
    payload: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    reminder = (
        db.query(ContractReminder)
        .filter(ContractReminder.id == reminder_id, ContractReminder.contract_id == contract_id)
        .first()
    )
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(reminder, field, value)

    # Recompute next trigger if days_before changed
    if payload.days_before is not None:
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if contract:
            reminder.next_trigger_date = _compute_next_trigger(contract.end_date, reminder.days_before)

    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{contract_id}/reminders/{reminder_id}", status_code=204)
def delete_reminder(
    contract_id: int,
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    reminder = (
        db.query(ContractReminder)
        .filter(ContractReminder.id == reminder_id, ContractReminder.contract_id == contract_id)
        .first()
    )
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(reminder)
    db.commit()
    return None


