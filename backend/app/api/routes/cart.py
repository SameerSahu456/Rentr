from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.order import CartItemAdd, CartItemUpdate, CartResponse, CartItemResponse

router = APIRouter(prefix="/cart", tags=["Cart"])


def _get_or_create_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def _build_cart_response(cart: Cart) -> CartResponse:
    items = []
    total_monthly = 0.0
    for item in cart.items:
        product = item.product
        price = product.price_per_month if product else 0
        items.append(
            CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=product.name if product else None,
                product_image=product.image_url if product else None,
                price_per_month=price,
                quantity=item.quantity,
                rental_months=item.rental_months,
            )
        )
        total_monthly += price * item.quantity

    return CartResponse(
        id=cart.id,
        items=items,
        total_monthly=total_monthly,
        total_items=sum(i.quantity for i in cart.items),
    )


@router.get("", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current user's cart."""
    cart = _get_or_create_cart(db, current_user.id)
    return _build_cart_response(cart)


@router.post("/items", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    payload: CartItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a product to the cart. If already in cart, update quantity."""
    product = db.query(Product).filter(
        Product.id == payload.product_id, Product.is_active == True  # noqa: E712
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    cart = _get_or_create_cart(db, current_user.id)

    existing_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
        .first()
    )
    if existing_item:
        existing_item.quantity += payload.quantity
        existing_item.rental_months = payload.rental_months
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=payload.product_id,
            quantity=payload.quantity,
            rental_months=payload.rental_months,
        )
        db.add(cart_item)

    db.commit()
    db.refresh(cart)
    return _build_cart_response(cart)


@router.patch("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update quantity or rental months for a cart item."""
    cart = _get_or_create_cart(db, current_user.id)
    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(cart)
    return _build_cart_response(cart)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove an item from the cart."""
    cart = _get_or_create_cart(db, current_user.id)
    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    db.delete(item)
    db.commit()
    db.refresh(cart)
    return _build_cart_response(cart)


@router.delete("", status_code=status.HTTP_200_OK)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Clear all items from the cart."""
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    return {"message": "Cart cleared"}
