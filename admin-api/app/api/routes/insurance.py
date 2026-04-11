from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, InsurancePolicy
from app.schemas.schemas import (
    InsurancePolicyCreate,
    InsurancePolicyResponse,
    InsurancePolicyUpdate,
)

router = APIRouter(prefix="/insurance", tags=["insurance"])


@router.get("/")
def list_insurance_policies(
    asset_uid: Optional[str] = None,
    order_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(InsurancePolicy)
    if asset_uid:
        query = query.filter(InsurancePolicy.asset_uid == asset_uid)
    if order_id:
        query = query.filter(InsurancePolicy.order_id == order_id)
    if status_filter:
        query = query.filter(InsurancePolicy.status == status_filter)

    total = query.count()
    items = query.order_by(InsurancePolicy.created_at.desc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_insurance_policy(
    payload: InsurancePolicyCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    policy = InsurancePolicy(**payload.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/{policy_id}")
def get_insurance_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    policy = db.query(InsurancePolicy).filter(InsurancePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Insurance policy not found")
    return policy


@router.put("/{policy_id}")
def update_insurance_policy(
    policy_id: int,
    payload: InsurancePolicyUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    policy = db.query(InsurancePolicy).filter(InsurancePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Insurance policy not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(policy, field, value)

    db.commit()
    db.refresh(policy)
    return policy
