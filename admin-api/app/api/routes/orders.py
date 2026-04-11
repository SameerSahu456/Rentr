import os
import uuid
from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_optional_customer
from app.models.models import Customer
from app.models.models import (
    AdminUser, AdvanceReplacement, Order, Asset, Invoice, Payment, Contract,
    ReturnRequest, SupportTicket, ProformaInvoice, DeliveryChallan, Shipment,
    Replacement, SecurityDeposit, CreditNote, InsurancePolicy,
)
from app.schemas.schemas import (
    OrderCreate,
    OrderResponse,
    OrderListResponse,
    OrderUpdate,
)

router = APIRouter(prefix="/orders", tags=["orders"])

MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "media")
SALES_ORDER_DIR = os.path.join(MEDIA_DIR, "sales_orders")
os.makedirs(SALES_ORDER_DIR, exist_ok=True)


def _generate_order_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"ORD-{year}-"
    last = (
        db.query(Order)
        .filter(Order.order_number.like(f"{prefix}%"))
        .order_by(Order.order_number.desc())
        .first()
    )
    if last:
        seq = int(last.order_number.split("-")[-1]) + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"


# Public endpoint - frontend calls this to place an order
@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    customer: Customer | None = Depends(get_optional_customer),
):
    order_number = _generate_order_number(db)
    # Compute next billing date: 1 month from today if not provided
    next_bill = payload.next_billing_date
    if not next_bill:
        today = date.today()
        next_bill = today.replace(day=1) + timedelta(days=32)
        next_bill = next_bill.replace(day=1)  # first of next month

    order = Order(
        order_number=order_number,
        saleor_order_id=payload.saleor_order_id,
        source=payload.source,
        crm_order_id=payload.crm_order_id,
        customer_id=customer.id if customer else None,
        customer_name=customer.full_name if customer else payload.customer_name,
        customer_email=customer.email if customer else payload.customer_email,
        customer_type=customer.role if customer else payload.customer_type,
        items=payload.items,
        total_monthly=payload.total_monthly,
        rental_months=payload.rental_months,
        next_billing_date=next_bill,
        status=payload.status,
        shipping_address=payload.shipping_address,
        billing_address=payload.billing_address,
        customer_note=payload.customer_note,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Auto-create contract with PDF on order placement
    try:
        from app.services.contract_service import create_contract_for_order
        create_contract_for_order(db, order)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(
            "Failed to auto-create contract for order %s: %s",
            order.order_number, e,
        )

    return order


# Admin endpoints - require authentication
@router.get("/", response_model=OrderListResponse)
def list_orders(
    status: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if customer_email:
        query = query.filter(Order.customer_email == customer_email)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return OrderListResponse(items=orders, total=total)


@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Cross-linked related data
    assets = (
        db.query(Asset)
        .filter(Asset.order_id == order.order_number)
        .all()
    )
    invoices = (
        db.query(Invoice)
        .filter(Invoice.order_id == order.order_number)
        .all()
    )
    # Flatten payments from all invoices
    invoice_ids = [inv.id for inv in invoices]
    invoice_number_map = {inv.id: inv.invoice_number for inv in invoices}
    payments = (
        db.query(Payment)
        .filter(Payment.invoice_id.in_(invoice_ids))
        .all()
    ) if invoice_ids else []
    contracts = (
        db.query(Contract)
        .filter(Contract.order_id == order.order_number)
        .all()
    )
    returns = (
        db.query(ReturnRequest)
        .filter(ReturnRequest.order_id == order.order_number)
        .all()
    )
    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.order_id == order.order_number)
        .all()
    )

    # Serialize order fields
    order_dict = {c.name: getattr(order, c.name) for c in Order.__table__.columns}

    order_dict["assets"] = [
        {"id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model, "status": a.status,
         "condition_grade": a.condition_grade, "monthly_rate": a.monthly_rate, "category": a.category}
        for a in assets
    ]
    order_dict["invoices"] = [
        {"id": inv.id, "invoice_number": inv.invoice_number, "total": inv.total,
         "status": inv.status, "due_date": inv.due_date, "created_at": inv.created_at}
        for inv in invoices
    ]
    order_dict["payments"] = [
        {"id": p.id, "invoice_id": p.invoice_id,
         "invoice_number": invoice_number_map.get(p.invoice_id),
         "amount": p.amount, "method": p.method, "status": p.status,
         "transaction_id": p.transaction_id, "paid_at": p.paid_at}
        for p in payments
    ]
    order_dict["contracts"] = [
        {"id": c.id, "contract_number": c.contract_number, "status": c.status,
         "start_date": c.start_date, "end_date": c.end_date,
         "document_url": c.document_url, "type": c.type}
        for c in contracts
    ]
    order_dict["returns"] = [
        {"id": r.id, "return_number": r.return_number, "status": r.status,
         "reason": r.reason, "asset_uids": r.asset_uids, "pickup_date": r.pickup_date,
         "damage_charges": r.damage_charges, "created_at": r.created_at}
        for r in returns
    ]
    order_dict["tickets"] = [
        {"id": t.id, "ticket_number": t.ticket_number, "subject": t.subject,
         "priority": t.priority, "status": t.status, "category": t.category,
         "created_at": t.created_at}
        for t in tickets
    ]

    # Advance replacements from dedicated model
    ar_records = (
        db.query(AdvanceReplacement)
        .filter(AdvanceReplacement.order_id == order.order_number)
        .order_by(AdvanceReplacement.created_at.desc())
        .all()
    )
    ar_list = []
    for ar in ar_records:
        faulty = db.query(Asset).filter(Asset.id == ar.faulty_asset_id).first() if ar.faulty_asset_id else None
        repl = db.query(Asset).filter(Asset.id == ar.replacement_asset_id).first() if ar.replacement_asset_id else None
        ar_list.append({
            "id": ar.id,
            "faulty_uid": ar.faulty_asset_uid,
            "faulty_id": ar.faulty_asset_id,
            "faulty_model": f"{faulty.oem} {faulty.model}" if faulty else None,
            "replacement_uid": ar.replacement_asset_uid,
            "replacement_id": ar.replacement_asset_id,
            "replacement_model": f"{repl.oem} {repl.model}" if repl else None,
            "replacement_status": repl.status if repl else None,
            "reason": ar.reason,
            "status": ar.status,
            "return_id": ar.return_id,
            "notes": ar.notes,
            "created_at": ar.created_at,
        })

    # Fallback: also check legacy advance_replaced assets not in new model
    replaced_assets = [a for a in assets if a.status == "advance_replaced"]
    tracked_uids = {r["faulty_uid"] for r in ar_list}
    for ra in replaced_assets:
        if ra.uid not in tracked_uids:
            replacement = (
                db.query(Asset)
                .filter(Asset.order_id == order.order_number, Asset.notes.ilike(f"%{ra.uid}%"))
                .first()
            )
            ar_list.append({
                "id": None,
                "faulty_uid": ra.uid,
                "faulty_id": ra.id,
                "faulty_model": f"{ra.oem} {ra.model}",
                "replacement_uid": replacement.uid if replacement else None,
                "replacement_id": replacement.id if replacement else None,
                "replacement_model": f"{replacement.oem} {replacement.model}" if replacement else None,
                "replacement_status": replacement.status if replacement else None,
                "reason": None,
                "status": "completed" if replacement else "initiated",
                "return_id": None,
                "notes": ra.notes,
                "created_at": ra.updated_at,
            })
    order_dict["advance_replacements"] = ar_list

    # ── Proforma Invoices ──
    pi_records = (
        db.query(ProformaInvoice)
        .filter(ProformaInvoice.order_id == order.order_number)
        .order_by(ProformaInvoice.created_at.desc())
        .all()
    )
    order_dict["proforma_invoices"] = [
        {"id": pi.id, "pi_number": pi.pi_number, "total": pi.total,
         "status": pi.status, "security_deposit": pi.security_deposit,
         "validity_days": pi.validity_days, "created_at": pi.created_at}
        for pi in pi_records
    ]

    # ── Delivery Challans ──
    dc_records = (
        db.query(DeliveryChallan)
        .filter(DeliveryChallan.order_id == order.order_number)
        .order_by(DeliveryChallan.created_at.desc())
        .all()
    )
    order_dict["delivery_challans"] = [
        {"id": dc.id, "dc_number": dc.dc_number, "challan_type": dc.challan_type,
         "status": dc.status, "asset_uids": dc.asset_uids,
         "transporter_name": dc.transporter_name, "lr_number": dc.lr_number,
         "eway_bill_number": dc.eway_bill_number, "dispatched_at": dc.dispatched_at,
         "delivered_at": dc.delivered_at, "received_by": dc.received_by,
         "created_at": dc.created_at}
        for dc in dc_records
    ]

    # ── Shipments ──
    shipment_records = (
        db.query(Shipment)
        .filter(Shipment.order_id == order.order_number)
        .order_by(Shipment.created_at.desc())
        .all()
    )
    order_dict["shipments"] = [
        {"id": s.id, "shipment_number": s.shipment_number, "shipment_type": s.shipment_type,
         "logistics_partner": s.logistics_partner, "tracking_number": s.tracking_number,
         "tracking_url": s.tracking_url, "status": s.status,
         "estimated_delivery": s.estimated_delivery, "delivered_at": s.delivered_at,
         "asset_uids": s.asset_uids, "created_at": s.created_at}
        for s in shipment_records
    ]

    # ── Replacements (unified) ──
    rpl_records = (
        db.query(Replacement)
        .filter(Replacement.order_id == order.order_number)
        .order_by(Replacement.created_at.desc())
        .all()
    )
    rpl_list = []
    for r in rpl_records:
        faulty = db.query(Asset).filter(Asset.id == r.faulty_asset_id).first() if r.faulty_asset_id else None
        repl = db.query(Asset).filter(Asset.id == r.replacement_asset_id).first() if r.replacement_asset_id else None
        rpl_list.append({
            "id": r.id, "replacement_number": r.replacement_number,
            "replacement_type": r.replacement_type,
            "faulty_uid": r.faulty_asset_uid, "faulty_id": r.faulty_asset_id,
            "faulty_model": f"{faulty.oem} {faulty.model}" if faulty else None,
            "replacement_uid": r.replacement_asset_uid, "replacement_id": r.replacement_asset_id,
            "replacement_model": f"{repl.oem} {repl.model}" if repl else None,
            "faulty_reason": r.faulty_reason, "status": r.status,
            "return_id": r.return_id, "outbound_dc_number": r.outbound_dc_number,
            "inbound_dc_number": r.inbound_dc_number,
            "damage_charges": r.damage_charges, "notes": r.notes,
            "created_at": r.created_at,
        })
    order_dict["replacements"] = rpl_list

    # ── Security Deposits ──
    dep_records = (
        db.query(SecurityDeposit)
        .filter(SecurityDeposit.order_id == order.order_number)
        .all()
    )
    order_dict["security_deposits"] = [
        {"id": d.id, "deposit_number": d.deposit_number, "amount": d.amount,
         "status": d.status, "received_date": d.received_date,
         "refund_amount": d.refund_amount, "deductions": d.deductions}
        for d in dep_records
    ]

    # ── Credit / Debit Notes ──
    cn_records = (
        db.query(CreditNote)
        .filter(CreditNote.order_id == order.order_number)
        .all()
    )
    order_dict["credit_notes"] = [
        {"id": cn.id, "cn_number": cn.cn_number, "note_type": cn.note_type,
         "reason": cn.reason, "total": cn.total, "status": cn.status,
         "created_at": cn.created_at}
        for cn in cn_records
    ]

    # ── Insurance Policies ──
    ins_records = (
        db.query(InsurancePolicy)
        .filter(InsurancePolicy.order_id == order.order_number)
        .all()
    )
    order_dict["insurance_policies"] = [
        {"id": ip.id, "policy_number": ip.policy_number, "provider": ip.provider,
         "coverage_type": ip.coverage_type, "sum_insured": ip.sum_insured,
         "premium": ip.premium, "status": ip.status,
         "start_date": ip.start_date, "end_date": ip.end_date}
        for ip in ins_records
    ]

    # Compute next_billing_date if not set
    if not order_dict.get("next_billing_date"):
        latest_inv = (
            db.query(Invoice)
            .filter(Invoice.order_id == order.order_number)
            .order_by(Invoice.due_date.desc())
            .first()
        )
        if latest_inv and latest_inv.due_date:
            nbd = latest_inv.due_date.replace(day=1) + timedelta(days=32)
            order_dict["next_billing_date"] = nbd.replace(day=latest_inv.due_date.day)
        else:
            today = date.today()
            nbd = today.replace(day=1) + timedelta(days=32)
            order_dict["next_billing_date"] = nbd.replace(day=1)

    return order_dict


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    return order


