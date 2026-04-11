from datetime import datetime
from typing import Optional, List, Any

from pydantic import BaseModel, Field


# --- Cart Schemas ---

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)
    rental_months: int = Field(default=1, ge=1, le=60)


class CartItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=1)
    rental_months: Optional[int] = Field(None, ge=1, le=60)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    price_per_month: Optional[float] = None
    quantity: int
    rental_months: int

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: int
    items: List[CartItemResponse]
    total_monthly: float
    total_items: int

    model_config = {"from_attributes": True}


# --- Order Schemas ---

class ShippingAddress(BaseModel):
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    phone: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    price_per_month: float

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    rental_months: int = Field(..., ge=1, le=60)
    shipping_address: ShippingAddress


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: float
    rental_months: int
    shipping_address: Optional[dict[str, Any]] = None
    items: List[OrderItemResponse]
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderListItem(BaseModel):
    id: int
    status: str
    total_amount: float
    rental_months: int
    created_at: datetime
    item_count: int

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: List[OrderListItem]
    total: int


# --- Search Schemas ---

class SearchQuery(BaseModel):
    q: str = Field(..., min_length=1, max_length=500)


class SearchAutoCompleteResponse(BaseModel):
    suggestions: List[str]


class SearchHistoryResponse(BaseModel):
    queries: List[str]
