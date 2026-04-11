from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, decode_token
from app.models.user import User, SearchHistory
from app.models.product import Product
from app.schemas.order import SearchAutoCompleteResponse, SearchHistoryResponse
from app.schemas.product import ProductListItem, ProductListResponse

import math

router = APIRouter(prefix="/search", tags=["Search"])

_optional_bearer = HTTPBearer(auto_error=False)


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Return the current user if a valid token is provided, otherwise None."""
    if credentials is None:
        return None
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        return None


@router.get("/autocomplete", response_model=SearchAutoCompleteResponse)
def search_autocomplete(
    q: str = Query(..., min_length=1, max_length=500),
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Return autocomplete suggestions based on product names and brands."""
    search_term = f"%{q}%"

    # Get matching product names
    names = (
        db.query(Product.name)
        .filter(Product.is_active == True, Product.name.ilike(search_term))  # noqa: E712
        .limit(limit)
        .all()
    )

    # Get matching brands
    brands = (
        db.query(Product.brand)
        .filter(
            Product.is_active == True,  # noqa: E712
            Product.brand.ilike(search_term),
            Product.brand != None,  # noqa: E711
        )
        .distinct()
        .limit(3)
        .all()
    )

    suggestions = list(dict.fromkeys(
        [b[0] for b in brands] + [n[0] for n in names]
    ))[:limit]

    return SearchAutoCompleteResponse(suggestions=suggestions)


@router.get("/results", response_model=ProductListResponse)
def search_results(
    q: str = Query(..., min_length=1, max_length=500),
    category: str | None = Query(None),
    brand: str | None = Query(None),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Full search with results. Saves query to history if user is authenticated."""
    search_term = f"%{q}%"

    query = db.query(Product).filter(
        Product.is_active == True,  # noqa: E712
        Product.name.ilike(search_term)
        | Product.brand.ilike(search_term)
        | Product.description.ilike(search_term)
        | Product.category.ilike(search_term),
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
    products = (
        query.order_by(Product.name)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Save to search history if authenticated
    if current_user:
        history_entry = SearchHistory(user_id=current_user.id, query=q)
        db.add(history_entry)
        db.commit()

    return ProductListResponse(
        items=[ProductListItem.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/history", response_model=SearchHistoryResponse)
def get_search_history(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current user's recent search queries."""
    results = (
        db.query(SearchHistory.query)
        .filter(SearchHistory.user_id == current_user.id)
        .order_by(SearchHistory.created_at.desc())
        .limit(limit * 3)  # Fetch extra to deduplicate
        .all()
    )
    # Deduplicate while preserving order
    seen = set()
    queries = []
    for (q,) in results:
        if q.lower() not in seen:
            seen.add(q.lower())
            queries.append(q)
        if len(queries) >= limit:
            break

    return SearchHistoryResponse(queries=queries)


@router.delete("/history", status_code=status.HTTP_200_OK)
def clear_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Clear the current user's search history."""
    db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Search history cleared"}
