from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import (
    Asset, AssetStatus, AssetLifecycleEvent, Contract, Return, SupportTicket,
)

router = APIRouter(prefix="/assets", tags=["Assets"])


class AssetCreate(BaseModel):
    uid: str
    oem: str
    model: str
    category: str
    serial_number: str
    specs: Optional[dict] = None
    acquisition_source: Optional[str] = None
    acquisition_cost: Optional[float] = 0
    book_value: Optional[float] = 0
    condition_grade: Optional[str] = "A"
    warehouse_id: Optional[str] = None
    monthly_rate: Optional[float] = 0
    warranty_expiry: Optional[str] = None
    tags: Optional[List[str]] = None


class AssetPatch(BaseModel):
    tags: Optional[List[str]] = None
    data_wipe_status: Optional[str] = None


class AssetTransition(BaseModel):
    to_state: str
    notes: Optional[str] = None


@router.get("/stats")
def get_asset_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = db.query(func.count(Asset.id)).scalar() or 0
    deployed = db.query(func.count(Asset.id)).filter(Asset.status == AssetStatus.deployed).scalar() or 0
    in_warehouse = db.query(func.count(Asset.id)).filter(Asset.status == AssetStatus.in_warehouse).scalar() or 0
    in_repair = db.query(func.count(Asset.id)).filter(Asset.status == AssetStatus.in_repair).scalar() or 0
    return {
        "total_assets": total,
        "deployed": deployed,
        "in_warehouse": in_warehouse,
        "in_repair": in_repair,
    }


@router.get("/")
def list_assets(
    search: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Asset)
    if search:
        query = query.filter(
            or_(
                Asset.uid.ilike(f"%{search}%"),
                Asset.serial_number.ilike(f"%{search}%"),
                Asset.oem.ilike(f"%{search}%"),
                Asset.model.ilike(f"%{search}%"),
                Asset.customer_email.ilike(f"%{search}%"),
            )
        )
    if status:
        query = query.filter(Asset.status == status)
    assets = query.order_by(Asset.created_at.desc()).all()
    return {
        "items": [
            {
                "id": a.id,
                "uid": a.uid,
                "oem": a.oem,
                "model": a.model,
                "category": a.category.value if a.category else None,
                "serial_number": a.serial_number,
                "specs": a.specs,
                "status": a.status.value if a.status else None,
                "condition_grade": a.condition_grade.value if a.condition_grade else None,
                "warehouse_id": a.warehouse_id,
                "customer_email": a.customer_email,
                "contract_id": a.contract_id,
                "monthly_rate": a.monthly_rate,
                "acquisition_cost": a.acquisition_cost,
                "book_value": a.book_value,
                "warranty_expiry": a.warranty_expiry.isoformat() if a.warranty_expiry else None,
                "data_wipe_status": a.data_wipe_status,
                "tags": a.tags or [],
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in assets
        ]
    }


@router.get("/{asset_id}")
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    lifecycle_events = (
        db.query(AssetLifecycleEvent)
        .filter(AssetLifecycleEvent.asset_id == asset.id)
        .order_by(AssetLifecycleEvent.timestamp.desc())
        .all()
    )

    contract = None
    if asset.contract_id:
        c = db.query(Contract).filter(Contract.id == asset.contract_id).first()
        if c:
            contract = {
                "id": c.id, "contract_number": c.contract_number,
                "status": c.status.value if c.status else None,
            }

    returns = db.query(Return).filter(
        Return.asset_uids.op("@>")(f'["{asset.uid}"]')
    ).all() if asset.uid else []

    tickets = db.query(SupportTicket).filter(SupportTicket.asset_uid == asset.uid).all()

    return {
        "id": asset.id,
        "uid": asset.uid,
        "oem": asset.oem,
        "model": asset.model,
        "category": asset.category.value if asset.category else None,
        "serial_number": asset.serial_number,
        "specs": asset.specs,
        "status": asset.status.value if asset.status else None,
        "condition_grade": asset.condition_grade.value if asset.condition_grade else None,
        "warehouse_id": asset.warehouse_id,
        "customer_email": asset.customer_email,
        "contract_id": asset.contract_id,
        "monthly_rate": asset.monthly_rate,
        "acquisition_cost": asset.acquisition_cost,
        "book_value": asset.book_value,
        "warranty_expiry": asset.warranty_expiry.isoformat() if asset.warranty_expiry else None,
        "data_wipe_status": asset.data_wipe_status,
        "tags": asset.tags or [],
        "created_at": asset.created_at.isoformat() if asset.created_at else None,
        "lifecycle_events": [
            {
                "id": e.id,
                "from_state": e.from_state,
                "to_state": e.to_state,
                "notes": e.notes,
                "user_email": e.user_email,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            }
            for e in lifecycle_events
        ],
        "contract": contract,
        "returns": [
            {"id": r.id, "return_number": r.return_number, "status": r.status.value if r.status else None}
            for r in returns
        ],
        "tickets": [
            {"id": t.id, "ticket_number": t.ticket_number, "subject": t.subject, "status": t.status.value if t.status else None}
            for t in tickets
        ],
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Asset).filter(
        (Asset.uid == payload.uid) | (Asset.serial_number == payload.serial_number)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Asset with this UID or serial number already exists")

    from datetime import date
    warranty = None
    if payload.warranty_expiry:
        warranty = date.fromisoformat(payload.warranty_expiry)

    asset = Asset(
        uid=payload.uid,
        oem=payload.oem,
        model=payload.model,
        category=payload.category,
        serial_number=payload.serial_number,
        specs=payload.specs or {},
        acquisition_source=payload.acquisition_source,
        acquisition_cost=payload.acquisition_cost or 0,
        book_value=payload.book_value or 0,
        condition_grade=payload.condition_grade or "A",
        warehouse_id=payload.warehouse_id,
        monthly_rate=payload.monthly_rate or 0,
        warranty_expiry=warranty,
        tags=payload.tags or [],
        status=AssetStatus.in_warehouse,
    )
    db.add(asset)
    db.flush()

    event = AssetLifecycleEvent(
        asset_id=asset.id,
        from_state=None,
        to_state=AssetStatus.in_warehouse.value,
        notes="Asset created",
        user_email=current_user.email,
    )
    db.add(event)
    db.commit()
    db.refresh(asset)
    return {
        "id": asset.id,
        "uid": asset.uid,
        "status": asset.status.value if asset.status else None,
        "created_at": asset.created_at.isoformat() if asset.created_at else None,
    }


@router.patch("/{asset_id}")
def patch_asset(
    asset_id: int,
    payload: AssetPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if payload.tags is not None:
        asset.tags = payload.tags
    if payload.data_wipe_status is not None:
        asset.data_wipe_status = payload.data_wipe_status

    db.commit()
    db.refresh(asset)
    return {
        "id": asset.id,
        "uid": asset.uid,
        "tags": asset.tags,
        "data_wipe_status": asset.data_wipe_status,
    }


@router.post("/{asset_id}/transition")
def transition_asset(
    asset_id: int,
    payload: AssetTransition,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    from_state = asset.status.value if asset.status else None
    asset.status = payload.to_state

    event = AssetLifecycleEvent(
        asset_id=asset.id,
        from_state=from_state,
        to_state=payload.to_state,
        notes=payload.notes,
        user_email=current_user.email,
    )
    db.add(event)
    db.commit()
    db.refresh(asset)
    return {
        "id": asset.id,
        "uid": asset.uid,
        "status": asset.status.value if hasattr(asset.status, "value") else asset.status,
        "from_state": from_state,
        "to_state": payload.to_state,
    }
