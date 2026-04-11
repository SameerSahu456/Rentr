from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import AdminUser, Asset, Contract, Invoice, Order, ReturnRequest, SupportTicket

router = APIRouter(prefix="/returns", tags=["returns"])


def _generate_return_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"RET-{year}-"
    last = (
        db.query(ReturnRequest)
        .filter(ReturnRequest.return_number.like(f"{prefix}%"))
        .order_by(ReturnRequest.return_number.desc())
        .first()
    )
    if last:
        seq = int(last.return_number.split("-")[-1]) + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"


@router.get("/")
def list_returns(
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_email: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(ReturnRequest)
    if status_filter:
        query = query.filter(ReturnRequest.status == status_filter)
    if customer_email:
        query = query.filter(ReturnRequest.customer_email == customer_email)

    total = query.count()
    items = (
        query.order_by(ReturnRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {"items": items, "total": total}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_return(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    return_number = _generate_return_number(db)
    payload["return_number"] = return_number

    valid_fields = {c.name for c in ReturnRequest.__table__.columns}
    filtered = {k: v for k, v in payload.items() if k in valid_fields and k != "id"}

    ret = ReturnRequest(**filtered)
    db.add(ret)
    db.commit()
    db.refresh(ret)
    return ret


@router.get("/{return_id}")
def get_return(
    return_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    ret = db.query(ReturnRequest).filter(ReturnRequest.id == return_id).first()
    if not ret:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found"
        )

    # Cross-linked related data
    order_data = None
    if ret.order_id:
        order_obj = db.query(Order).filter(Order.order_number == ret.order_id).first()
        if order_obj:
            order_data = {
                "id": order_obj.id, "order_number": order_obj.order_number,
                "status": order_obj.status, "customer_name": order_obj.customer_name,
            }

    contract_data = None
    if ret.contract_id:
        contract_obj = db.query(Contract).filter(Contract.contract_number == ret.contract_id).first()
        if contract_obj:
            contract_data = {
                "id": contract_obj.id, "contract_number": contract_obj.contract_number,
                "status": contract_obj.status,
            }

    linked_assets = []
    asset_uids = ret.asset_uids or []
    if asset_uids:
        asset_objs = db.query(Asset).filter(Asset.uid.in_(asset_uids)).all()
        linked_assets = [
            {"id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model,
             "status": a.status, "condition_grade": a.condition_grade}
            for a in asset_objs
        ]

    ret_dict = {c.name: getattr(ret, c.name) for c in ReturnRequest.__table__.columns}
    ret_dict["order"] = order_data
    ret_dict["contract"] = contract_data
    ret_dict["linked_assets"] = linked_assets

    # Linked invoices (via order)
    if ret.order_id:
        inv_objs = db.query(Invoice).filter(Invoice.order_id == ret.order_id).all()
        ret_dict["invoices"] = [
            {"id": inv.id, "invoice_number": inv.invoice_number,
             "total": inv.total, "status": inv.status, "due_date": inv.due_date}
            for inv in inv_objs
        ]
    else:
        ret_dict["invoices"] = []

    # Linked support tickets (via order)
    if ret.order_id:
        ticket_objs = db.query(SupportTicket).filter(SupportTicket.order_id == ret.order_id).all()
        ret_dict["tickets"] = [
            {"id": t.id, "ticket_number": t.ticket_number, "subject": t.subject,
             "priority": t.priority, "status": t.status, "category": t.category}
            for t in ticket_objs
        ]
    else:
        ret_dict["tickets"] = []

    return ret_dict


@router.put("/{return_id}")
def update_return(
    return_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    ret = db.query(ReturnRequest).filter(ReturnRequest.id == return_id).first()
    if not ret:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found"
        )

    allowed_fields = {
        "status",
        "damage_charges",
        "damage_notes",
        "grn_date",
        "grn_data",
        "reviewed_by",
        "pro_rata_credit",
        "pickup_date",
        "pickup_time",
        "special_instructions",
        "data_wipe_requested",
        "asset_uids",
        "reason",
        "site",
        "ticket_id",
        "invoice_id",
    }
    for field, value in payload.items():
        if field in allowed_fields:
            setattr(ret, field, value)

    db.commit()
    db.refresh(ret)
    return ret
