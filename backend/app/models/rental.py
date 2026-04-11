"""
Rentr RMS — All rental management models.

Models: Customer, KYC, Asset, AssetLifecycleEvent, Contract,
ContractTimeline, ContractReminder, ContractAnnexure, Invoice, Payment,
Return, SupportTicket, TicketMessage, Shipment, ShipmentItem,
DeliveryChallan, Replacement, Notification, AuditTrail, BillingRun.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Text,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class CustomerType(str, enum.Enum):
    partner = "partner"
    direct = "direct"


class CustomerTier(str, enum.Enum):
    silver = "silver"
    gold = "gold"
    platinum = "platinum"


class KYCStatus(str, enum.Enum):
    pending = "pending"
    under_review = "under_review"
    approved = "approved"
    rejected = "rejected"


class AssetCategory(str, enum.Enum):
    SVR = "SVR"
    LP = "LP"
    DT = "DT"
    GPU = "GPU"
    NW = "NW"
    WS = "WS"
    AV = "AV"
    CP = "CP"
    MB = "MB"
    STR = "STR"


class AssetStatus(str, enum.Enum):
    in_warehouse = "in_warehouse"
    staged = "staged"
    in_transit = "in_transit"
    deployed = "deployed"
    return_initiated = "return_initiated"
    return_in_transit = "return_in_transit"
    received_grn = "received_grn"
    in_repair = "in_repair"
    advance_replaced = "advance_replaced"
    retired = "retired"


class ConditionGrade(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    E = "E"


class ContractType(str, enum.Enum):
    master_agreement = "master_agreement"
    annexure = "annexure"


class ContractStatus(str, enum.Enum):
    draft = "draft"
    pending_signature = "pending_signature"
    active = "active"
    expiring = "expiring"
    expired = "expired"
    terminated = "terminated"


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"


class ReturnStatus(str, enum.Enum):
    initiated = "initiated"
    pickup_scheduled = "pickup_scheduled"
    in_transit = "in_transit"
    received = "received"
    grn_completed = "grn_completed"
    closed = "closed"


class TicketPriority(str, enum.Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    waiting = "waiting"
    resolved = "resolved"
    closed = "closed"


class SenderType(str, enum.Enum):
    agent = "agent"
    customer = "customer"
    system = "system"


class ShipmentType(str, enum.Enum):
    outbound = "outbound"
    return_ = "return"


class ShipmentStatus(str, enum.Enum):
    preparing = "preparing"
    dispatched = "dispatched"
    in_transit = "in_transit"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    failed = "failed"


class ChallanType(str, enum.Enum):
    outward = "outward"
    inward = "inward"


class ChallanStatus(str, enum.Enum):
    draft = "draft"
    generated = "generated"
    dispatched = "dispatched"
    delivered = "delivered"
    cancelled = "cancelled"


class ReplacementType(str, enum.Enum):
    standard = "standard"
    advance = "advance"


class ReplacementStatus(str, enum.Enum):
    initiated = "initiated"
    approved = "approved"
    dispatched = "dispatched"
    completed = "completed"
    cancelled = "cancelled"


class AnnexureStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class BillingRunStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class AuditAction(str, enum.Enum):
    created = "created"
    updated = "updated"
    deleted = "deleted"


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _utcnow():
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    customer_type = Column(SAEnum(CustomerType), nullable=False)
    company_name = Column(String(255), nullable=True)
    gstin = Column(String(20), nullable=True)
    pan = Column(String(20), nullable=True)
    tier = Column(SAEnum(CustomerTier), default=CustomerTier.silver, nullable=False)
    kyc_status = Column(SAEnum(KYCStatus), default=KYCStatus.pending, nullable=False)
    credit_limit = Column(Float, default=0, nullable=False)
    credit_used = Column(Float, default=0, nullable=False)
    monthly_revenue = Column(Float, default=0, nullable=False)
    outstanding = Column(Float, default=0, nullable=False)
    total_assets = Column(Integer, default=0, nullable=False)
    open_tickets = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    kyc_records = relationship("KYC", back_populates="customer", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="customer", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_customers_type_tier", "customer_type", "tier"),
    )


class KYC(Base):
    __tablename__ = "kyc_records"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_email = Column(String(255), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    account_type = Column(String(50), nullable=True)
    gstin = Column(String(20), nullable=True)
    pan = Column(String(20), nullable=True)
    status = Column(SAEnum(KYCStatus), default=KYCStatus.pending, nullable=False, index=True)
    credit_limit = Column(Float, default=0, nullable=False)
    credit_used = Column(Float, default=0, nullable=False)
    credit_available = Column(Float, default=0, nullable=False)
    documents = Column(JSONB, default=list, nullable=False)
    reviewer = Column(String(255), nullable=True)
    review_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    customer = relationship("Customer", back_populates="kyc_records")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(30), unique=True, index=True, nullable=False)  # RENTR-LP-2026-00001
    oem = Column(String(100), nullable=False)
    model = Column(String(255), nullable=False)
    category = Column(SAEnum(AssetCategory), nullable=False, index=True)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    specs = Column(JSONB, default=dict, nullable=False)
    acquisition_source = Column(String(255), nullable=True)
    acquisition_cost = Column(Float, default=0, nullable=False)
    book_value = Column(Float, default=0, nullable=False)
    status = Column(SAEnum(AssetStatus), default=AssetStatus.in_warehouse, nullable=False, index=True)
    condition_grade = Column(SAEnum(ConditionGrade), default=ConditionGrade.A, nullable=False)
    warehouse_id = Column(String(50), nullable=True)
    customer_email = Column(String(255), nullable=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="SET NULL"), nullable=True, index=True)
    monthly_rate = Column(Float, default=0, nullable=False)
    warranty_expiry = Column(Date, nullable=True)
    data_wipe_status = Column(String(50), nullable=True)
    tags = Column(JSONB, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    lifecycle_events = relationship("AssetLifecycleEvent", back_populates="asset", cascade="all, delete-orphan")
    contract = relationship("Contract", back_populates="assets_rel")

    __table_args__ = (
        Index("ix_assets_status_category", "status", "category"),
        Index("ix_assets_warehouse", "warehouse_id", "status"),
    )


class AssetLifecycleEvent(Base):
    __tablename__ = "asset_lifecycle_events"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    from_state = Column(String(50), nullable=True)
    to_state = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    user_email = Column(String(255), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    asset = relationship("Asset", back_populates="lifecycle_events")


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String(30), unique=True, index=True, nullable=False)  # RENTR-CON-2026-00001
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    type = Column(SAEnum(ContractType), nullable=False)
    status = Column(SAEnum(ContractStatus), default=ContractStatus.draft, nullable=False, index=True)
    document_url = Column(String(500), nullable=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    assets = Column(JSONB, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="contracts")
    assets_rel = relationship("Asset", back_populates="contract")
    timeline = relationship("ContractTimeline", back_populates="contract", cascade="all, delete-orphan")
    reminders = relationship("ContractReminder", back_populates="contract", cascade="all, delete-orphan")
    annexures = relationship("ContractAnnexure", back_populates="contract", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="contract", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_contracts_status_type", "status", "type"),
        Index("ix_contracts_dates", "start_date", "end_date"),
    )


class ContractTimeline(Base):
    __tablename__ = "contract_timeline"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    contract = relationship("Contract", back_populates="timeline")


class ContractReminder(Base):
    __tablename__ = "contract_reminders"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    days_before = Column(Integer, nullable=False)
    reminder_type = Column(String(50), nullable=False)
    channel = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    contract = relationship("Contract", back_populates="reminders")


class ContractAnnexure(Base):
    __tablename__ = "contract_annexures"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(100), nullable=False)
    asset_uids = Column(JSONB, default=list, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(SAEnum(AnnexureStatus), default=AnnexureStatus.draft, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    contract = relationship("Contract", back_populates="annexures")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(30), unique=True, index=True, nullable=False)  # RENTR-INV-2026-00001
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="SET NULL"), nullable=True, index=True)
    items = Column(JSONB, default=list, nullable=False)
    total = Column(Float, nullable=False, default=0)
    gst_amount = Column(Float, nullable=False, default=0)
    status = Column(SAEnum(InvoiceStatus), default=InvoiceStatus.draft, nullable=False, index=True)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    contract = relationship("Contract", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_invoices_status_due", "status", "due_date"),
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    invoice_number = Column(String(30), nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(String(50), nullable=True)
    transaction_id = Column(String(100), nullable=True, unique=True)
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.pending, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    invoice = relationship("Invoice", back_populates="payments")


class Return(Base):
    __tablename__ = "returns"

    id = Column(Integer, primary_key=True, index=True)
    return_number = Column(String(30), unique=True, index=True, nullable=False)  # RENTR-RET-2026-00001
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="SET NULL"), nullable=True, index=True)
    asset_uids = Column(JSONB, default=list, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(SAEnum(ReturnStatus), default=ReturnStatus.initiated, nullable=False, index=True)
    pickup_date = Column(Date, nullable=True)
    grn_number = Column(String(50), nullable=True)
    damage_charges = Column(Float, default=0, nullable=False)
    damage_report = Column(JSONB, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(30), unique=True, index=True, nullable=False)  # RENTR-TKT-2026-00001
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    asset_uid = Column(String(30), nullable=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="SET NULL"), nullable=True, index=True)
    subject = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    priority = Column(SAEnum(TicketPriority), default=TicketPriority.medium, nullable=False, index=True)
    status = Column(SAEnum(TicketStatus), default=TicketStatus.open, nullable=False, index=True)
    assigned_to = Column(String(255), nullable=True)
    sla_deadline = Column(DateTime(timezone=True), nullable=True)
    sla_response_deadline = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_tickets_status_priority", "status", "priority"),
    )


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    sender = Column(String(255), nullable=False)
    sender_type = Column(SAEnum(SenderType), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    ticket = relationship("SupportTicket", back_populates="messages")


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    shipment_number = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    shipment_type = Column(SAEnum(ShipmentType), nullable=False)
    logistics_partner = Column(String(255), nullable=True)
    tracking_number = Column(String(100), nullable=True, index=True)
    customer_name = Column(String(255), nullable=False)
    status = Column(SAEnum(ShipmentStatus), default=ShipmentStatus.preparing, nullable=False, index=True)
    estimated_delivery = Column(Date, nullable=True)
    timeline = Column(JSONB, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="shipments")
    shipment_items = relationship("ShipmentItem", back_populates="shipment", cascade="all, delete-orphan")


class ShipmentItem(Base):
    __tablename__ = "shipment_items"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True)
    asset_uid = Column(String(30), nullable=False)
    description = Column(String(500), nullable=True)
    quantity = Column(Integer, default=1, nullable=False)

    shipment = relationship("Shipment", back_populates="shipment_items")
    asset = relationship("Asset")

    __table_args__ = (
        Index("ix_shipment_items_shipment_asset", "shipment_id", "asset_id"),
    )


class DeliveryChallan(Base):
    __tablename__ = "delivery_challans"

    id = Column(Integer, primary_key=True, index=True)
    dc_number = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    challan_type = Column(SAEnum(ChallanType), nullable=False)
    customer_name = Column(String(255), nullable=False)
    total_value = Column(Float, default=0, nullable=False)
    transporter_name = Column(String(255), nullable=True)
    eway_bill_number = Column(String(50), nullable=True)
    vehicle_number = Column(String(20), nullable=True)
    status = Column(SAEnum(ChallanStatus), default=ChallanStatus.draft, nullable=False, index=True)
    items = Column(JSONB, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Replacement(Base):
    __tablename__ = "replacements"

    id = Column(Integer, primary_key=True, index=True)
    replacement_number = Column(String(50), unique=True, index=True, nullable=False)
    replacement_type = Column(SAEnum(ReplacementType), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_name = Column(String(255), nullable=False)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id", ondelete="SET NULL"), nullable=True, index=True)
    faulty_asset_uid = Column(String(30), nullable=True)
    replacement_asset_uid = Column(String(30), nullable=True)
    faulty_reason = Column(Text, nullable=True)
    status = Column(SAEnum(ReplacementStatus), default=ReplacementStatus.initiated, nullable=False, index=True)
    damage_charges = Column(Float, default=0, nullable=False)
    timeline = Column(JSONB, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    reference_id = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    __table_args__ = (
        Index("ix_notifications_user_read", "user_id", "is_read"),
    )


class AuditTrail(Base):
    __tablename__ = "audit_trails"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(100), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False)
    action = Column(SAEnum(AuditAction), nullable=False)
    user_email = Column(String(255), nullable=True, index=True)
    changes = Column(JSONB, default=dict, nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    request_id = Column(String(100), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    __table_args__ = (
        Index("ix_audit_entity", "entity_type", "entity_id"),
        Index("ix_audit_timestamp", "timestamp"),
    )


class BillingRun(Base):
    __tablename__ = "billing_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_date = Column(Date, nullable=False)
    status = Column(SAEnum(BillingRunStatus), default=BillingRunStatus.pending, nullable=False, index=True)
    total_invoices = Column(Integer, default=0, nullable=False)
    total_amount = Column(Float, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
