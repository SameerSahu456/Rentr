from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import Replacement, ReplacementType, ReplacementStatus

router = APIRouter(prefix="/advance-replacements", tags=["Advance Replacements"])


class AdvanceReplacementCreate(BaseModel):
    customer_name: str
    order_id: Optional[int] = None
    ticket_id: Optional[int] = None
    faulty_asset_uid: Optional[str] = None
    replacement_asset_uid: Optional[str] = None
    faulty_reason: Optional[str] = None


def _next_replacement_number(db: Session) -> str:
    count = db.query(func.count(Replacement.id)).scalar() or 0
    return f"RENTR-REP-{date.today().year}-{count + 1:05d}"


@router.get("/")
def list_advance_replacements(
    status: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Replacement).filter(Replacement.replacement_type == ReplacementType.advance)
    if status:
        query = query.filter(Replacement.status == status)
    if search:
        query = query.filter(
            or_(
                Replacement.replacement_number.ilike(f"%{search}%"),
                Replacement.customer_name.ilike(f"%{search}%"),
                Replacement.faulty_asset_uid.ilike(f"%{search}%"),
            )
        )
    replacements = query.order_by(Replacement.created_at.desc()).all()
    return {
        "items": [
            {
                "id": r.id,
                "replacement_number": r.replacement_number,
                "replacement_type": r.replacement_type.value if r.replacement_type else None,
                "order_id": r.order_id,
                "customer_name": r.customer_name,
                "ticket_id": r.ticket_id,
                "faulty_asset_uid": r.faulty_asset_uid,
                "replacement_asset_uid": r.replacement_asset_uid,
                "faulty_reason": r.faulty_reason,
                "status": r.status.value if r.status else None,
                "damage_charges": r.damage_charges,
                "timeline": r.timeline or [],
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in replacements
        ]
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_advance_replacement(
    payload: AdvanceReplacementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    replacement = Replacement(
        replacement_number=_next_replacement_number(db),
        replacement_type=ReplacementType.advance,
        order_id=payload.order_id,
        customer_name=payload.customer_name,
        ticket_id=payload.ticket_id,
        faulty_asset_uid=payload.faulty_asset_uid,
        replacement_asset_uid=payload.replacement_asset_uid,
        faulty_reason=payload.faulty_reason,
        status=ReplacementStatus.initiated,
        timeline=[],
    )
    db.add(replacement)
    db.commit()
    db.refresh(replacement)
    return {
        "id": replacement.id,
        "replacement_number": replacement.replacement_number,
        "replacement_type": replacement.replacement_type.value,
        "status": replacement.status.value,
        "created_at": replacement.created_at.isoformat() if replacement.created_at else None,
    }
