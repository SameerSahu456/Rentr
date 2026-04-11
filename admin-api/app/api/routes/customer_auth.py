from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_customer,
    hash_password,
    verify_password,
)
from app.models.models import Customer, Order
from app.schemas.schemas import (
    CustomerLogin,
    CustomerRegister,
    CustomerResponse,
    CustomerTokenResponse,
    CustomerUpdate,
    OrderListResponse,
)

router = APIRouter(prefix="/customer-auth", tags=["customer-auth"])


@router.post("/register", response_model=CustomerTokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: CustomerRegister, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    customer = Customer(
        email=payload.email,
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
        company_name=payload.company_name,
        industry=payload.industry,
        gst_no=payload.gst_no,
        company_pan=payload.company_pan,
        password_hash=hash_password(payload.password),
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    token = create_access_token(
        {"sub": str(customer.id), "email": customer.email, "user_type": "customer"}
    )
    return CustomerTokenResponse(
        access_token=token,
        user=CustomerResponse.model_validate(customer),
    )


@router.post("/login", response_model=CustomerTokenResponse)
def login(payload: CustomerLogin, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.email == payload.email).first()
    if not customer or not verify_password(payload.password, customer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not customer.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token = create_access_token(
        {"sub": str(customer.id), "email": customer.email, "user_type": "customer"}
    )
    return CustomerTokenResponse(
        access_token=token,
        user=CustomerResponse.model_validate(customer),
    )


@router.get("/me", response_model=CustomerResponse)
def get_me(customer: Customer = Depends(get_current_customer)):
    return customer


@router.patch("/me", response_model=CustomerResponse)
def update_me(
    payload: CustomerUpdate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/orders", response_model=OrderListResponse)
def get_my_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    query = db.query(Order).filter(Order.customer_email == customer.email)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return OrderListResponse(items=orders, total=total)
