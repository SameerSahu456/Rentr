import os
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, KYCSubmission

router = APIRouter(prefix="/kyc", tags=["kyc"])

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "media")
DOCS_DIR = os.path.join(MEDIA_DIR, "kyc_documents")
os.makedirs(DOCS_DIR, exist_ok=True)


@router.get("/stats")
def kyc_stats(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    pending = (
        db.query(func.count(KYCSubmission.id))
        .filter(KYCSubmission.status == "pending")
        .scalar()
        or 0
    )
    under_review = (
        db.query(func.count(KYCSubmission.id))
        .filter(KYCSubmission.status == "under_review")
        .scalar()
        or 0
    )
    approved = (
        db.query(func.count(KYCSubmission.id))
        .filter(KYCSubmission.status == "approved")
        .scalar()
        or 0
    )
    rejected = (
        db.query(func.count(KYCSubmission.id))
        .filter(KYCSubmission.status == "rejected")
        .scalar()
        or 0
    )

    return {
        "pending": pending,
        "under_review": under_review,
        "approved": approved,
        "rejected": rejected,
    }


@router.get("/")
def list_kyc(
    status_filter: Optional[str] = Query(None, alias="status"),
    account_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(KYCSubmission)
    if status_filter:
        query = query.filter(KYCSubmission.status == status_filter)
    if account_type:
        query = query.filter(KYCSubmission.account_type == account_type)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                KYCSubmission.customer_email.ilike(pattern),
                KYCSubmission.customer_name.ilike(pattern),
                KYCSubmission.gstin.ilike(pattern),
            )
        )

    total = query.count()
    items = (
        query.order_by(KYCSubmission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {"items": items, "total": total}


@router.get("/{kyc_id}")
def get_kyc(
    kyc_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    kyc = db.query(KYCSubmission).filter(KYCSubmission.id == kyc_id).first()
    if not kyc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="KYC submission not found"
        )
    return kyc


@router.put("/{kyc_id}")
def update_kyc(
    kyc_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    kyc = db.query(KYCSubmission).filter(KYCSubmission.id == kyc_id).first()
    if not kyc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="KYC submission not found"
        )

    allowed_fields = {
        "status",
        "credit_limit",
        "reviewer",
        "review_notes",
        "rejection_reason",
    }

    old_status = kyc.status
    new_status = payload.get("status")

    for field, value in payload.items():
        if field in allowed_fields:
            setattr(kyc, field, value)

    # Set reviewed_at when status changes to approved or rejected
    if new_status and new_status != old_status and new_status in ("approved", "rejected"):
        kyc.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(kyc)
    return kyc


@router.post("/by-email")
def create_kyc_for_customer(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Create a KYC submission for a customer who doesn't have one yet."""
    email = payload.get("customer_email")
    if not email:
        raise HTTPException(status_code=400, detail="customer_email is required")

    existing = db.query(KYCSubmission).filter(KYCSubmission.customer_email == email).first()
    if existing:
        return existing

    kyc = KYCSubmission(
        customer_email=email,
        customer_name=payload.get("customer_name", ""),
        company_name=payload.get("company_name", ""),
        account_type=payload.get("account_type", ""),
        status="pending",
        documents=[],
    )
    db.add(kyc)
    db.commit()
    db.refresh(kyc)
    return kyc


@router.post("/{kyc_id}/documents")
async def upload_kyc_documents(
    kyc_id: int,
    document_type: str = Query(..., description="Type of document e.g. PAN, GST, Aadhaar"),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    kyc = db.query(KYCSubmission).filter(KYCSubmission.id == kyc_id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC submission not found")

    documents = list(kyc.documents or [])

    for file in files:
        ext = os.path.splitext(file.filename or "")[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(DOCS_DIR, unique_name)

        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        documents.append({
            "type": document_type,
            "filename": file.filename,
            "url": f"/media/kyc_documents/{unique_name}",
            "status": "pending",
        })

    kyc.documents = documents
    db.commit()
    db.refresh(kyc)
    return kyc


@router.put("/{kyc_id}/documents/{doc_index}")
def update_document_status(
    kyc_id: int,
    doc_index: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Approve or reject a specific document within a KYC submission."""
    kyc = db.query(KYCSubmission).filter(KYCSubmission.id == kyc_id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC submission not found")

    documents = list(kyc.documents or [])
    if doc_index < 0 or doc_index >= len(documents):
        raise HTTPException(status_code=400, detail="Invalid document index")

    new_status = payload.get("status")
    if new_status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="Status must be approved, rejected, or pending")

    documents[doc_index] = {**documents[doc_index], "status": new_status}
    if payload.get("note"):
        documents[doc_index]["note"] = payload["note"]

    kyc.documents = documents
    db.commit()
    db.refresh(kyc)
    return kyc


@router.delete("/{kyc_id}/documents/{doc_index}")
def delete_document(
    kyc_id: int,
    doc_index: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Delete a document from a KYC submission."""
    kyc = db.query(KYCSubmission).filter(KYCSubmission.id == kyc_id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC submission not found")

    documents = list(kyc.documents or [])
    if doc_index < 0 or doc_index >= len(documents):
        raise HTTPException(status_code=400, detail="Invalid document index")

    removed = documents.pop(doc_index)
    # Remove file from disk
    if removed.get("url"):
        file_path = os.path.join(MEDIA_DIR, removed["url"].lstrip("/media/"))
        if os.path.exists(file_path):
            os.remove(file_path)

    kyc.documents = documents
    db.commit()
    db.refresh(kyc)
    return kyc
