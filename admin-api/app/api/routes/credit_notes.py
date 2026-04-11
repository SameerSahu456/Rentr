from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, CreditNote
from app.schemas.schemas import (
    CreditNoteCreate,
    CreditNoteResponse,
    CreditNoteUpdate,
)

router = APIRouter(prefix="/credit-notes", tags=["credit-notes"])


def _generate_cn_number(db: Session, note_type: str) -> str:
    year = datetime.utcnow().year
    prefix_code = "CN" if note_type == "credit" else "DN"
    prefix = f"{prefix_code}-{year}-"
    last = (
        db.query(CreditNote)
        .filter(CreditNote.cn_number.like(f"{prefix}%"))
        .order_by(CreditNote.cn_number.desc())
        .first()
    )
    seq = int(last.cn_number.split("-")[-1]) + 1 if last else 1
    return f"{prefix}{seq:04d}"


@router.get("/")
def list_credit_notes(
    note_type: Optional[str] = None,
    order_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_email: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(CreditNote)
    if note_type:
        query = query.filter(CreditNote.note_type == note_type)
    if order_id:
        query = query.filter(CreditNote.order_id == order_id)
    if status_filter:
        query = query.filter(CreditNote.status == status_filter)
    if customer_email:
        query = query.filter(CreditNote.customer_email == customer_email)

    total = query.count()
    items = query.order_by(CreditNote.created_at.desc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_credit_note(
    payload: CreditNoteCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    cn_number = _generate_cn_number(db, payload.note_type)
    cn = CreditNote(
        cn_number=cn_number,
        **payload.model_dump(),
    )
    db.add(cn)
    db.commit()
    db.refresh(cn)
    return cn


@router.get("/{cn_id}")
def get_credit_note(
    cn_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    cn = db.query(CreditNote).filter(CreditNote.id == cn_id).first()
    if not cn:
        raise HTTPException(status_code=404, detail="Credit/Debit note not found")
    return cn


@router.put("/{cn_id}")
def update_credit_note(
    cn_id: int,
    payload: CreditNoteUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    cn = db.query(CreditNote).filter(CreditNote.id == cn_id).first()
    if not cn:
        raise HTTPException(status_code=404, detail="Credit/Debit note not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(cn, field, value)

    db.commit()
    db.refresh(cn)
    return cn
