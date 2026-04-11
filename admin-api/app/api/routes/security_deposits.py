from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, SecurityDeposit
from app.schemas.schemas import (
    SecurityDepositCreate,
    SecurityDepositResponse,
    SecurityDepositUpdate,
)

router = APIRouter(prefix="/security-deposits", tags=["security-deposits"])


def _generate_deposit_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"DEP-{year}-"
    last = (
        db.query(SecurityDeposit)
        .filter(SecurityDeposit.deposit_number.like(f"{prefix}%"))
        .order_by(SecurityDeposit.deposit_number.desc())
        .first()
    )
    seq = int(last.deposit_number.split("-")[-1]) + 1 if last else 1
    return f"{prefix}{seq:04d}"


@router.get("/")
def list_security_deposits(
    order_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_email: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(SecurityDeposit)
    if order_id:
        query = query.filter(SecurityDeposit.order_id == order_id)
    if status_filter:
        query = query.filter(SecurityDeposit.status == status_filter)
    if customer_email:
        query = query.filter(SecurityDeposit.customer_email == customer_email)

    total = query.count()
    items = query.order_by(SecurityDeposit.created_at.desc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_security_deposit(
    payload: SecurityDepositCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    deposit_number = _generate_deposit_number(db)
    deposit = SecurityDeposit(
        deposit_number=deposit_number,
        **payload.model_dump(),
    )
    if payload.received_date and not payload.transaction_id:
        deposit.status = "received"
    db.add(deposit)
    db.commit()
    db.refresh(deposit)
    return deposit


@router.get("/{deposit_id}")
def get_security_deposit(
    deposit_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    deposit = db.query(SecurityDeposit).filter(SecurityDeposit.id == deposit_id).first()
    if not deposit:
        raise HTTPException(status_code=404, detail="Security deposit not found")
    return deposit


@router.put("/{deposit_id}")
def update_security_deposit(
    deposit_id: int,
    payload: SecurityDepositUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    deposit = db.query(SecurityDeposit).filter(SecurityDeposit.id == deposit_id).first()
    if not deposit:
        raise HTTPException(status_code=404, detail="Security deposit not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Auto-calculate refund_amount if deductions are set
    if "deductions" in update_data and update_data.get("status") in ("partially_refunded", "refunded"):
        update_data["refund_amount"] = deposit.amount - update_data["deductions"]

    for field, value in update_data.items():
        setattr(deposit, field, value)

    db.commit()
    db.refresh(deposit)
    return deposit
