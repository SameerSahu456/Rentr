import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import (
    Contract, ContractStatus, ContractTimeline, ContractReminder,
    ContractAnnexure, AnnexureStatus, Customer, Asset, Invoice, Return, SupportTicket,
)
from app.models.order import Order

router = APIRouter(prefix="/contracts", tags=["Contracts"])


class ContractCreate(BaseModel):
    customer_email: str
    order_id: Optional[int] = None
    type: str = "master_agreement"
    document_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    assets: Optional[List[dict]] = None


class ContractUpdate(BaseModel):
    status: Optional[str] = None
    document_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    assets: Optional[List[dict]] = None


class ContractExtend(BaseModel):
    new_end_date: str
    notes: Optional[str] = None


class ReminderCreate(BaseModel):
    days_before: int
    reminder_type: str
    channel: str


class ReminderToggle(BaseModel):
    is_active: bool


class AnnexureCreate(BaseModel):
    type: str
    asset_uids: Optional[List[str]] = None
    notes: Optional[str] = None


def _next_contract_number(db: Session) -> str:
    from sqlalchemy import func
    count = db.query(func.count(Contract.id)).scalar() or 0
    return f"RENTR-CON-{date.today().year}-{count + 1:05d}"


@router.get("/")
def list_contracts(
    status: str = Query(None),
    search: str = Query(None),
    order_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Contract)
    if status:
        query = query.filter(Contract.status == status)
    if order_id:
        # Accept both integer ID and string order number
        if order_id.isdigit():
            query = query.filter(Contract.order_id == int(order_id))
        else:
            # Non-numeric order_id (e.g. "ORD-00001") — no match in this DB
            query = query.filter(Contract.order_id == -1)
    if search:
        query = query.filter(
            or_(
                Contract.contract_number.ilike(f"%{search}%"),
                Contract.customer_name.ilike(f"%{search}%"),
                Contract.customer_email.ilike(f"%{search}%"),
            )
        )
    contracts = query.order_by(Contract.created_at.desc()).all()
    return {
        "items": [
            {
                "id": c.id,
                "contract_number": c.contract_number,
                "customer_id": c.customer_id,
                "customer_name": c.customer_name,
                "customer_email": c.customer_email,
                "order_id": c.order_id,
                "type": c.type.value if c.type else None,
                "status": c.status.value if c.status else None,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in contracts
        ]
    }


@router.get("/{contract_id}")
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    timeline = (
        db.query(ContractTimeline)
        .filter(ContractTimeline.contract_id == contract.id)
        .order_by(ContractTimeline.timestamp.desc())
        .all()
    )
    reminders = db.query(ContractReminder).filter(ContractReminder.contract_id == contract.id).all()
    annexures = db.query(ContractAnnexure).filter(ContractAnnexure.contract_id == contract.id).all()

    # Linked order
    order_data = None
    if contract.order_id:
        o = db.query(Order).filter(Order.id == contract.order_id).first()
        if o:
            order_data = {
                "id": o.id, "order_number": f"ORD-{o.id:05d}",
                "status": o.status.value if hasattr(o.status, "value") else o.status,
            }

    # Linked assets
    linked_assets = db.query(Asset).filter(Asset.contract_id == contract.id).all()
    assets_data = [
        {"id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model,
         "status": a.status.value if a.status else None,
         "condition_grade": a.condition_grade.value if a.condition_grade else None,
         "monthly_rate": float(a.monthly_rate or 0)}
        for a in linked_assets
    ]

    # Linked invoices
    linked_invoices = db.query(Invoice).filter(Invoice.contract_id == contract.id).order_by(Invoice.created_at.desc()).all()
    invoices_data = [
        {"id": inv.id, "invoice_number": inv.invoice_number, "total": float(inv.total or 0),
         "status": inv.status.value if inv.status else None,
         "due_date": inv.due_date.isoformat() if inv.due_date else None}
        for inv in linked_invoices
    ]

    # Linked returns
    linked_returns = db.query(Return).filter(Return.contract_id == contract.id).order_by(Return.created_at.desc()).all()
    returns_data = [
        {"id": r.id, "return_number": r.return_number, "status": r.status.value if r.status else None,
         "asset_uids": r.asset_uids or []}
        for r in linked_returns
    ]

    # Linked tickets
    linked_tickets = db.query(SupportTicket).filter(SupportTicket.contract_id == contract.id).order_by(SupportTicket.created_at.desc()).all()
    tickets_data = [
        {"id": t.id, "ticket_number": t.ticket_number, "subject": t.subject,
         "priority": t.priority.value if t.priority else None,
         "status": t.status.value if t.status else None}
        for t in linked_tickets
    ]

    return {
        "id": contract.id,
        "contract_number": contract.contract_number,
        "customer_id": contract.customer_id,
        "customer_name": contract.customer_name,
        "customer_email": contract.customer_email,
        "order_id": contract.order_id,
        "order": order_data,
        "type": contract.type.value if contract.type else None,
        "status": contract.status.value if contract.status else None,
        "document_url": contract.document_url,
        "signed_at": contract.signed_at.isoformat() if contract.signed_at else None,
        "start_date": contract.start_date.isoformat() if contract.start_date else None,
        "end_date": contract.end_date.isoformat() if contract.end_date else None,
        "assets": assets_data if assets_data else (contract.assets or []),
        "created_at": contract.created_at.isoformat() if contract.created_at else None,
        "timeline": [
            {
                "id": t.id,
                "action_type": t.action_type,
                "description": t.description,
                "timestamp": t.timestamp.isoformat() if t.timestamp else None,
            }
            for t in timeline
        ],
        "reminders": [
            {
                "id": r.id,
                "days_before": r.days_before,
                "reminder_type": r.reminder_type,
                "channel": r.channel,
                "is_active": r.is_active,
            }
            for r in reminders
        ],
        "annexures": [
            {
                "id": a.id,
                "type": a.type,
                "asset_uids": a.asset_uids or [],
                "notes": a.notes,
                "status": a.status.value if a.status else None,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in annexures
        ],
        "invoices": invoices_data,
        "returns": returns_data,
        "tickets": tickets_data,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_contract(
    payload: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.email == payload.customer_email).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    contract = Contract(
        contract_number=_next_contract_number(db),
        customer_id=customer.id,
        customer_name=customer.name,
        customer_email=customer.email,
        order_id=payload.order_id,
        type=payload.type,
        status=ContractStatus.draft,
        document_url=payload.document_url,
        start_date=date.fromisoformat(payload.start_date) if payload.start_date else None,
        end_date=date.fromisoformat(payload.end_date) if payload.end_date else None,
        assets=payload.assets or [],
    )
    db.add(contract)
    db.flush()

    timeline_entry = ContractTimeline(
        contract_id=contract.id,
        action_type="created",
        description=f"Contract created by {current_user.email}",
    )
    db.add(timeline_entry)
    db.commit()
    db.refresh(contract)
    return {
        "id": contract.id,
        "contract_number": contract.contract_number,
        "status": contract.status.value,
        "created_at": contract.created_at.isoformat() if contract.created_at else None,
    }


@router.put("/{contract_id}")
def update_contract(
    contract_id: int,
    payload: ContractUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if payload.status is not None:
        contract.status = payload.status
    if payload.document_url is not None:
        contract.document_url = payload.document_url
    if payload.start_date is not None:
        contract.start_date = date.fromisoformat(payload.start_date)
    if payload.end_date is not None:
        contract.end_date = date.fromisoformat(payload.end_date)
    if payload.assets is not None:
        contract.assets = payload.assets

    timeline_entry = ContractTimeline(
        contract_id=contract.id,
        action_type="updated",
        description=f"Contract updated by {current_user.email}",
    )
    db.add(timeline_entry)
    db.commit()
    db.refresh(contract)
    return {
        "id": contract.id,
        "contract_number": contract.contract_number,
        "status": contract.status.value if hasattr(contract.status, "value") else contract.status,
    }


@router.post("/{contract_id}/extend")
def extend_contract(
    contract_id: int,
    payload: ContractExtend,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    old_end = contract.end_date.isoformat() if contract.end_date else "N/A"
    contract.end_date = date.fromisoformat(payload.new_end_date)

    timeline_entry = ContractTimeline(
        contract_id=contract.id,
        action_type="extended",
        description=f"End date extended from {old_end} to {payload.new_end_date}. {payload.notes or ''}".strip(),
    )
    db.add(timeline_entry)
    db.commit()
    db.refresh(contract)
    return {
        "id": contract.id,
        "contract_number": contract.contract_number,
        "end_date": contract.end_date.isoformat(),
    }


@router.post("/{contract_id}/resend-signing-link")
def resend_signing_link(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    signing_token = str(uuid.uuid4())

    timeline_entry = ContractTimeline(
        contract_id=contract.id,
        action_type="signing_link_resent",
        description=f"Signing link resent by {current_user.email}",
    )
    db.add(timeline_entry)
    db.commit()
    return {"signing_token": signing_token, "contract_id": contract.id}


@router.get("/{contract_id}/reminders")
def list_reminders(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    reminders = db.query(ContractReminder).filter(ContractReminder.contract_id == contract_id).all()
    return {
        "items": [
            {
                "id": r.id,
                "days_before": r.days_before,
                "reminder_type": r.reminder_type,
                "channel": r.channel,
                "is_active": r.is_active,
            }
            for r in reminders
        ]
    }


@router.post("/{contract_id}/reminders", status_code=status.HTTP_201_CREATED)
def create_reminder(
    contract_id: int,
    payload: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    reminder = ContractReminder(
        contract_id=contract_id,
        days_before=payload.days_before,
        reminder_type=payload.reminder_type,
        channel=payload.channel,
        is_active=True,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return {
        "id": reminder.id,
        "days_before": reminder.days_before,
        "reminder_type": reminder.reminder_type,
        "channel": reminder.channel,
        "is_active": reminder.is_active,
    }


@router.put("/{contract_id}/reminders/{reminder_id}")
def toggle_reminder(
    contract_id: int,
    reminder_id: int,
    payload: ReminderToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reminder = (
        db.query(ContractReminder)
        .filter(ContractReminder.id == reminder_id, ContractReminder.contract_id == contract_id)
        .first()
    )
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    reminder.is_active = payload.is_active
    db.commit()
    db.refresh(reminder)
    return {
        "id": reminder.id,
        "is_active": reminder.is_active,
    }


@router.delete("/{contract_id}/reminders/{reminder_id}")
def delete_reminder(
    contract_id: int,
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    return {"detail": "Reminder deleted"}


@router.post("/{contract_id}/annexures", status_code=status.HTTP_201_CREATED)
def create_annexure(
    contract_id: int,
    payload: AnnexureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    annexure = ContractAnnexure(
        contract_id=contract_id,
        type=payload.type,
        asset_uids=payload.asset_uids or [],
        notes=payload.notes,
        status=AnnexureStatus.draft,
    )
    db.add(annexure)
    db.commit()
    db.refresh(annexure)
    return {
        "id": annexure.id,
        "type": annexure.type,
        "asset_uids": annexure.asset_uids,
        "status": annexure.status.value,
        "created_at": annexure.created_at.isoformat() if annexure.created_at else None,
    }