# ── CRM Sync endpoint ───────────────────────────────────────────────────────


@router.post("/crm-sync", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_crm_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Create or sync an order from CRM. Sets source=crm automatically."""
    # Check for duplicate by crm_order_id
    if payload.crm_order_id:
        existing = db.query(Order).filter(Order.crm_order_id == payload.crm_order_id).first()
        if existing:
            # Update existing CRM order
            for field, value in payload.model_dump(exclude_unset=True).items():
                if field not in ("crm_order_id",):
                    setattr(existing, field, value)
            existing.source = "crm"
            db.commit()
            db.refresh(existing)
            return existing

    order_number = _generate_order_number(db)

    next_bill = payload.next_billing_date
    if not next_bill:
        today = date.today()
        next_bill = today.replace(day=1) + timedelta(days=32)
        next_bill = next_bill.replace(day=1)

    # Match customer
    customer = db.query(Customer).filter(Customer.email == payload.customer_email).first()

    order = Order(
        order_number=order_number,
        saleor_order_id=payload.saleor_order_id,
        source="crm",
        crm_order_id=payload.crm_order_id,
        customer_id=customer.id if customer else None,
        customer_name=customer.full_name if customer else payload.customer_name,
        customer_email=customer.email if customer else payload.customer_email,
        customer_type=customer.role if customer else payload.customer_type,
        items=payload.items,
        total_monthly=payload.total_monthly,
        rental_months=payload.rental_months,
        next_billing_date=next_bill,
        status=payload.status,
        shipping_address=payload.shipping_address,
        billing_address=payload.billing_address,
        customer_note=payload.customer_note,
        sales_order_pdf=payload.sales_order_pdf,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Auto-create contract
    try:
        from app.services.contract_service import create_contract_for_order
        create_contract_for_order(db, order)
    except Exception:
        pass

    return order


@router.post("/{order_id}/sales-order-pdf")
async def upload_sales_order_pdf(
    order_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Upload a sales order PDF for a CRM order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    ext = os.path.splitext(file.filename or "")[1] or ".pdf"
    unique_name = f"{order.order_number}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(SALES_ORDER_DIR, unique_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    order.sales_order_pdf = f"/media/sales_orders/{unique_name}"
    db.commit()
    db.refresh(order)
    return {"sales_order_pdf": order.sales_order_pdf}
