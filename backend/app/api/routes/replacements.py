from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import Replacement

router = APIRouter(prefix="/replacements", tags=["Replacements"])


class ReplacementUpdate(BaseModel):
    status: Optional[str] = None
    replacement_asset_uid: Optional[str] = None
    damage_charges: Optional[float] = None


@router.get("/")
def list_replacements(
    replacement_type: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Replacement)
    if replacement_type:
        query = query.filter(Replacement.replacement_type == replacement_type)
    if status:
        query = query.filter(Replacement.status == status)
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


@router.get("/{replacement_id}")
def get_replacement(
    replacement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    replacement = db.query(Replacement).filter(Replacement.id == replacement_id).first()
    if not replacement:
        raise HTTPException(status_code=404, detail="Replacement not found")
    return {
        "id": replacement.id,
        "replacement_number": replacement.replacement_number,
        "replacement_type": replacement.replacement_type.value if replacement.replacement_type else None,
        "order_id": replacement.order_id,
        "customer_name": replacement.customer_name,
        "ticket_id": replacement.ticket_id,
        "faulty_asset_uid": replacement.faulty_asset_uid,
        "replacement_asset_uid": replacement.replacement_asset_uid,
        "faulty_reason": replacement.faulty_reason,
        "status": replacement.status.value if replacement.status else None,
        "damage_charges": replacement.damage_charges,
        "timeline": replacement.timeline or [],
        "created_at": replacement.created_at.isoformat() if replacement.created_at else None,
    }


@router.put("/{replacement_id}")
def update_replacement(
    replacement_id: int,
    payload: ReplacementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    replacement = db.query(Replacement).filter(Replacement.id == replacement_id).first()
    if not replacement:
        raise HTTPException(status_code=404, detail="Replacement not found")

    if payload.status is not None:
        from datetime import datetime, timezone
        timeline = list(replacement.timeline or [])
        timeline.append({
            "status": payload.status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        replacement.timeline = timeline
        replacement.status = payload.status
    if payload.replacement_asset_uid is not None:
        replacement.replacement_asset_uid = payload.replacement_asset_uid
    if payload.damage_charges is not None:
        replacement.damage_charges = payload.damage_charges

    db.commit()
    db.refresh(replacement)
    return {
        "id": replacement.id,
        "replacement_number": replacement.replacement_number,
        "status": replacement.status.value if hasattr(replacement.status, "value") else replacement.status,
    }
