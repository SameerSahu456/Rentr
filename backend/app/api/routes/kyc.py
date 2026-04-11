from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import KYC, KYCStatus, Customer

router = APIRouter(prefix="/kyc", tags=["KYC"])


class KYCByEmailRequest(BaseModel):
    email: str


class KYCUpdateRequest(BaseModel):
    status: Optional[str] = None
    credit_limit: Optional[float] = None
    reviewer: Optional[str] = None
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None


class DocumentUpload(BaseModel):
    name: str
    type: str
    url: Optional[str] = None
    status: Optional[str] = "pending"


class DocumentStatusUpdate(BaseModel):
    status: str


@router.get("/stats")
def get_kyc_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    counts = (
        db.query(KYC.status, func.count(KYC.id))
        .group_by(KYC.status)
        .all()
    )
    stats = {s.value: 0 for s in KYCStatus}
    for status_val, count in counts:
        key = status_val.value if hasattr(status_val, "value") else status_val
        stats[key] = count
    stats["total"] = sum(stats.values())
    return stats


@router.get("/")
def list_kyc(
    status: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(KYC)
    if status:
        query = query.filter(KYC.status == status)
    records = query.order_by(KYC.created_at.desc()).all()
    return {
        "items": [
            {
                "id": r.id,
                "customer_id": r.customer_id,
                "customer_email": r.customer_email,
                "customer_name": r.customer_name,
                "company_name": r.company_name,
                "account_type": r.account_type,
                "gstin": r.gstin,
                "pan": r.pan,
                "status": r.status.value if r.status else None,
                "credit_limit": r.credit_limit,
                "credit_used": r.credit_used,
                "credit_available": r.credit_available,
                "documents": r.documents or [],
                "reviewer": r.reviewer,
                "review_notes": r.review_notes,
                "rejection_reason": r.rejection_reason,
                "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in records
        ]
    }


@router.get("/{kyc_id}")
def get_kyc(
    kyc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(KYC).filter(KYC.id == kyc_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC record not found")
    return {
        "id": record.id,
        "customer_id": record.customer_id,
        "customer_email": record.customer_email,
        "customer_name": record.customer_name,
        "company_name": record.company_name,
        "account_type": record.account_type,
        "gstin": record.gstin,
        "pan": record.pan,
        "status": record.status.value if record.status else None,
        "credit_limit": record.credit_limit,
        "credit_used": record.credit_used,
        "credit_available": record.credit_available,
        "documents": record.documents or [],
        "reviewer": record.reviewer,
        "review_notes": record.review_notes,
        "rejection_reason": record.rejection_reason,
        "reviewed_at": record.reviewed_at.isoformat() if record.reviewed_at else None,
        "created_at": record.created_at.isoformat() if record.created_at else None,
    }


@router.post("/by-email", status_code=status.HTTP_201_CREATED)
def create_kyc_by_email(
    payload: KYCByEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.email == payload.email).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    kyc = KYC(
        customer_id=customer.id,
        customer_email=customer.email,
        customer_name=customer.name,
        company_name=customer.company_name,
        gstin=customer.gstin,
        pan=customer.pan,
        status=KYCStatus.pending,
        credit_limit=0,
        credit_used=0,
        credit_available=0,
        documents=[],
    )
    db.add(kyc)
    db.commit()
    db.refresh(kyc)
    return {
        "id": kyc.id,
        "customer_id": kyc.customer_id,
        "customer_email": kyc.customer_email,
        "status": kyc.status.value,
        "created_at": kyc.created_at.isoformat() if kyc.created_at else None,
    }


@router.put("/{kyc_id}")
def update_kyc(
    kyc_id: int,
    payload: KYCUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(KYC).filter(KYC.id == kyc_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC record not found")

    if payload.status is not None:
        record.status = payload.status
    if payload.credit_limit is not None:
        record.credit_limit = payload.credit_limit
        record.credit_available = payload.credit_limit - record.credit_used
    if payload.reviewer is not None:
        record.reviewer = payload.reviewer
    if payload.review_notes is not None:
        record.review_notes = payload.review_notes
    if payload.rejection_reason is not None:
        record.rejection_reason = payload.rejection_reason

    if payload.status in ("approved", "rejected"):
        record.reviewed_at = datetime.now(timezone.utc)
        # Sync status back to customer
        customer = db.query(Customer).filter(Customer.id == record.customer_id).first()
        if customer:
            customer.kyc_status = payload.status
            if payload.credit_limit is not None:
                customer.credit_limit = payload.credit_limit

    db.commit()
    db.refresh(record)
    return {
        "id": record.id,
        "status": record.status.value if hasattr(record.status, "value") else record.status,
        "credit_limit": record.credit_limit,
        "reviewer": record.reviewer,
        "reviewed_at": record.reviewed_at.isoformat() if record.reviewed_at else None,
    }


@router.post("/{kyc_id}/documents", status_code=status.HTTP_201_CREATED)
def add_document(
    kyc_id: int,
    payload: DocumentUpload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(KYC).filter(KYC.id == kyc_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC record not found")

    docs = list(record.documents or [])
    doc = {
        "name": payload.name,
        "type": payload.type,
        "url": payload.url,
        "status": payload.status or "pending",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    docs.append(doc)
    record.documents = docs
    db.commit()
    return {"documents": record.documents, "index": len(docs) - 1}


@router.put("/{kyc_id}/documents/{index}")
def update_document_status(
    kyc_id: int,
    index: int,
    payload: DocumentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(KYC).filter(KYC.id == kyc_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC record not found")

    docs = list(record.documents or [])
    if index < 0 or index >= len(docs):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    docs[index]["status"] = payload.status
    record.documents = docs
    db.commit()
    return {"documents": record.documents}


@router.delete("/{kyc_id}/documents/{index}")
def delete_document(
    kyc_id: int,
    index: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(KYC).filter(KYC.id == kyc_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KYC record not found")

    docs = list(record.documents or [])
    if index < 0 or index >= len(docs):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    docs.pop(index)
    record.documents = docs
    db.commit()
    return {"documents": record.documents}
