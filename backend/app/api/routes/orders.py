from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderListItem,
    OrderListResponse,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create an order from the current user's cart."""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    # Calculate total
    total_amount = 0.0
    order_items_data = []
    for cart_item in cart.items:
        product = cart_item.product
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name if product else 'unknown'}' is no longer available",
            )
        item_total = product.price_per_month * cart_item.quantity * payload.rental_months
        total_amount += item_total
        order_items_data.append({
            "product_id": cart_item.product_id,
            "quantity": cart_item.quantity,
            "price_per_month": product.price_per_month,
        })

    # Create order
    order = Order(
        user_id=current_user.id,
        status="pending",
        total_amount=total_amount,
        rental_months=payload.rental_months,
        shipping_address=payload.shipping_address.model_dump(),
    )
    db.add(order)
    db.flush()

    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(order_id=order.id, **item_data)
        db.add(order_item)

    # Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

    db.commit()
    db.refresh(order)

    return _build_order_response(order)


@router.get("", response_model=OrderListResponse)
def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all orders for the current user."""
    query = db.query(Order).filter(Order.user_id == current_user.id)
    total = query.count()

    orders = (
        query.order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [
        OrderListItem(
            id=o.id,
            status=o.status.value if hasattr(o.status, "value") else o.status,
            total_amount=o.total_amount,
            rental_months=o.rental_months,
            created_at=o.created_at,
            item_count=len(o.items),
        )
        for o in orders
    ]

    return OrderListResponse(items=items, total=total)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get order details by ID."""
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return _build_order_response(order)


def _build_order_response(order: Order) -> OrderResponse:
    items = [
        OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name if item.product else None,
            quantity=item.quantity,
            price_per_month=item.price_per_month,
        )
        for item in order.items
    ]
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        status=order.status.value if hasattr(order.status, "value") else order.status,
        total_amount=order.total_amount,
        rental_months=order.rental_months,
        shipping_address=order.shipping_address,
        items=items,
        created_at=order.created_at,
    )
