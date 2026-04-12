from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_distributor
from app.models.models import (
    DistributorUser, DistributorContract, DistributorCustomer,
)

router = APIRouter(prefix="/contracts", tags=["distributor-contracts"])


class ContractCreate(BaseModel):
    customer_id: int
    order_id: int | None = None
    type: str = "rental"
    start_date: date | None = None
    end_date: date | None = None
    terms: str | None = None


class ContractUpdate(BaseModel):
    status: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    terms: str | None = None
    document_url: str | None = None


def _next_contract_number(db: Session, dist_id: int) -> str:
    count = db.query(func.count(DistributorContract.id)).filter(
        DistributorContract.distributor_id == dist_id
    ).scalar() or 0
    return f"DIST-CON-{date.today().year}-{count + 1:04d}"


@router.get("/")
def list_contracts(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    query = db.query(DistributorContract).filter(DistributorContract.distributor_id == current.id)
    if search:
        query = query.filter(
            (DistributorContract.contract_number.ilike(f"%{search}%"))
            | (DistributorContract.customer_name.ilike(f"%{search}%"))
        )
    if status:
        query = query.filter(DistributorContract.status == status)
    total = query.count()
    items = query.order_by(DistributorContract.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "items": [
            {
                "id": c.id, "contract_number": c.contract_number,
                "customer_name": c.customer_name, "customer_email": c.customer_email,
                "type": c.type, "status": c.status,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in items
        ],
        "total": total,
    }


@router.get("/{contract_id}")
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    c = db.query(DistributorContract).filter(
        DistributorContract.id == contract_id,
        DistributorContract.distributor_id == current.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {
        "id": c.id, "contract_number": c.contract_number,
        "customer_id": c.customer_id, "order_id": c.order_id,
        "customer_name": c.customer_name, "customer_email": c.customer_email,
        "type": c.type, "status": c.status, "terms": c.terms,
        "document_url": c.document_url,
        "start_date": c.start_date.isoformat() if c.start_date else None,
        "end_date": c.end_date.isoformat() if c.end_date else None,
        "signed_at": c.signed_at.isoformat() if c.signed_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "invoices": [
            {"id": i.id, "invoice_number": i.invoice_number, "total": i.total,
             "status": i.status, "due_date": i.due_date.isoformat() if i.due_date else None}
            for i in (c.invoices or [])
        ],
    }


@router.post("/", status_code=201)
def create_contract(
    payload: ContractCreate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    cust = db.query(DistributorCustomer).filter(
        DistributorCustomer.id == payload.customer_id,
        DistributorCustomer.distributor_id == current.id,
    ).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    contract = DistributorContract(
        contract_number=_next_contract_number(db, current.id),
        distributor_id=current.id,
        customer_id=cust.id,
        order_id=payload.order_id,
        customer_name=cust.name,
        customer_email=cust.email,
        type=payload.type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        terms=payload.terms,
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return {"id": contract.id, "contract_number": contract.contract_number, "message": "Contract created"}


@router.put("/{contract_id}")
def update_contract(
    contract_id: int,
    payload: ContractUpdate,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    c = db.query(DistributorContract).filter(
        DistributorContract.id == contract_id,
        DistributorContract.distributor_id == current.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")

    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(c, key, val)
    db.commit()
    db.refresh(c)
    return {"message": "Contract updated"}
