from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import DeliveryChallan

router = APIRouter(prefix="/delivery-challans", tags=["Delivery Challans"])


class ChallanUpdate(BaseModel):
    status: Optional[str] = None
    transporter_name: Optional[str] = None
    eway_bill_number: Optional[str] = None
    vehicle_number: Optional[str] = None


@router.get("/")
def list_challans(
    status: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(DeliveryChallan)
    if status:
        query = query.filter(DeliveryChallan.status == status)
    challans = query.order_by(DeliveryChallan.created_at.desc()).all()
    return {
        "items": [
            {
                "id": c.id,
                "dc_number": c.dc_number,
                "order_id": c.order_id,
                "challan_type": c.challan_type.value if c.challan_type else None,
                "customer_name": c.customer_name,
                "total_value": c.total_value,
                "transporter_name": c.transporter_name,
                "eway_bill_number": c.eway_bill_number,
                "vehicle_number": c.vehicle_number,
                "status": c.status.value if c.status else None,
                "items": c.items or [],
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in challans
        ]
    }


@router.get("/{challan_id}")
def get_challan(
    challan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    challan = db.query(DeliveryChallan).filter(DeliveryChallan.id == challan_id).first()
    if not challan:
        raise HTTPException(status_code=404, detail="Delivery challan not found")
    return {
        "id": challan.id,
        "dc_number": challan.dc_number,
        "order_id": challan.order_id,
        "challan_type": challan.challan_type.value if challan.challan_type else None,
        "customer_name": challan.customer_name,
        "total_value": challan.total_value,
        "transporter_name": challan.transporter_name,
        "eway_bill_number": challan.eway_bill_number,
        "vehicle_number": challan.vehicle_number,
        "status": challan.status.value if challan.status else None,
        "items": challan.items or [],
        "created_at": challan.created_at.isoformat() if challan.created_at else None,
    }


@router.put("/{challan_id}")
def update_challan(
    challan_id: int,
    payload: ChallanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    challan = db.query(DeliveryChallan).filter(DeliveryChallan.id == challan_id).first()
    if not challan:
        raise HTTPException(status_code=404, detail="Delivery challan not found")

    if payload.status is not None:
        challan.status = payload.status
    if payload.transporter_name is not None:
        challan.transporter_name = payload.transporter_name
    if payload.eway_bill_number is not None:
        challan.eway_bill_number = payload.eway_bill_number
    if payload.vehicle_number is not None:
        challan.vehicle_number = payload.vehicle_number

    db.commit()
    db.refresh(challan)
    return {
        "id": challan.id,
        "dc_number": challan.dc_number,
        "status": challan.status.value if hasattr(challan.status, "value") else challan.status,
    }
