from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    AdminUser, Asset, AssetLifecycleEvent, DeliveryChallan, Order,
)
from app.schemas.schemas import (
    DeliveryChallanCreate,
    DeliveryChallanResponse,
    DeliveryChallanUpdate,
)

router = APIRouter(prefix="/delivery-challans", tags=["delivery-challans"])


def _generate_dc_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"DC-{year}-"
    last = (
        db.query(DeliveryChallan)
        .filter(DeliveryChallan.dc_number.like(f"{prefix}%"))
        .order_by(DeliveryChallan.dc_number.desc())
        .first()
    )
    seq = int(last.dc_number.split("-")[-1]) + 1 if last else 1
    return f"{prefix}{seq:04d}"


@router.get("/")
def list_delivery_challans(
    order_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_email: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(DeliveryChallan)
    if order_id:
        query = query.filter(DeliveryChallan.order_id == order_id)
    if status_filter:
        query = query.filter(DeliveryChallan.status == status_filter)
    if customer_email:
        query = query.filter(DeliveryChallan.customer_email == customer_email)

    total = query.count()
    items = query.order_by(DeliveryChallan.created_at.desc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_delivery_challan(
    payload: DeliveryChallanCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    dc_number = _generate_dc_number(db)
    dc = DeliveryChallan(
        dc_number=dc_number,
        **payload.model_dump(),
    )
    db.add(dc)

    # Update order with DC reference
    order = db.query(Order).filter(Order.order_number == payload.order_id).first()
    if order:
        order.delivery_challan_number = dc_number

    # Transition linked assets to staged
    for uid in (payload.asset_uids or []):
        asset = db.query(Asset).filter(Asset.uid == uid).first()
        if asset and asset.status == "in_warehouse":
            old_status = asset.status
            asset.status = "staged"
            db.add(AssetLifecycleEvent(
                asset_id=asset.id, asset_uid=asset.uid,
                from_state=old_status, to_state="staged",
                triggered_by=current_user.email,
                notes=f"Staged for DC {dc_number}",
            ))

    db.commit()
    db.refresh(dc)
    return dc


@router.get("/{dc_id}")
def get_delivery_challan(
    dc_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    dc = db.query(DeliveryChallan).filter(DeliveryChallan.id == dc_id).first()
    if not dc:
        raise HTTPException(status_code=404, detail="Delivery challan not found")

    data = {c.name: getattr(dc, c.name) for c in DeliveryChallan.__table__.columns}

    # Cross-link order
    order = db.query(Order).filter(Order.order_number == dc.order_id).first()
    if order:
        data["order"] = {
            "id": order.id, "order_number": order.order_number,
            "status": order.status, "customer_name": order.customer_name,
        }

    # Cross-link assets
    linked_assets = []
    for uid in (dc.asset_uids or []):
        asset = db.query(Asset).filter(Asset.uid == uid).first()
        if asset:
            linked_assets.append({
                "id": asset.id, "uid": asset.uid, "oem": asset.oem,
                "model": asset.model, "serial_number": asset.serial_number,
                "status": asset.status, "condition_grade": asset.condition_grade,
            })
    data["linked_assets"] = linked_assets

    return data


@router.put("/{dc_id}")
def update_delivery_challan(
    dc_id: int,
    payload: DeliveryChallanUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    dc = db.query(DeliveryChallan).filter(DeliveryChallan.id == dc_id).first()
    if not dc:
        raise HTTPException(status_code=404, detail="Delivery challan not found")

    update_data = payload.model_dump(exclude_unset=True)
    new_status = update_data.get("status")

    # Handle status transitions
    if new_status == "dispatched" and dc.status != "dispatched":
        dc.dispatched_at = datetime.utcnow()
        # Transition assets to in_transit
        for uid in (dc.asset_uids or []):
            asset = db.query(Asset).filter(Asset.uid == uid).first()
            if asset and asset.status in ("staged", "in_warehouse"):
                old_status = asset.status
                asset.status = "in_transit"
                db.add(AssetLifecycleEvent(
                    asset_id=asset.id, asset_uid=asset.uid,
                    from_state=old_status, to_state="in_transit",
                    triggered_by=current_user.email,
                    notes=f"Dispatched via DC {dc.dc_number}",
                ))
        # Update order delivery status
        order = db.query(Order).filter(Order.order_number == dc.order_id).first()
        if order:
            order.delivery_status = "dispatched"

    elif new_status == "in_transit" and dc.status != "in_transit":
        order = db.query(Order).filter(Order.order_number == dc.order_id).first()
        if order:
            order.delivery_status = "in_transit"

    elif new_status == "delivered" and dc.status != "delivered":
        dc.delivered_at = datetime.utcnow()
        dc.received_by = update_data.get("received_by", dc.received_by)
        # Transition assets to deployed
        for uid in (dc.asset_uids or []):
            asset = db.query(Asset).filter(Asset.uid == uid).first()
            if asset and asset.status == "in_transit":
                old_status = asset.status
                asset.status = "deployed"
                db.add(AssetLifecycleEvent(
                    asset_id=asset.id, asset_uid=asset.uid,
                    from_state=old_status, to_state="deployed",
                    triggered_by=current_user.email,
                    notes=f"Delivered via DC {dc.dc_number}, received by {dc.received_by or 'N/A'}",
                ))
        # Update order: mark delivered, start billing
        order = db.query(Order).filter(Order.order_number == dc.order_id).first()
        if order:
            order.delivery_status = "delivered"
            order.delivered_at = datetime.utcnow()
            order.delivery_confirmed_by = current_user.email
            order.status = "active"
            # BILLING STARTS NOW
            from datetime import date
            if not order.billing_start_date:
                order.billing_start_date = date.today()
                order.billing_status = "active"
                # Set billing end date based on rental months
                from dateutil.relativedelta import relativedelta
                order.billing_end_date = order.billing_start_date + relativedelta(months=order.rental_months)
                # Set next billing date to 1 month from now
                order.next_billing_date = order.billing_start_date + relativedelta(months=1)

    for field, value in update_data.items():
        setattr(dc, field, value)

    db.commit()
    db.refresh(dc)
    return dc
