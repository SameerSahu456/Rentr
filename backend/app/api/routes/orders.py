from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.models.rental import (
    Customer, Contract, Asset, Invoice, Payment, Return,
    SupportTicket, Replacement, Shipment,
)
from app.schemas.order import OrderCreate

router = APIRouter(prefix="/orders", tags=["Orders"])


class OrderStatusUpdate(BaseModel):
    status: str


@router.get("/")
def list_orders(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all orders (admin view)."""
    query = db.query(Order)

    if search:
        s = f"%{search}%"
        # Search by order ID or customer info
        user_ids = [u.id for u in db.query(User).filter(
            (User.full_name.ilike(s)) | (User.email.ilike(s))
        ).all()]
        query = query.filter(
            (Order.id.in_([int(search)] if search.isdigit() else [])) |
            (Order.user_id.in_(user_ids))
        )

    orders = query.order_by(Order.created_at.desc()).all()

    items = []
    for o in orders:
        customer = db.query(User).filter(User.id == o.user_id).first()
        cust_record = db.query(Customer).filter(Customer.email == customer.email).first() if customer else None

        order_items = []
        for oi in o.items:
            product = oi.product
            order_items.append({
                "product_name": product.name if product else "Unknown",
                "quantity": oi.quantity,
                "price_per_month": oi.price_per_month,
            })

        items.append({
            "id": o.id,
            "order_number": f"ORD-{o.id:05d}",
            "source": "crm" if cust_record and cust_record.customer_type == "partner" else "website",
            "customer_name": customer.full_name if customer else "Unknown",
            "customer_email": customer.email if customer else "",
            "customer_type": cust_record.customer_type if cust_record else "customer",
            "items": order_items,
            "total_monthly": float(o.total_amount or 0),
            "rental_months": o.rental_months,
            "status": o.status.value if hasattr(o.status, "value") else o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })

    return {"items": items}


@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get order details by ID (admin view)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    customer = db.query(User).filter(User.id == order.user_id).first()
    cust_record = db.query(Customer).filter(Customer.email == customer.email).first() if customer else None

    order_items = []
    for oi in order.items:
        product = oi.product
        order_items.append({
            "id": oi.id,
            "product_id": oi.product_id,
            "product_name": product.name if product else "Unknown",
            "quantity": oi.quantity,
            "price_per_month": oi.price_per_month,
        })

    cust_email = customer.email if customer else ""

    # Linked assets (deployed to this customer)
    linked_assets = db.query(Asset).filter(Asset.customer_email == cust_email).all()
    assets_data = [
        {"id": a.id, "uid": a.uid, "oem": a.oem, "model": a.model, "status": a.status,
         "condition_grade": a.condition_grade, "monthly_rate": float(a.monthly_rate or 0)}
        for a in linked_assets
    ]

    # Linked contracts
    linked_contracts = db.query(Contract).filter(Contract.order_id == order.id).all()
    if not linked_contracts:
        linked_contracts = db.query(Contract).filter(Contract.customer_email == cust_email).all()

    # Linked invoices (via contracts or customer email)
    linked_invoices = db.query(Invoice).filter(Invoice.customer_email == cust_email).order_by(Invoice.created_at.desc()).all()
    invoices_data = [
        {"id": inv.id, "invoice_number": inv.invoice_number, "total": float(inv.total or 0),
         "status": inv.status, "due_date": inv.due_date.isoformat() if inv.due_date else None}
        for inv in linked_invoices
    ]

    # Linked payments (via invoices)
    invoice_ids = [inv.id for inv in linked_invoices]
    linked_payments = db.query(Payment).filter(Payment.invoice_id.in_(invoice_ids)).order_by(Payment.created_at.desc()).all() if invoice_ids else []
    payments_data = [
        {"id": p.id, "invoice_number": p.invoice_number, "amount": float(p.amount or 0),
         "method": p.method, "status": p.status, "transaction_id": p.transaction_id,
         "created_at": p.created_at.isoformat() if p.created_at else None}
        for p in linked_payments
    ]

    # Linked returns
    linked_returns = db.query(Return).filter(Return.customer_email == cust_email).order_by(Return.created_at.desc()).all()
    returns_data = [
        {"id": r.id, "return_number": r.return_number, "reason": r.reason, "status": r.status,
         "asset_uids": r.asset_uids or [], "damage_charges": float(r.damage_charges or 0)}
        for r in linked_returns
    ]

    # Linked tickets
    linked_tickets = db.query(SupportTicket).filter(SupportTicket.customer_email == cust_email).order_by(SupportTicket.created_at.desc()).all()
    tickets_data = [
        {"id": t.id, "ticket_number": t.ticket_number, "subject": t.subject,
         "priority": t.priority, "status": t.status}
        for t in linked_tickets
    ]

    # Linked advance replacements
    linked_replacements = db.query(Replacement).filter(
        Replacement.replacement_type == "advance", Replacement.order_id == order.id
    ).all()
    if not linked_replacements:
        linked_replacements = db.query(Replacement).filter(
            Replacement.replacement_type == "advance", Replacement.customer_name == (customer.full_name if customer else "")
        ).all()
    replacements_data = [
        {"id": r.id, "replacement_number": r.replacement_number, "faulty_asset_uid": r.faulty_asset_uid,
         "replacement_asset_uid": r.replacement_asset_uid, "status": r.status}
        for r in linked_replacements
    ]

    return {
        "id": order.id,
        "order_number": f"ORD-{order.id:05d}",
        "source": "crm" if cust_record and cust_record.customer_type == "partner" else "website",
        "customer_name": customer.full_name if customer else "Unknown",
        "customer_email": cust_email,
        "customer_type": cust_record.customer_type if cust_record else "customer",
        "status": order.status.value if hasattr(order.status, "value") else order.status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "shipping_address": order.shipping_address,
        "billing_address": order.shipping_address,
        "items": order_items,
        "total_monthly": float(order.total_amount or 0),
        "rental_months": order.rental_months,
        "sales_order_pdf": None,
        "assets": assets_data,
        "invoices": invoices_data,
        "payments": payments_data,
        "returns": returns_data,
        "tickets": tickets_data,
        "advance_replacements": replacements_data,
    }


@router.put("/{order_id}")
def update_order(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update order status."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status
    db.commit()
    db.refresh(order)

    customer = db.query(User).filter(User.id == order.user_id).first()
    return {
        "id": order.id,
        "order_number": f"ORD-{order.id:05d}",
        "status": order.status.value if hasattr(order.status, "value") else order.status,
        "customer_name": customer.full_name if customer else "Unknown",
        "total_monthly": float(order.total_amount or 0),
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create an order from the current user's cart."""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = 0.0
    order_items_data = []
    for cart_item in cart.items:
        product = cart_item.product
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product '{product.name if product else 'unknown'}' is no longer available")
        item_total = product.price_per_month * cart_item.quantity * payload.rental_months
        total_amount += item_total
        order_items_data.append({
            "product_id": cart_item.product_id,
            "quantity": cart_item.quantity,
            "price_per_month": product.price_per_month,
        })

    order = Order(
        user_id=current_user.id, status="pending", total_amount=total_amount,
        rental_months=payload.rental_months,
        shipping_address=payload.shipping_address.model_dump(),
    )
    db.add(order)
    db.flush()

    for item_data in order_items_data:
        db.add(OrderItem(order_id=order.id, **item_data))

    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    db.refresh(order)

    return {"id": order.id, "order_number": f"ORD-{order.id:05d}", "status": "pending"}
