from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import Shipment, ShipmentItem, DeliveryChallan

router = APIRouter(prefix="/shipments", tags=["Shipments"])


class ShipmentUpdate(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None
    logistics_partner: Optional[str] = None
    estimated_delivery: Optional[str] = None


@router.get("/")
def list_shipments(
    status: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Shipment)
    if status:
        query = query.filter(Shipment.status == status)
    shipments = query.order_by(Shipment.created_at.desc()).all()
    return {
        "items": [
            {
                "id": s.id,
                "shipment_number": s.shipment_number,
                "order_id": s.order_id,
                "shipment_type": s.shipment_type.value if s.shipment_type else None,
                "logistics_partner": s.logistics_partner,
                "tracking_number": s.tracking_number,
                "customer_name": s.customer_name,
                "status": s.status.value if s.status else None,
                "estimated_delivery": s.estimated_delivery.isoformat() if s.estimated_delivery else None,
                "timeline": s.timeline or [],
                "asset_count": len(s.shipment_items),
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in shipments
        ]
    }


@router.get("/{shipment_id}")
def get_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    order_data = None
    if shipment.order:
        order_data = {
            "id": shipment.order.id,
            "status": shipment.order.status.value if shipment.order.status else None,
            "total_amount": shipment.order.total_amount,
            "rental_months": shipment.order.rental_months,
            "shipping_address": shipment.order.shipping_address,
        }

    assets_data = [
        {
            "id": si.id,
            "asset_id": si.asset_id,
            "asset_uid": si.asset_uid,
            "description": si.description,
            "quantity": si.quantity,
            "asset_status": si.asset.status.value if si.asset and si.asset.status else None,
            "asset_category": si.asset.category.value if si.asset and si.asset.category else None,
            "asset_model": si.asset.model if si.asset else None,
        }
        for si in shipment.shipment_items
    ]

    dc_data = None
    if shipment.delivery_challan:
        dc = shipment.delivery_challan
        dc_data = {
            "id": dc.id, "dc_number": dc.dc_number,
            "challan_type": dc.challan_type.value if dc.challan_type else None,
            "status": dc.status.value if dc.status else None,
            "total_value": dc.total_value,
        }

    return {
        "id": shipment.id,
        "shipment_number": shipment.shipment_number,
        "order_id": shipment.order_id,
        "order": order_data,
        "dc_id": shipment.dc_id,
        "delivery_challan": dc_data,
        "shipment_type": shipment.shipment_type.value if shipment.shipment_type else None,
        "logistics_partner": shipment.logistics_partner,
        "tracking_number": shipment.tracking_number,
        "customer_name": shipment.customer_name,
        "status": shipment.status.value if shipment.status else None,
        "estimated_delivery": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
        "timeline": shipment.timeline or [],
        "assets": assets_data,
        "created_at": shipment.created_at.isoformat() if shipment.created_at else None,
    }


@router.put("/{shipment_id}")
def update_shipment(
    shipment_id: int,
    payload: ShipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    if payload.status is not None:
        # Append to timeline
        from datetime import datetime, timezone
        timeline = list(shipment.timeline or [])
        timeline.append({
            "status": payload.status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        shipment.timeline = timeline
        shipment.status = payload.status
    if payload.tracking_number is not None:
        shipment.tracking_number = payload.tracking_number
    if payload.logistics_partner is not None:
        shipment.logistics_partner = payload.logistics_partner
    if payload.estimated_delivery is not None:
        from datetime import date
        shipment.estimated_delivery = date.fromisoformat(payload.estimated_delivery)

    db.commit()
    db.refresh(shipment)

    order_data = None
    if shipment.order:
        order_data = {
            "id": shipment.order.id,
            "status": shipment.order.status.value if shipment.order.status else None,
            "total_amount": shipment.order.total_amount,
            "rental_months": shipment.order.rental_months,
            "shipping_address": shipment.order.shipping_address,
        }

    assets_data = [
        {
            "id": si.id,
            "asset_id": si.asset_id,
            "asset_uid": si.asset_uid,
            "description": si.description,
            "quantity": si.quantity,
            "asset_status": si.asset.status.value if si.asset and si.asset.status else None,
            "asset_category": si.asset.category.value if si.asset and si.asset.category else None,
            "asset_model": si.asset.model if si.asset else None,
        }
        for si in shipment.shipment_items
    ]

    dc_data = None
    if shipment.delivery_challan:
        dc = shipment.delivery_challan
        dc_data = {
            "id": dc.id, "dc_number": dc.dc_number,
            "challan_type": dc.challan_type.value if dc.challan_type else None,
            "status": dc.status.value if dc.status else None,
            "total_value": dc.total_value,
        }

    return {
        "id": shipment.id,
        "shipment_number": shipment.shipment_number,
        "order_id": shipment.order_id,
        "order": order_data,
        "dc_id": shipment.dc_id,
        "delivery_challan": dc_data,
        "shipment_type": shipment.shipment_type.value if shipment.shipment_type else None,
        "logistics_partner": shipment.logistics_partner,
        "tracking_number": shipment.tracking_number,
        "customer_name": shipment.customer_name,
        "status": shipment.status.value if hasattr(shipment.status, "value") else shipment.status,
        "estimated_delivery": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
        "timeline": shipment.timeline or [],
        "assets": assets_data,
        "created_at": shipment.created_at.isoformat() if shipment.created_at else None,
    }
