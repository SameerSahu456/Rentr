from datetime import datetime
from typing import Optional, List, Any

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str
    slug: str
    parent_id: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: int
    children: List["CategoryResponse"] = []

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    name: str
    slug: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    specs: Optional[dict[str, Any]] = None
    price_per_month: float
    image_url: Optional[str] = None
    is_featured: bool = False


class ProductCreate(ProductBase):
    category_id: Optional[int] = None


class ProductListItem(BaseModel):
    id: int
    name: str
    slug: str
    category: Optional[str] = None
    brand: Optional[str] = None
    price_per_month: float
    image_url: Optional[str] = None
    is_featured: bool

    model_config = {"from_attributes": True}


class ProductDetail(BaseModel):
    id: int
    name: str
    slug: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    specs: Optional[dict[str, Any]] = None
    price_per_month: float
    image_url: Optional[str] = None
    is_featured: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: List[ProductListItem]
    total: int
    page: int
    page_size: int
    pages: int


class ProductSearchQuery(BaseModel):
    q: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort_by: Optional[str] = Field(default="created_at", pattern="^(name|price_per_month|created_at)$")
    sort_order: Optional[str] = Field(default="desc", pattern="^(asc|desc)$")
