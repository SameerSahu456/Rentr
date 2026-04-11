from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    AdminUser, Asset, AssetLifecycleEvent, Order, Contract, ReturnRequest, SupportTicket,
)

router = APIRouter(prefix="/assets", tags=["assets"])

VALID_TRANSITIONS = {
    "in_warehouse": ["staged"],
    "staged": ["in_transit", "in_warehouse"],
    "in_transit": ["deployed", "in_warehouse"],
    "deployed": ["return_initiated", "in_repair", "advance_replaced"],
    "return_initiated": ["in_transit", "received_grn"],
    "received_grn": ["in_warehouse"],
    "in_repair": ["deployed", "in_warehouse"],
    "advance_replaced": ["in_warehouse"],
}

VALID_CATEGORIES = {"SVR", "LP", "DT", "WS", "STR", "GPU", "NW", "AV", "CP", "MB"}


def _generate_asset_uid(db: Session, category: str) -> str:
    year = datetime.utcnow().year
    prefix = f"RENTR-{category}-{year}-"
    last = (
        db.query(Asset)
        .filter(Asset.uid.like(f"{prefix}%"))
        .order_by(Asset.uid.desc())
        .first()
    )
    if last:
        seq = int(last.uid.split("-")[-1]) + 1
    else:
        seq = 1
    return f"{prefix}{seq:05d}"


@router.get("/stats")
def asset_stats(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    total_assets = db.query(func.count(Asset.id)).scalar() or 0

    # By status
    status_rows = (
        db.query(Asset.status, func.count(Asset.id))
        .group_by(Asset.status)
        .all()
    )
    by_status = {row[0]: row[1] for row in status_rows}

    # By category
    category_rows = (
        db.query(Asset.category, func.count(Asset.id))
        .group_by(Asset.category)
        .all()
    )
    by_category = {row[0]: row[1] for row in category_rows}

    total_acquisition_value = (
        db.query(func.coalesce(func.sum(Asset.acquisition_cost), 0)).scalar()
    )
    total_monthly_revenue = (
        db.query(func.coalesce(func.sum(Asset.monthly_rate), 0))
        .filter(Asset.status == "deployed")
        .scalar()
    )

    return {
        "total_assets": total_assets,
        "by_status": by_status,
        "by_category": by_category,
        "total_acquisition_value": float(total_acquisition_value),
        "total_monthly_revenue": float(total_monthly_revenue),
    }


@router.get("/")
def list_assets(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    customer_email: Optional[str] = None,
    contract_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(Asset)
    if status_filter:
        query = query.filter(Asset.status == status_filter)
    if category:
        query = query.filter(Asset.category == category)
    if customer_email:
        query = query.filter(Asset.customer_email == customer_email)
    if contract_id:
        query = query.filter(Asset.contract_id == contract_id)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Asset.uid.ilike(pattern),
                Asset.model.ilike(pattern),
                Asset.oem.ilike(pattern),
            )
        )

    total = query.count()
    items = query.order_by(Asset.created_at.desc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_asset(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    category = payload.get("category", "").upper()
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {', '.join(sorted(VALID_CATEGORIES))}",
        )

    uid = _generate_asset_uid(db, category)
    payload["uid"] = uid
    payload["category"] = category

    # Remove any keys that are not Asset columns
    valid_fields = {c.name for c in Asset.__table__.columns}
    filtered = {k: v for k, v in payload.items() if k in valid_fields and k != "id"}

    asset = Asset(**filtered)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.get("/{asset_id}")
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found"
        )
    events = (
        db.query(AssetLifecycleEvent)
        .filter(AssetLifecycleEvent.asset_id == asset_id)
        .order_by(AssetLifecycleEvent.created_at.desc())
        .all()
    )
    # Cross-linked related data
    order_data = None
    if asset.order_id:
        order_obj = db.query(Order).filter(Order.order_number == asset.order_id).first()
        if order_obj:
            order_data = {
                "id": order_obj.id, "order_number": order_obj.order_number,
                "status": order_obj.status, "customer_name": order_obj.customer_name,
                "total_monthly": order_obj.total_monthly,
                "rental_months": order_obj.rental_months,
                "created_at": order_obj.created_at,
            }

    contract_data = None
    if asset.contract_id:
        contract_obj = db.query(Contract).filter(Contract.contract_number == asset.contract_id).first()
        if contract_obj:
            contract_data = {
                "id": contract_obj.id, "contract_number": contract_obj.contract_number,
                "status": contract_obj.status, "start_date": contract_obj.start_date,
                "end_date": contract_obj.end_date,
            }

    returns = []
    if asset.order_id:
        return_objs = (
            db.query(ReturnRequest)
            .filter(ReturnRequest.order_id == asset.order_id)
            .all()
        )
        returns = [
            {"id": r.id, "return_number": r.return_number, "status": r.status, "reason": r.reason}
            for r in return_objs
        ]

    tickets = []
    if asset.order_id:
        ticket_objs = (
            db.query(SupportTicket)
            .filter(SupportTicket.order_id == asset.order_id)
            .all()
        )
        tickets = [
            {"id": t.id, "ticket_number": t.ticket_number, "subject": t.subject,
             "priority": t.priority, "status": t.status}
            for t in ticket_objs
        ]

    return {
        "asset": asset,
        "lifecycle_events": events,
        "order": order_data,
        "contract": contract_data,
        "returns": returns,
        "tickets": tickets,
    }


@router.put("/{asset_id}")
def update_asset(
    asset_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found"
        )

    valid_fields = {c.name for c in Asset.__table__.columns}
    excluded = {"id", "uid", "created_at"}
    for field, value in payload.items():
        if field in valid_fields and field not in excluded:
            setattr(asset, field, value)

    db.commit()
    db.refresh(asset)
    return asset


@router.post("/{asset_id}/transition")
def transition_asset(
    asset_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found"
        )

    to_state = payload.get("to_state")
    notes = payload.get("notes", "")

    if not to_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="to_state is required"
        )

    current_state = asset.status

    # Any state can transition to "retired" if user has admin role
    if to_state == "retired":
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can retire assets",
            )
    else:
        allowed = VALID_TRANSITIONS.get(current_state, [])
        if to_state not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid transition from '{current_state}' to '{to_state}'. "
                f"Allowed: {allowed}",
            )

    # Create lifecycle event
    event = AssetLifecycleEvent(
        asset_id=asset.id,
        asset_uid=asset.uid,
        from_state=current_state,
        to_state=to_state,
        triggered_by=current_user.email,
        notes=notes,
    )
    db.add(event)

    # Update asset status
    asset.status = to_state
    db.commit()
    db.refresh(asset)
    db.refresh(event)

    return {"asset": asset, "event": event}
