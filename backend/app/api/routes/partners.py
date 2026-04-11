from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.rental import (
    Customer, CustomerType, KYC, Asset, Contract, Invoice, Return, SupportTicket,
)

router = APIRouter(prefix="/partners", tags=["Partners"])


@router.get("/")
def list_partners(
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Customer).filter(Customer.customer_type == CustomerType.partner)
    if search:
        query = query.filter(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
                Customer.company_name.ilike(f"%{search}%"),
            )
        )
    partners = query.order_by(Customer.created_at.desc()).all()
    return {
        "items": [
            {
                "id": p.id,
                "email": p.email,
                "name": p.name,
                "company_name": p.company_name,
                "tier": p.tier.value if p.tier else None,
                "kyc_status": p.kyc_status.value if p.kyc_status else None,
                "credit_limit": p.credit_limit,
                "credit_used": p.credit_used,
                "monthly_revenue": p.monthly_revenue,
                "outstanding": p.outstanding,
                "total_assets": p.total_assets,
                "open_tickets": p.open_tickets,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in partners
        ]
    }


@router.get("/{email}")
def get_partner(
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    partner = (
        db.query(Customer)
        .filter(Customer.email == email, Customer.customer_type == CustomerType.partner)
        .first()
    )
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")

    kyc_records = db.query(KYC).filter(KYC.customer_id == partner.id).all()
    assets = db.query(Asset).filter(Asset.customer_email == email).all()
    invoices = db.query(Invoice).filter(Invoice.customer_email == email).all()
    contracts = db.query(Contract).filter(Contract.customer_email == email).all()
    returns = db.query(Return).filter(Return.customer_email == email).all()
    tickets = db.query(SupportTicket).filter(SupportTicket.customer_email == email).all()

    latest_kyc = kyc_records[-1] if kyc_records else None

    return {
        "id": partner.id,
        "email": partner.email,
        "name": partner.name,
        "company_name": partner.company_name,
        "gstin": partner.gstin,
        "pan": partner.pan,
        "tier": partner.tier.value if partner.tier else None,
        "kyc_status": partner.kyc_status.value if partner.kyc_status else None,
        "credit_limit": partner.credit_limit,
        "credit_used": partner.credit_used,
        "monthly_revenue": partner.monthly_revenue,
        "outstanding": partner.outstanding,
        "total_assets": partner.total_assets,
        "open_tickets": partner.open_tickets,
        "created_at": partner.created_at.isoformat() if partner.created_at else None,
        "profile": {
            "company_name": partner.company_name,
            "gstin": partner.gstin,
            "pan": partner.pan,
        },
        "kyc": {
            "status": latest_kyc.status.value if latest_kyc else None,
            "credit_limit": latest_kyc.credit_limit if latest_kyc else 0,
            "documents": latest_kyc.documents if latest_kyc else [],
        } if latest_kyc else None,
        "metrics": {
            "monthly_revenue": partner.monthly_revenue,
            "outstanding": partner.outstanding,
            "total_assets": partner.total_assets,
            "open_tickets": partner.open_tickets,
            "credit_limit": partner.credit_limit,
            "credit_used": partner.credit_used,
        },
        "assets": [
            {
                "id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model,
                "category": a.category.value if a.category else None,
                "status": a.status.value if a.status else None,
            }
            for a in assets
        ],
        "invoices": [
            {
                "id": i.id, "invoice_number": i.invoice_number,
                "total": i.total, "status": i.status.value if i.status else None,
                "due_date": i.due_date.isoformat() if i.due_date else None,
            }
            for i in invoices
        ],
        "contracts": [
            {
                "id": c.id, "contract_number": c.contract_number,
                "status": c.status.value if c.status else None,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
            }
            for c in contracts
        ],
        "returns": [
            {
                "id": r.id, "return_number": r.return_number,
                "status": r.status.value if r.status else None,
            }
            for r in returns
        ],
        "tickets": [
            {
                "id": t.id, "ticket_number": t.ticket_number,
                "subject": t.subject,
                "status": t.status.value if t.status else None,
                "priority": t.priority.value if t.priority else None,
            }
            for t in tickets
        ],
    }
