from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    Date,
    ForeignKey,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50))
    role = Column(String(50), default="customer")  # customer/partner
    company_name = Column(String(255))
    industry = Column(String(255))
    gst_no = Column(String(50))
    company_pan = Column(String(50))
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="agent")  # admin/manager/agent
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, nullable=False, index=True)
    saleor_order_id = Column(String(255), index=True)
    source = Column(String(50), default="website", index=True)  # website/crm
    crm_order_id = Column(String(255), index=True)  # CRM reference ID
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    customer_type = Column(String(50), default="customer", index=True)  # customer/partner
    items = Column(JSON, default=list)
    total_monthly = Column(Float, default=0.0)
    rental_months = Column(Integer, default=12)
    next_billing_date = Column(Date)  # next invoice due date
    status = Column(String(50), default="confirmed", index=True)
    shipping_address = Column(JSON)
    billing_address = Column(JSON)
    customer_note = Column(Text)
    sales_order_pdf = Column(String(500))  # CRM sales order PDF path
    # Delivery tracking
    delivery_status = Column(
        String(50), default="pending", index=True
    )  # pending/proforma_sent/confirmed/dispatched/in_transit/out_for_delivery/delivered/partially_delivered
    delivered_at = Column(DateTime(timezone=True))
    delivery_confirmed_by = Column(String(255))  # admin who confirmed delivery
    # Billing starts after delivery
    billing_start_date = Column(Date)  # set when delivery is confirmed
    billing_end_date = Column(Date)    # contract end / early termination
    billing_status = Column(
        String(50), default="not_started", index=True
    )  # not_started/active/paused/completed/terminated
    # Document references
    proforma_invoice_number = Column(String(100), index=True)
    delivery_challan_number = Column(String(100), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, nullable=False, index=True)
    order_id = Column(String(100), index=True)
    contract_id = Column(String(100), index=True)  # linked contract number
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    items = Column(JSON, default=list)
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    status = Column(
        String(50), default="draft", index=True
    )  # draft/sent/paid/overdue/cancelled
    due_date = Column(Date)
    paid_date = Column(Date)
    payment_method = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    payments = relationship("Payment", back_populates="invoice", lazy="selectin")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    method = Column(String(100))
    transaction_id = Column(String(255))
    status = Column(
        String(50), default="pending", index=True
    )  # pending/completed/failed/refunded
    paid_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    invoice = relationship("Invoice", back_populates="payments")


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String(100), unique=True, nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    order_id = Column(String(100), index=True)
    type = Column(String(50), default="rental")  # rental/lease
    start_date = Column(Date)
    end_date = Column(Date)
    original_end_date = Column(Date)  # before any extensions
    extended_months = Column(Integer, default=0)  # total months extended
    terms = Column(Text)
    document_url = Column(String(500))
    status = Column(
        String(50), default="draft", index=True
    )  # draft/pending_signature/active/expired/terminated
    signing_token = Column(String(100), unique=True, nullable=True, index=True)
    signature_url = Column(String(500), nullable=True)
    signed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ContractReminder(Base):
    __tablename__ = "contract_reminders"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    reminder_type = Column(String(50), default="expiry")  # expiry/renewal/payment
    days_before = Column(Integer, nullable=False, default=30)  # days before end_date
    channel = Column(String(50), default="email")  # email/whatsapp/both
    is_active = Column(Boolean, default=True)
    last_sent_at = Column(DateTime(timezone=True), nullable=True)
    next_trigger_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contract = relationship("Contract", backref="reminders")


class ContractReminderLog(Base):
    __tablename__ = "contract_reminder_logs"

    id = Column(Integer, primary_key=True, index=True)
    reminder_id = Column(Integer, ForeignKey("contract_reminders.id", ondelete="CASCADE"), nullable=False, index=True)
    contract_id = Column(Integer, nullable=False, index=True)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    channel = Column(String(50))  # email/whatsapp
    status = Column(String(50), default="sent")  # sent/failed/delivered
    recipient_email = Column(String(255))
    message_preview = Column(Text)

    reminder = relationship("ContractReminder", backref="logs")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(100), unique=True, nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    order_id = Column(String(100), index=True)
    asset_uid = Column(String(100), index=True)  # linked asset
    contract_id = Column(String(100), index=True)  # linked contract number
    invoice_id = Column(String(100), index=True)  # linked invoice number
    return_id = Column(String(100), index=True)  # linked return number
    subject = Column(String(500), nullable=False)
    description = Column(Text)
    priority = Column(
        String(50), default="medium", index=True
    )  # low/medium/high/urgent
    status = Column(
        String(50), default="open", index=True
    )  # open/in_progress/resolved/closed
    assigned_to = Column(String(255))
    category = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    messages = relationship(
        "TicketMessage", back_populates="ticket", lazy="selectin"
    )


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(
        Integer, ForeignKey("support_tickets.id"), nullable=False, index=True
    )
    sender = Column(String(255), nullable=False)
    sender_type = Column(String(50), nullable=False)  # customer/agent/system
    message = Column(Text, nullable=False)
    attachment_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("SupportTicket", back_populates="messages")


