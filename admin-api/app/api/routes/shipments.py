from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, Order, Shipment, ShipmentTrackingEvent
from app.schemas.schemas import (
    ShipmentCreate,
    ShipmentResponse,
    ShipmentTrackingEventCreate,
    ShipmentUpdate,
)

router = APIRouter(prefix="/shipments", tags=["shipments"])


def _generate_shipment_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"SHP-{year}-"
    last = (
        db.query(Shipment)
        .filter(Shipment.shipment_number.like(f"{prefix}%"))
        .order_by(Shipment.shipment_number.desc())
        .first()
    )
    seq = int(last.shipment_number.split("-")[-1]) + 1 if last else 1
    return f"{prefix}{seq:04d}"


@router.get("/")
def list_shipments(
    order_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    shipment_type: Optional[str] = None,
    customer_email: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(Shipment)
    if order_id:
        query = query.filter(Shipment.order_id == order_id)
    if status_filter:
        query = query.filter(Shipment.status == status_filter)
    if shipment_type:
        query = query.filter(Shipment.shipment_type == shipment_type)
    if customer_email:
        query = query.filter(Shipment.customer_email == customer_email)

    total = query.count()
    items = query.order_by(Shipment.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for s in items:
        row = {c.name: getattr(s, c.name) for c in Shipment.__table__.columns}
        row["tracking_events"] = [
            {"id": e.id, "status": e.status, "location": e.location,
             "description": e.description, "event_time": e.event_time, "source": e.source}
            for e in (s.tracking_events or [])
        ]
        result.append(row)

    return {"items": result, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_shipment(
    payload: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    shipment_number = _generate_shipment_number(db)

    # Auto-fill customer info from order
    order = db.query(Order).filter(Order.order_number == payload.order_id).first()
    customer_name = payload.customer_name or (order.customer_name if order else None)
    customer_email = payload.customer_email or (order.customer_email if order else None)

    shipment = Shipment(
        shipment_number=shipment_number,
        order_id=payload.order_id,
        dc_number=payload.dc_number,
        shipment_type=payload.shipment_type,
        logistics_partner=payload.logistics_partner,
        tracking_number=payload.tracking_number,
        tracking_url=payload.tracking_url,
        estimated_delivery=payload.estimated_delivery,
        asset_uids=payload.asset_uids,
        package_count=payload.package_count,
        total_weight=payload.total_weight,
        dimensions=payload.dimensions,
        origin_address=payload.origin_address,
        destination_address=payload.destination_address,
        customer_name=customer_name,
        customer_email=customer_email,
        notes=payload.notes,
    )
    db.add(shipment)

    # Add initial tracking event
    db.flush()
    db.add(ShipmentTrackingEvent(
        shipment_id=shipment.id,
        status="preparing",
        description="Shipment created",
        source="system",
    ))

    db.commit()
    db.refresh(shipment)
    return shipment


@router.get("/{shipment_id}")
def get_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    data = {c.name: getattr(shipment, c.name) for c in Shipment.__table__.columns}
    data["tracking_events"] = [
        {"id": e.id, "status": e.status, "location": e.location,
         "description": e.description, "event_time": e.event_time, "source": e.source}
        for e in sorted(shipment.tracking_events or [], key=lambda x: x.event_time)
    ]

    # Cross-link order
    order = db.query(Order).filter(Order.order_number == shipment.order_id).first()
    if order:
        data["order"] = {
            "id": order.id, "order_number": order.order_number,
            "status": order.status, "delivery_status": order.delivery_status,
        }

    return data


@router.put("/{shipment_id}")
def update_shipment(
    shipment_id: int,
    payload: ShipmentUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    update_data = payload.model_dump(exclude_unset=True)
    new_status = update_data.get("status")
    now = datetime.utcnow()

    # Auto-set timestamps based on status transitions
    status_timestamps = {
        "picked_up": "picked_up_at",
        "in_transit": "in_transit_at",
        "out_for_delivery": "out_for_delivery_at",
        "delivered": "delivered_at",
    }
    if new_status and new_status in status_timestamps:
        setattr(shipment, status_timestamps[new_status], now)

    # Add tracking event for status change
    if new_status and new_status != shipment.status:
        db.add(ShipmentTrackingEvent(
            shipment_id=shipment.id,
            status=new_status,
            description=f"Status changed to {new_status}",
            source="admin",
        ))
        # Sync order delivery_status for outbound shipments
        if shipment.shipment_type == "outbound":
            order = db.query(Order).filter(Order.order_number == shipment.order_id).first()
            if order:
                status_map = {
                    "picked_up": "dispatched",
                    "in_transit": "in_transit",
                    "out_for_delivery": "out_for_delivery",
                    "delivered": "delivered",
                }
                if new_status in status_map:
                    order.delivery_status = status_map[new_status]

    if new_status == "delivered":
        shipment.received_by = update_data.get("received_by", shipment.received_by)

    for field, value in update_data.items():
        setattr(shipment, field, value)

    db.commit()
    db.refresh(shipment)
    return shipment


@router.post("/{shipment_id}/tracking-events", status_code=status.HTTP_201_CREATED)
def add_tracking_event(
    shipment_id: int,
    payload: ShipmentTrackingEventCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    event = ShipmentTrackingEvent(
        shipment_id=shipment_id,
        status=payload.status,
        location=payload.location,
        description=payload.description,
        source=payload.source,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/{shipment_id}/tracking-events")
def list_tracking_events(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    events = (
        db.query(ShipmentTrackingEvent)
        .filter(ShipmentTrackingEvent.shipment_id == shipment_id)
        .order_by(ShipmentTrackingEvent.event_time.asc())
        .all()
    )
    return {"items": events, "total": len(events)}
