from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import Payment

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/")
def list_payments(
    status: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Payment)
    if status:
        query = query.filter(Payment.status == status)
    if search:
        query = query.filter(
            or_(
                Payment.invoice_number.ilike(f"%{search}%"),
                Payment.transaction_id.ilike(f"%{search}%"),
            )
        )
    payments = query.order_by(Payment.created_at.desc()).all()
    return {
        "items": [
            {
                "id": p.id,
                "invoice_id": p.invoice_id,
                "invoice_number": p.invoice_number,
                "amount": p.amount,
                "method": p.method,
                "transaction_id": p.transaction_id,
                "status": p.status.value if p.status else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ]
    }