# ── Asset Management ─────────────────────────────────────────────────────────


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(100), unique=True, nullable=False, index=True)  # RENTR-SVR-2026-00001
    category = Column(String(10), nullable=False, index=True)  # SVR/LP/DT/WS/STR/GPU/NW/AV/CP/MB
    oem = Column(String(255))  # Dell, HP, Lenovo, etc.
    model = Column(String(255))
    specs = Column(Text)  # CPU + RAM + Storage summary
    serial_number = Column(String(255))
    acquisition_cost = Column(Float, default=0.0)
    acquisition_date = Column(Date)
    monthly_rate = Column(Float, default=0.0)
    status = Column(
        String(50), default="in_warehouse", index=True
    )  # in_warehouse/staged/in_transit/deployed/return_initiated/received_grn/in_repair/advance_replaced/retired
    condition_grade = Column(String(5), default="A")  # A/B/C/D/E
    site = Column(String(500))  # Deployment location
    contract_id = Column(String(100), index=True)
    order_id = Column(String(100), index=True)
    customer_name = Column(String(255))
    customer_email = Column(String(255), index=True)
    warranty_expiry = Column(Date)
    warranty_provider = Column(String(255))
    support_included = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class AssetLifecycleEvent(Base):
    __tablename__ = "asset_lifecycle_events"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    asset_uid = Column(String(100), index=True)
    from_state = Column(String(50))
    to_state = Column(String(50), nullable=False)
    triggered_by = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ── Advance Replacement Tracking ─────────────────────────────────────────────


class AdvanceReplacement(Base):
    __tablename__ = "advance_replacements"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(100), nullable=False, index=True)  # order number
    return_id = Column(String(100), index=True)  # return number (if from return)
    faulty_asset_id = Column(Integer, index=True)
    faulty_asset_uid = Column(String(100), nullable=False, index=True)
    replacement_asset_id = Column(Integer, index=True)
    replacement_asset_uid = Column(String(100), index=True)
    reason = Column(String(255))  # faulty/damaged/performance
    status = Column(
        String(50), default="initiated", index=True
    )  # initiated/replacement_staged/shipped/deployed/completed/cancelled
    notes = Column(Text)
    initiated_by = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ── Returns Management ───────────────────────────────────────────────────────


