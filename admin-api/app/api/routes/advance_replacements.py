from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, AdvanceReplacement, Asset, AssetLifecycleEvent
from app.schemas.schemas import (
    AdvanceReplacementCreate,
    AdvanceReplacementResponse,
    AdvanceReplacementUpdate,
)

router = APIRouter(prefix="/advance-replacements", tags=["advance-replacements"])


@router.get("/")
def list_advance_replacements(
    order_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(AdvanceReplacement)
    if order_id:
        query = query.filter(AdvanceReplacement.order_id == order_id)
    if status_filter:
        query = query.filter(AdvanceReplacement.status == status_filter)

    total = query.count()
    items = query.order_by(AdvanceReplacement.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for ar in items:
        faulty = db.query(Asset).filter(Asset.id == ar.faulty_asset_id).first() if ar.faulty_asset_id else None
        repl = db.query(Asset).filter(Asset.id == ar.replacement_asset_id).first() if ar.replacement_asset_id else None
        row = {c.name: getattr(ar, c.name) for c in AdvanceReplacement.__table__.columns}
        row["faulty_model"] = f"{faulty.oem} {faulty.model}" if faulty else None
        row["replacement_model"] = f"{repl.oem} {repl.model}" if repl else None
        result.append(row)

    return {"items": result, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_advance_replacement(
    payload: AdvanceReplacementCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Initiate an advance replacement: mark faulty asset, optionally assign replacement."""
    faulty = db.query(Asset).filter(Asset.uid == payload.faulty_asset_uid).first()
    if not faulty:
        raise HTTPException(status_code=404, detail="Faulty asset not found")

    replacement = None
    replacement_id = None
    if payload.replacement_asset_uid:
        replacement = db.query(Asset).filter(Asset.uid == payload.replacement_asset_uid).first()
        if not replacement:
            raise HTTPException(status_code=404, detail="Replacement asset not found")
        replacement_id = replacement.id

    ar = AdvanceReplacement(
        order_id=payload.order_id,
        return_id=payload.return_id,
        faulty_asset_id=faulty.id,
        faulty_asset_uid=payload.faulty_asset_uid,
        replacement_asset_id=replacement_id,
        replacement_asset_uid=payload.replacement_asset_uid,
        reason=payload.reason,
        status="initiated" if not replacement else "replacement_staged",
        notes=payload.notes,
        initiated_by=current_user.email,
    )
    db.add(ar)

    # Transition faulty asset to advance_replaced
    if faulty.status == "deployed":
        old_status = faulty.status
        faulty.status = "advance_replaced"
        db.add(AssetLifecycleEvent(
            asset_id=faulty.id, asset_uid=faulty.uid,
            from_state=old_status, to_state="advance_replaced",
            triggered_by=current_user.email,
            notes=f"Advance replacement initiated: {payload.reason or 'N/A'}",
        ))

    # If replacement assigned, stage it
    if replacement and replacement.status == "in_warehouse":
        old_status = replacement.status
        replacement.status = "staged"
        replacement.order_id = payload.order_id
        replacement.customer_name = faulty.customer_name
        replacement.customer_email = faulty.customer_email
        replacement.contract_id = faulty.contract_id
        replacement.site = faulty.site
        replacement.notes = f"Replacement for {faulty.uid}"
        db.add(AssetLifecycleEvent(
            asset_id=replacement.id, asset_uid=replacement.uid,
            from_state=old_status, to_state="staged",
            triggered_by=current_user.email,
            notes=f"Staged as replacement for {faulty.uid}",
        ))

    db.commit()
    db.refresh(ar)
    return ar


@router.put("/{ar_id}")
def update_advance_replacement(
    ar_id: int,
    payload: AdvanceReplacementUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    ar = db.query(AdvanceReplacement).filter(AdvanceReplacement.id == ar_id).first()
    if not ar:
        raise HTTPException(status_code=404, detail="Advance replacement not found")

    # If assigning replacement asset
    if payload.replacement_asset_uid and not ar.replacement_asset_uid:
        replacement = db.query(Asset).filter(Asset.uid == payload.replacement_asset_uid).first()
        if not replacement:
            raise HTTPException(status_code=404, detail="Replacement asset not found")
        ar.replacement_asset_id = replacement.id
        ar.replacement_asset_uid = replacement.uid
        if ar.status == "initiated":
            ar.status = "replacement_staged"

        # Stage the replacement
        faulty = db.query(Asset).filter(Asset.id == ar.faulty_asset_id).first()
        if replacement.status == "in_warehouse":
            old_status = replacement.status
            replacement.status = "staged"
            replacement.order_id = ar.order_id
            if faulty:
                replacement.customer_name = faulty.customer_name
                replacement.customer_email = faulty.customer_email
                replacement.contract_id = faulty.contract_id
                replacement.site = faulty.site
            replacement.notes = f"Replacement for {ar.faulty_asset_uid}"
            db.add(AssetLifecycleEvent(
                asset_id=replacement.id, asset_uid=replacement.uid,
                from_state=old_status, to_state="staged",
                triggered_by=current_user.email,
                notes=f"Staged as replacement for {ar.faulty_asset_uid}",
            ))

    if payload.status:
        ar.status = payload.status
    if payload.notes is not None:
        ar.notes = payload.notes

    db.commit()
    db.refresh(ar)
    return ar


@router.get("/{ar_id}")
def get_advance_replacement(
    ar_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    ar = db.query(AdvanceReplacement).filter(AdvanceReplacement.id == ar_id).first()
    if not ar:
        raise HTTPException(status_code=404, detail="Advance replacement not found")

    faulty = db.query(Asset).filter(Asset.id == ar.faulty_asset_id).first() if ar.faulty_asset_id else None
    repl = db.query(Asset).filter(Asset.id == ar.replacement_asset_id).first() if ar.replacement_asset_id else None

    data = {c.name: getattr(ar, c.name) for c in AdvanceReplacement.__table__.columns}
    data["faulty_asset"] = {
        "id": faulty.id, "uid": faulty.uid, "oem": faulty.oem, "model": faulty.model,
        "status": faulty.status, "condition_grade": faulty.condition_grade,
    } if faulty else None
    data["replacement_asset"] = {
        "id": repl.id, "uid": repl.uid, "oem": repl.oem, "model": repl.model,
        "status": repl.status, "condition_grade": repl.condition_grade,
    } if repl else None
    return data
