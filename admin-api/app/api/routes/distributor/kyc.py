from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_distributor
from app.models.models import (
    DistributorUser, DistributorKYC, DistributorCustomer,
)

router = APIRouter(prefix="/kyc", tags=["distributor-kyc"])


class KYCCreate(BaseModel):
    customer_id: int
    gstin: str | None = None
    pan: str | None = None
    documents: list = []


class KYCUpdate(BaseModel):
    status: str | None = None
    documents: list | None = None
    credit_limit: float | None = None
    review_notes: str | None = None
    rejection_reason: str | None = None


@router.get("/")
def list_kyc(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    query = db.query(DistributorKYC).filter(DistributorKYC.distributor_id == current.id)
    if search:
        query = query.filter(
            (DistributorKYC.customer_name.ilike(f"%{search}%"))
            | (DistributorKYC.company_name.ilike(f"%{search}%"))
        )
    if status:
        query = query.filter(DistributorKYC.status == status)
    total = query.count()
    items = query.order_by(DistributorKYC.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "items": [
            {
                "id": k.id, "customer_id": k.customer_id, "customer_name": k.customer_name,
                "company_name": k.company_name, "gstin": k.gstin, "pan": k.pan,
                "documents": k.documents, "status": k.status,
                "credit_limit": k.credit_limit,
                "reviewer": k.reviewer, "review_notes": k.review_notes,
                "created_at": k.created_at.isoformat() if k.created_at else None,
            }
            for k in items
        ],
        "total": total,
    }


@router.get("/{kyc_id}")
def get_kyc(
    kyc_id: int,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    kyc = db.query(DistributorKYC).filter(
        DistributorKYC.id == kyc_id,
        DistributorKYC.distributor_id == current.id,
    ).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC record not found")
    return {
        "id": kyc.id, "customer_id": kyc.customer_id,
        "customer_name": kyc.customer_name, "company_name": kyc.company_name,
        "gstin": kyc.gstin, "pan": kyc.pan, "documents": kyc.documents,
        "status": kyc.status, "credit_limit": kyc.credit_limit,
        "reviewer": kyc.reviewer, "review_notes": kyc.review_notes,
        "rejection_reason": kyc.rejection_reason,
        "reviewed_at": kyc.reviewed_at.isoformat() if kyc.reviewed_at else None,
        "created_at": kyc.created_at.isoformat() if kyc.created_at else None,
    }


@router.post("/", status_code=201)
def create_kyc(
    payload: KYCCreate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    cust = db.query(DistributorCustomer).filter(
        DistributorCustomer.id == payload.customer_id,
        DistributorCustomer.distributor_id == current.id,
    ).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    kyc = DistributorKYC(
        distributor_id=current.id,
        customer_id=cust.id,
        customer_name=cust.name,
        company_name=cust.company_name,
        gstin=payload.gstin or cust.gstin,
        pan=payload.pan or cust.pan,
        documents=payload.documents,
    )
    db.add(kyc)

    # Update customer KYC status
    cust.kyc_status = "under_review"

    db.commit()
    db.refresh(kyc)
    return {"id": kyc.id, "message": "KYC submitted"}


@router.put("/{kyc_id}")
def update_kyc(
    kyc_id: int,
    payload: KYCUpdate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    kyc = db.query(DistributorKYC).filter(
        DistributorKYC.id == kyc_id,
        DistributorKYC.distributor_id == current.id,
    ).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC record not found")

    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(kyc, key, val)

    # Sync status to customer record
    if payload.status:
        cust = db.query(DistributorCustomer).filter(
            DistributorCustomer.id == kyc.customer_id
        ).first()
        if cust:
            cust.kyc_status = payload.status

    db.commit()
    return {"message": "KYC updated"}
