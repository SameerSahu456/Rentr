from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import Return, ReturnStatus

router = APIRouter(prefix="/returns", tags=["Returns"])


class ReturnCreate(BaseModel):
    customer_name: str
    customer_email: str
    contract_id: Optional[int] = None
    asset_uids: Optional[List[str]] = None
    reason: Optional[str] = None
    pickup_date: Optional[str] = None


class ReturnUpdate(BaseModel):
    status: Optional[str] = None
    grn_number: Optional[str] = None
    damage_charges: Optional[float] = None
    damage_report: Optional[dict] = None


def _next_return_number(db: Session) -> str:
    count = db.query(func.count(Return.id)).scalar() or 0
    return f"RENTR-RET-{date.today().year}-{count + 1:05d}"


@router.get("/")
def list_returns(
    status: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Return)
    if status:
        query = query.filter(Return.status == status)
    if search:
        query = query.filter(
            or_(
                Return.return_number.ilike(f"%{search}%"),
                Return.customer_name.ilike(f"%{search}%"),
                Return.customer_email.ilike(f"%{search}%"),
            )
        )
    returns = query.order_by(Return.created_at.desc()).all()
    return {
        "items": [
            {
                "id": r.id,
                "return_number": r.return_number,
                "customer_name": r.customer_name,
                "customer_email": r.customer_email,
                "contract_id": r.contract_id,
                "asset_uids": r.asset_uids or [],
                "reason": r.reason,
                "status": r.status.value if r.status else None,
                "pickup_date": r.pickup_date.isoformat() if r.pickup_date else None,
                "grn_number": r.grn_number,
                "damage_charges": r.damage_charges,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in returns
        ]
    }


@router.get("/{return_id}")
def get_return(
    return_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ret = db.query(Return).filter(Return.id == return_id).first()
    if not ret:
        raise HTTPException(status_code=404, detail="Return not found")
    return {
        "id": ret.id,
        "return_number": ret.return_number,
        "customer_name": ret.customer_name,
        "customer_email": ret.customer_email,
        "contract_id": ret.contract_id,
        "asset_uids": ret.asset_uids or [],
        "reason": ret.reason,
        "status": ret.status.value if ret.status else None,
        "pickup_date": ret.pickup_date.isoformat() if ret.pickup_date else None,
        "grn_number": ret.grn_number,
        "damage_charges": ret.damage_charges,
        "damage_report": ret.damage_report or {},
        "created_at": ret.created_at.isoformat() if ret.created_at else None,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_return(
    payload: ReturnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ret = Return(
        return_number=_next_return_number(db),
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        contract_id=payload.contract_id,
        asset_uids=payload.asset_uids or [],
        reason=payload.reason,
        status=ReturnStatus.initiated,
        pickup_date=date.fromisoformat(payload.pickup_date) if payload.pickup_date else None,
    )
    db.add(ret)
    db.commit()
    db.refresh(ret)
    return {
        "id": ret.id,
        "return_number": ret.return_number,
        "status": ret.status.value,
        "created_at": ret.created_at.isoformat() if ret.created_at else None,
    }


@router.put("/{return_id}")
def update_return(
    return_id: int,
    payload: ReturnUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ret = db.query(Return).filter(Return.id == return_id).first()
    if not ret:
        raise HTTPException(status_code=404, detail="Return not found")

    if payload.status is not None:
        ret.status = payload.status
    if payload.grn_number is not None:
        ret.grn_number = payload.grn_number
    if payload.damage_charges is not None:
        ret.damage_charges = payload.damage_charges
    if payload.damage_report is not None:
        ret.damage_report = payload.damage_report

    db.commit()
    db.refresh(ret)
    return {
        "id": ret.id,
        "return_number": ret.return_number,
        "status": ret.status.value if hasattr(ret.status, "value") else ret.status,
    }