class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id = Column(Integer, primary_key=True, index=True)
    return_number = Column(String(100), unique=True, nullable=False, index=True)
    order_id = Column(String(100), index=True)
    contract_id = Column(String(100), index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    asset_uids = Column(JSON, default=list)  # List of UIDs being returned
    ticket_id = Column(String(100), index=True)  # linked support ticket number
    invoice_id = Column(String(100), index=True)  # linked invoice number
    reason = Column(String(100))  # contract_end/early_return/advance_replacement/faulty
    pickup_date = Column(Date)
    pickup_time = Column(String(50))
    site = Column(String(500))
    special_instructions = Column(Text)
    data_wipe_requested = Column(Boolean, default=True)
    status = Column(
        String(50), default="pending", index=True
    )  # pending/approved/pickup_scheduled/in_transit/received_grn/damage_review/completed/cancelled
    grn_date = Column(Date)
    grn_data = Column(JSON)  # GRN details from IMS
    damage_charges = Column(Float, default=0.0)
    damage_notes = Column(Text)
    pro_rata_credit = Column(Float, default=0.0)
    reviewed_by = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ── KYC / Customer Onboarding ────────────────────────────────────────────────


class KYCSubmission(Base):
    __tablename__ = "kyc_submissions"

    id = Column(Integer, primary_key=True, index=True)
    customer_email = Column(String(255), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    account_type = Column(String(50), index=True)  # channel_partner/direct_enterprise
    gstin = Column(String(20), index=True)
    pan = Column(String(15))
    documents = Column(JSON, default=list)  # [{type, filename, url, status}]
    status = Column(
        String(50), default="pending", index=True
    )  # pending/under_review/approved/rejected
    credit_limit = Column(Float, default=0.0)
    credit_used = Column(Float, default=0.0)
    reviewer = Column(String(255))
    review_notes = Column(Text)
    rejection_reason = Column(Text)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ── Proforma Invoice ────────────────────────────────────────────────────────


class ProformaInvoice(Base):
    __tablename__ = "proforma_invoices"

    id = Column(Integer, primary_key=True, index=True)
    pi_number = Column(String(100), unique=True, nullable=False, index=True)  # PI-2026-0001
    order_id = Column(String(100), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    customer_gstin = Column(String(20))
    items = Column(JSON, default=list)  # [{product_name, qty, rate, hsn_code, gst_rate, amount}]
    subtotal = Column(Float, default=0.0)
    cgst = Column(Float, default=0.0)
    sgst = Column(Float, default=0.0)
    igst = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    rental_months = Column(Integer, default=12)
    security_deposit = Column(Float, default=0.0)
    validity_days = Column(Integer, default=15)  # PI validity period
    status = Column(
        String(50), default="draft", index=True
    )  # draft/sent/accepted/expired/cancelled
    accepted_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    document_url = Column(String(500))  # generated PDF path
    shipping_address = Column(JSON)
    billing_address = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ── Delivery Challan ────────────────────────────────────────────────────────


class DeliveryChallan(Base):
    __tablename__ = "delivery_challans"

    id = Column(Integer, primary_key=True, index=True)
    dc_number = Column(String(100), unique=True, nullable=False, index=True)  # DC-2026-0001
    order_id = Column(String(100), nullable=False, index=True)
    shipment_id = Column(Integer, index=True)  # linked shipment
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    customer_gstin = Column(String(20))
    # Challan-specific fields
    challan_type = Column(String(50), default="supply_on_rental")  # supply_on_rental/return/replacement/job_work
    items = Column(JSON, default=list)  # [{asset_uid, product_name, serial_number, qty, hsn_code, value}]
    asset_uids = Column(JSON, default=list)  # list of asset UIDs on this DC
    total_value = Column(Float, default=0.0)  # declared value for transport
    # Transport details
    transporter_name = Column(String(255))
    vehicle_number = Column(String(50))
    transport_mode = Column(String(50))  # road/courier/air/rail
    lr_number = Column(String(100))  # Lorry Receipt / AWB number
    eway_bill_number = Column(String(100))  # E-way bill (mandatory >50K in India)
    # Addresses
    dispatch_from = Column(JSON)  # warehouse address
    ship_to = Column(JSON)  # customer delivery address
    # Status tracking
    status = Column(
        String(50), default="draft", index=True
    )  # draft/dispatched/in_transit/delivered/returned/cancelled
    dispatched_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    received_by = Column(String(255))  # person who received at customer site
    delivery_proof_url = Column(String(500))  # POD (proof of delivery) image/PDF
    notes = Column(Text)
    document_url = Column(String(500))  # generated DC PDF path
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ── Shipment / Delivery Tracking ────────────────────────────────────────────


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    shipment_number = Column(String(100), unique=True, nullable=False, index=True)  # SHP-2026-0001
    order_id = Column(String(100), nullable=False, index=True)
    dc_number = Column(String(100), index=True)  # linked delivery challan
    shipment_type = Column(String(50), default="outbound", index=True)  # outbound/return/replacement
    # Logistics
    logistics_partner = Column(String(255))  # BlueDart, Delhivery, etc.
    tracking_number = Column(String(255), index=True)
    tracking_url = Column(String(500))
    estimated_delivery = Column(Date)
    # Asset details
    asset_uids = Column(JSON, default=list)
    package_count = Column(Integer, default=1)
    total_weight = Column(Float)  # in kg
    dimensions = Column(String(255))  # LxWxH
    # Addresses
    origin_address = Column(JSON)
    destination_address = Column(JSON)
    # Status
    status = Column(
        String(50), default="preparing", index=True
    )  # preparing/picked_up/in_transit/out_for_delivery/delivered/failed/returned
    # Timestamps
    picked_up_at = Column(DateTime(timezone=True))
    in_transit_at = Column(DateTime(timezone=True))
    out_for_delivery_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    delivery_proof_url = Column(String(500))
    received_by = Column(String(255))
    failed_reason = Column(Text)
    # Metadata
    customer_name = Column(String(255))
    customer_email = Column(String(255), index=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    tracking_events = relationship("ShipmentTrackingEvent", back_populates="shipment", lazy="selectin")


class ShipmentTrackingEvent(Base):
    __tablename__ = "shipment_tracking_events"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    location = Column(String(255))
    description = Column(Text)
    event_time = Column(DateTime(timezone=True), server_default=func.now())
    source = Column(String(50), default="manual")  # manual/api/webhook

    shipment = relationship("Shipment", back_populates="tracking_events")


# ── Replacement (Unified: Normal + Advance) ─────────────────────────────────


class Replacement(Base):
    __tablename__ = "replacements"

    id = Column(Integer, primary_key=True, index=True)
    replacement_number = Column(String(100), unique=True, nullable=False, index=True)  # RPL-2026-0001
    order_id = Column(String(100), nullable=False, index=True)
    contract_id = Column(String(100), index=True)
    ticket_id = Column(String(100), index=True)  # linked support ticket
    return_id = Column(String(100), index=True)  # linked return request
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    # Replacement type
    replacement_type = Column(
        String(50), nullable=False, index=True
    )  # advance/normal
    # advance = ship replacement first, then collect faulty
    # normal  = collect faulty first (via return), then ship replacement
    # Faulty asset
    faulty_asset_id = Column(Integer, index=True)
    faulty_asset_uid = Column(String(100), nullable=False, index=True)
    faulty_reason = Column(String(255))  # hardware_failure/damaged/performance_degradation/doa/other
    fault_description = Column(Text)
    # Replacement asset
    replacement_asset_id = Column(Integer, index=True)
    replacement_asset_uid = Column(String(100), index=True)
    # Shipments
    outbound_shipment_id = Column(Integer, index=True)  # replacement going out
    inbound_shipment_id = Column(Integer, index=True)   # faulty coming back
    outbound_dc_number = Column(String(100))
    inbound_dc_number = Column(String(100))
    # Status - end to end
    status = Column(
        String(50), default="initiated", index=True
    )  # initiated/approved/replacement_staged/replacement_shipped/replacement_delivered/
      # faulty_pickup_scheduled/faulty_in_transit/faulty_received/inspection/completed/cancelled
    # Damage assessment (after receiving faulty)
    damage_found = Column(Boolean, default=False)
    damage_charges = Column(Float, default=0.0)
    damage_notes = Column(Text)
    # Metadata
    initiated_by = Column(String(255))
    approved_by = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ── Security Deposit ────────────────────────────────────────────────────────


class SecurityDeposit(Base):
    __tablename__ = "security_deposits"

    id = Column(Integer, primary_key=True, index=True)
    deposit_number = Column(String(100), unique=True, nullable=False, index=True)  # DEP-2026-0001
    order_id = Column(String(100), nullable=False, index=True)
    contract_id = Column(String(100), index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(100))  # bank_transfer/cheque/upi/neft
    transaction_id = Column(String(255))
    status = Column(
        String(50), default="pending", index=True
    )  # pending/received/partially_refunded/refunded/forfeited
    received_date = Column(Date)
    # Refund tracking
    refund_amount = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)  # damage deductions
    deduction_notes = Column(Text)
    refund_date = Column(Date)
    refund_transaction_id = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ── Credit Note / Debit Note ────────────────────────────────────────────────


class CreditNote(Base):
    __tablename__ = "credit_notes"

    id = Column(Integer, primary_key=True, index=True)
    cn_number = Column(String(100), unique=True, nullable=False, index=True)  # CN-2026-0001 or DN-2026-0001
    note_type = Column(String(10), nullable=False, index=True)  # credit/debit
    order_id = Column(String(100), index=True)
    invoice_id = Column(String(100), index=True)  # linked invoice number
    return_id = Column(String(100), index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    reason = Column(String(255))  # early_return/damage/billing_adjustment/goodwill/overcharge
    items = Column(JSON, default=list)  # [{description, amount, tax}]
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    status = Column(
        String(50), default="draft", index=True
    )  # draft/approved/applied/cancelled
    applied_to_invoice = Column(String(100))  # invoice it was adjusted against
    notes = Column(Text)
    document_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ── Insurance Policy ────────────────────────────────────────────────────────


class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String(100), unique=True, nullable=False, index=True)
    provider = Column(String(255), nullable=False)
    asset_uid = Column(String(100), index=True)  # per-asset or blanket
    order_id = Column(String(100), index=True)
    coverage_type = Column(String(100))  # all_risk/fire_theft/transit/comprehensive
    sum_insured = Column(Float, default=0.0)
    premium = Column(Float, default=0.0)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(
        String(50), default="active", index=True
    )  # active/expired/claimed/cancelled
    claim_id = Column(String(100))
    claim_amount = Column(Float, default=0.0)
    claim_status = Column(String(50))  # filed/under_review/approved/rejected/settled
    document_url = Column(String(500))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
