import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc

from app.core.database import get_db
from app.models.product import Product, Category
from app.schemas.product import (
    ProductListItem,
    ProductDetail,
    ProductListResponse,
    CategoryResponse,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price per month"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price per month"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", pattern="^(name|price_per_month|created_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """List products with filtering, sorting, and pagination."""
    query = db.query(Product).filter(Product.is_active == True)  # noqa: E712

    if q:
        search_term = f"%{q}%"
        query = query.filter(
            Product.name.ilike(search_term)
            | Product.brand.ilike(search_term)
            | Product.description.ilike(search_term)
            | Product.category.ilike(search_term)
        )

    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))

    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))

    if min_price is not None:
        query = query.filter(Product.price_per_month >= min_price)

    if max_price is not None:
        query = query.filter(Product.price_per_month <= max_price)

    total = query.count()

    sort_column = getattr(Product, sort_by)
    order_func = asc if sort_order == "asc" else desc
    query = query.order_by(order_func(sort_column))

    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    return ProductListResponse(
        items=[ProductListItem.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/featured", response_model=list[ProductListItem])
def featured_products(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Get featured products."""
    products = (
        db.query(Product)
        .filter(Product.is_active == True, Product.is_featured == True)  # noqa: E712
        .order_by(Product.created_at.desc())
        .limit(limit)
        .all()
    )
    return [ProductListItem.model_validate(p) for p in products]


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """Get all categories as a flat list (with children nested)."""
    categories = db.query(Category).filter(Category.parent_id == None).all()  # noqa: E711
    result = []
    for cat in categories:
        children = db.query(Category).filter(Category.parent_id == cat.id).all()
        cat_dict = CategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            parent_id=cat.parent_id,
            children=[
                CategoryResponse(id=c.id, name=c.name, slug=c.slug, parent_id=c.parent_id)
                for c in children
            ],
        )
        result.append(cat_dict)
    return result


@router.get("/brands", response_model=list[str])
def list_brands(db: Session = Depends(get_db)):
    """Get all unique product brands."""
    brands = (
        db.query(Product.brand)
        .filter(Product.is_active == True, Product.brand != None)  # noqa: E711,E712
        .distinct()
        .order_by(Product.brand)
        .all()
    )
    return [b[0] for b in brands]


@router.get("/{slug}", response_model=ProductDetail)
def get_product(slug: str, db: Session = Depends(get_db)):
    """Get product details by slug."""
    product = (
        db.query(Product)
        .filter(Product.slug == slug, Product.is_active == True)  # noqa: E712
        .first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return ProductDetail.model_validate(product)
