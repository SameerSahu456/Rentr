from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    AdminUser, Asset, AssetLifecycleEvent, Replacement, ReturnRequest,
)
from app.schemas.schemas import (
    ReplacementCreate,
    ReplacementResponse,
    ReplacementUpdate,
)

router = APIRouter(prefix="/replacements", tags=["replacements"])


def _generate_replacement_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"RPL-{year}-"
    last = (
        db.query(Replacement)
        .filter(Replacement.replacement_number.like(f"{prefix}%"))
        .order_by(Replacement.replacement_number.desc())
        .first()
    )
    seq = int(last.replacement_number.split("-")[-1]) + 1 if last else 1
    return f"{prefix}{seq:04d}"


@router.get("/")
def list_replacements(
    order_id: Optional[str] = None,
    replacement_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_email: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(Replacement)
    if order_id:
        query = query.filter(Replacement.order_id == order_id)
    if replacement_type:
        query = query.filter(Replacement.replacement_type == replacement_type)
    if status_filter:
        query = query.filter(Replacement.status == status_filter)
    if customer_email:
        query = query.filter(Replacement.customer_email == customer_email)

    total = query.count()
    items = query.order_by(Replacement.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for r in items:
        row = {c.name: getattr(r, c.name) for c in Replacement.__table__.columns}
        # Enrich with asset details
        faulty = db.query(Asset).filter(Asset.id == r.faulty_asset_id).first() if r.faulty_asset_id else None
        repl = db.query(Asset).filter(Asset.id == r.replacement_asset_id).first() if r.replacement_asset_id else None
        row["faulty_model"] = f"{faulty.oem} {faulty.model}" if faulty else None
        row["replacement_model"] = f"{repl.oem} {repl.model}" if repl else None
        result.append(row)

    return {"items": result, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_replacement(
    payload: ReplacementCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Create a replacement request.
    - advance: Ship replacement first, then collect faulty.
    - normal: Collect faulty first (via return), then ship replacement.
    """
    replacement_number = _generate_replacement_number(db)

    # Validate faulty asset
    faulty = db.query(Asset).filter(Asset.uid == payload.faulty_asset_uid).first()
    if not faulty:
        raise HTTPException(status_code=404, detail="Faulty asset not found")

    # Validate replacement asset if provided
    replacement = None
    replacement_id = None
    if payload.replacement_asset_uid:
        replacement = db.query(Asset).filter(Asset.uid == payload.replacement_asset_uid).first()
        if not replacement:
            raise HTTPException(status_code=404, detail="Replacement asset not found")
        replacement_id = replacement.id

    # Determine initial status based on type
    if payload.replacement_type == "advance":
        initial_status = "initiated" if not replacement else "replacement_staged"
    else:  # normal
        initial_status = "initiated"

    rpl = Replacement(
        replacement_number=replacement_number,
        order_id=payload.order_id,
        contract_id=payload.contract_id,
        ticket_id=payload.ticket_id,
        return_id=payload.return_id,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        replacement_type=payload.replacement_type,
        faulty_asset_id=faulty.id,
        faulty_asset_uid=payload.faulty_asset_uid,
        faulty_reason=payload.faulty_reason,
        fault_description=payload.fault_description,
        replacement_asset_id=replacement_id,
        replacement_asset_uid=payload.replacement_asset_uid,
        status=initial_status,
        initiated_by=current_user.email,
        notes=payload.notes,
    )
    db.add(rpl)

    # For advance replacement: mark faulty asset, stage replacement
    if payload.replacement_type == "advance":
        if faulty.status == "deployed":
            old_status = faulty.status
            faulty.status = "advance_replaced"
            db.add(AssetLifecycleEvent(
                asset_id=faulty.id, asset_uid=faulty.uid,
                from_state=old_status, to_state="advance_replaced",
                triggered_by=current_user.email,
                notes=f"Advance replacement {replacement_number}: {payload.faulty_reason or 'N/A'}",
            ))

        if replacement and replacement.status == "in_warehouse":
            old_status = replacement.status
            replacement.status = "staged"
            replacement.order_id = payload.order_id
            replacement.customer_name = faulty.customer_name
            replacement.customer_email = faulty.customer_email
            replacement.contract_id = faulty.contract_id
            replacement.site = faulty.site
            replacement.notes = f"Replacement for {faulty.uid} (RPL: {replacement_number})"
            db.add(AssetLifecycleEvent(
                asset_id=replacement.id, asset_uid=replacement.uid,
                from_state=old_status, to_state="staged",
                triggered_by=current_user.email,
                notes=f"Staged as replacement for {faulty.uid}",
            ))

    # For normal replacement: create a return request if not linked
    elif payload.replacement_type == "normal" and not payload.return_id:
        from app.api.routes.returns import _generate_return_number
        return_number = _generate_return_number(db)
        ret = ReturnRequest(
            return_number=return_number,
            order_id=payload.order_id,
            contract_id=payload.contract_id,
            customer_name=payload.customer_name,
            customer_email=payload.customer_email,
            asset_uids=[payload.faulty_asset_uid],
            reason="advance_replacement",
            status="pending",
        )
        db.add(ret)
        db.flush()
        rpl.return_id = return_number

    db.commit()
    db.refresh(rpl)
    return rpl


@router.get("/{rpl_id}")
def get_replacement(
    rpl_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    rpl = db.query(Replacement).filter(Replacement.id == rpl_id).first()
    if not rpl:
        raise HTTPException(status_code=404, detail="Replacement not found")

    data = {c.name: getattr(rpl, c.name) for c in Replacement.__table__.columns}

    # Enrich with asset details
    faulty = db.query(Asset).filter(Asset.id == rpl.faulty_asset_id).first() if rpl.faulty_asset_id else None
    repl = db.query(Asset).filter(Asset.id == rpl.replacement_asset_id).first() if rpl.replacement_asset_id else None

    data["faulty_asset"] = {
        "id": faulty.id, "uid": faulty.uid, "oem": faulty.oem, "model": faulty.model,
        "serial_number": faulty.serial_number, "status": faulty.status,
        "condition_grade": faulty.condition_grade,
    } if faulty else None

    data["replacement_asset"] = {
        "id": repl.id, "uid": repl.uid, "oem": repl.oem, "model": repl.model,
        "serial_number": repl.serial_number, "status": repl.status,
        "condition_grade": repl.condition_grade,
    } if repl else None

    # Linked return
    if rpl.return_id:
        ret = db.query(ReturnRequest).filter(ReturnRequest.return_number == rpl.return_id).first()
        if ret:
            data["return_request"] = {
                "id": ret.id, "return_number": ret.return_number,
                "status": ret.status, "grn_date": ret.grn_date,
            }

    return data


@router.put("/{rpl_id}")
def update_replacement(
    rpl_id: int,
    payload: ReplacementUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    rpl = db.query(Replacement).filter(Replacement.id == rpl_id).first()
    if not rpl:
        raise HTTPException(status_code=404, detail="Replacement not found")

    update_data = payload.model_dump(exclude_unset=True)

    # If assigning replacement asset
    if update_data.get("replacement_asset_uid") and not rpl.replacement_asset_uid:
        replacement = db.query(Asset).filter(Asset.uid == update_data["replacement_asset_uid"]).first()
        if not replacement:
            raise HTTPException(status_code=404, detail="Replacement asset not found")
        rpl.replacement_asset_id = replacement.id
        rpl.replacement_asset_uid = replacement.uid

        if rpl.status == "initiated":
            rpl.status = "replacement_staged"

        # Stage the replacement asset
        faulty = db.query(Asset).filter(Asset.id == rpl.faulty_asset_id).first()
        if replacement.status == "in_warehouse":
            old_status = replacement.status
            replacement.status = "staged"
            replacement.order_id = rpl.order_id
            if faulty:
                replacement.customer_name = faulty.customer_name
                replacement.customer_email = faulty.customer_email
                replacement.contract_id = faulty.contract_id
                replacement.site = faulty.site
            replacement.notes = f"Replacement for {rpl.faulty_asset_uid} (RPL: {rpl.replacement_number})"
            db.add(AssetLifecycleEvent(
                asset_id=replacement.id, asset_uid=replacement.uid,
                from_state=old_status, to_state="staged",
                triggered_by=current_user.email,
                notes=f"Staged as replacement for {rpl.faulty_asset_uid}",
            ))

    # Handle status changes
    new_status = update_data.get("status")
    if new_status == "completed" and rpl.status != "completed":
        # Verify both assets are accounted for
        pass  # Business logic can be added here

    for field, value in update_data.items():
        if field != "replacement_asset_uid":  # already handled above
            setattr(rpl, field, value)

    db.commit()
    db.refresh(rpl)
    return rpl
