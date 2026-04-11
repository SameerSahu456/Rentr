from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    parent = relationship("Category", remote_side="Category.id", backref="children")
    products = relationship("Product", back_populates="category_rel", lazy="dynamic")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False, index=True)
    slug = Column(String(500), nullable=False, unique=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = Column(String(255), nullable=True)
    subcategory = Column(String(255), nullable=True)
    brand = Column(String(255), nullable=True, index=True)
    description = Column(Text, nullable=True)
    specs = Column(JSONB, nullable=True)
    price_per_month = Column(Float, nullable=False)
    image_url = Column(String(1000), nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    category_rel = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product", lazy="dynamic")
    cart_items = relationship("CartItem", back_populates="product", lazy="dynamic")
