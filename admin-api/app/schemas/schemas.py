from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── AdminUser ─────────────────────────────────────────────────────────────────


class AdminUserCreate(BaseModel):
    email: EmailStr
    name: str
    role: str = "agent"
    password: str


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class AdminUserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Customer ─────────────────────────────────────────────────────────────────


class CustomerRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "customer"  # customer/partner
    company_name: Optional[str] = None
    industry: Optional[str] = None
    gst_no: Optional[str] = None
    company_pan: Optional[str] = None


class CustomerLogin(BaseModel):
    email: EmailStr
    password: str


class CustomerResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    company_name: Optional[str] = None
    industry: Optional[str] = None
    gst_no: Optional[str] = None
    company_pan: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    gst_no: Optional[str] = None
    company_pan: Optional[str] = None


class CustomerTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: CustomerResponse


# ── Order ────────────────────────────────────────────────────────────────────


class OrderCreate(BaseModel):
    saleor_order_id: Optional[str] = None
    source: str = "website"  # website/crm
    crm_order_id: Optional[str] = None
    customer_name: str
    customer_email: EmailStr
    customer_type: str = "customer"  # customer/partner
    items: Optional[list] = []
    total_monthly: float = 0.0
    rental_months: int = 12
    next_billing_date: Optional[date] = None
    status: str = "confirmed"
    shipping_address: Optional[dict] = None
    billing_address: Optional[dict] = None
    customer_note: Optional[str] = None
    sales_order_pdf: Optional[str] = None


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    customer_note: Optional[str] = None
    next_billing_date: Optional[date] = None
    sales_order_pdf: Optional[str] = None
    delivery_status: Optional[str] = None
    billing_start_date: Optional[date] = None
    billing_end_date: Optional[date] = None
    billing_status: Optional[str] = None
    proforma_invoice_number: Optional[str] = None
    delivery_challan_number: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    order_number: str
    saleor_order_id: Optional[str] = None
    source: Optional[str] = "website"
    crm_order_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_type: str = "customer"
    items: Optional[list] = []
    total_monthly: float
    rental_months: int
    next_billing_date: Optional[date] = None
    status: str
    shipping_address: Optional[dict] = None
    billing_address: Optional[dict] = None
    customer_note: Optional[str] = None
    sales_order_pdf: Optional[str] = None
    delivery_status: Optional[str] = "pending"
    delivered_at: Optional[datetime] = None
    delivery_confirmed_by: Optional[str] = None
    billing_start_date: Optional[date] = None
    billing_end_date: Optional[date] = None
    billing_status: Optional[str] = "not_started"
    proforma_invoice_number: Optional[str] = None
    delivery_challan_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int


# ── Invoice ───────────────────────────────────────────────────────────────────


class InvoiceCreate(BaseModel):
    invoice_number: str
    order_id: Optional[str] = None
    contract_id: Optional[str] = None
    customer_name: str
    customer_email: EmailStr
    items: Optional[list] = []
    subtotal: float = 0.0
    tax: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    status: str = "draft"
    due_date: Optional[date] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class InvoiceUpdate(BaseModel):
    order_id: Optional[str] = None
    contract_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    items: Optional[list] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    discount: Optional[float] = None
    total: Optional[float] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    paid_date: Optional[date] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    invoice_id: int
    amount: float
    method: Optional[str] = None
    transaction_id: Optional[str] = None
    status: str
    paid_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    order_id: Optional[str] = None
    contract_id: Optional[str] = None
    customer_name: str
    customer_email: str
    items: Optional[list] = []
    subtotal: float
    tax: float
    discount: float
    total: float
    status: str
    due_date: Optional[date] = None
    paid_date: Optional[date] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    payments: list[PaymentResponse] = []

    model_config = {"from_attributes": True}


class InvoiceListResponse(BaseModel):
    items: list[InvoiceResponse]
    total: int


# ── Payment ───────────────────────────────────────────────────────────────────


class PaymentCreate(BaseModel):
    invoice_id: int
    amount: float
    method: Optional[str] = None
    transaction_id: Optional[str] = None
    status: str = "pending"
    paid_at: Optional[datetime] = None


class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    method: Optional[str] = None
    transaction_id: Optional[str] = None
    status: Optional[str] = None
    paid_at: Optional[datetime] = None


class PaymentListResponse(BaseModel):
    items: list[PaymentResponse]
    total: int


# ── Contract ──────────────────────────────────────────────────────────────────


class ContractCreate(BaseModel):
    contract_number: str
    customer_name: str
    customer_email: EmailStr
    order_id: Optional[str] = None
    type: str = "rental"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    terms: Optional[str] = None
    document_url: Optional[str] = None
    status: str = "draft"


class ContractUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    order_id: Optional[str] = None
    type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    terms: Optional[str] = None
    document_url: Optional[str] = None
    status: Optional[str] = None
    signed_at: Optional[datetime] = None


class ContractExtendRequest(BaseModel):
    extend_months: int
    reason: Optional[str] = None


class ContractResponse(BaseModel):
    id: int
    contract_number: str
    customer_name: str
    customer_email: str
    order_id: Optional[str] = None
    type: str
    version: int = 1
    parent_contract_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    original_end_date: Optional[date] = None
    extended_months: int = 0
    terms: Optional[str] = None
    document_url: Optional[str] = None
    status: str
    signing_token: Optional[str] = None
    signature_url: Optional[str] = None
    signed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ContractListResponse(BaseModel):
    items: list[ContractResponse]
    total: int


class ContractSigningInfo(BaseModel):
    contract_number: str
    customer_name: str
    customer_email: str
    type: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    terms: Optional[str] = None
    status: str
    order_id: Optional[str] = None

    model_config = {"from_attributes": True}


class SignatureSubmit(BaseModel):
    signature_data: str  # base64-encoded PNG


# ── Contract Reminders ────────────────────────────────────────────────────────


class ReminderCreate(BaseModel):
    reminder_type: str = "expiry"  # expiry/renewal/payment
    days_before: int = 30
    channel: str = "email"  # email/whatsapp/both


class ReminderUpdate(BaseModel):
    is_active: Optional[bool] = None
    days_before: Optional[int] = None
    channel: Optional[str] = None
    reminder_type: Optional[str] = None


class ReminderResponse(BaseModel):
    id: int
    contract_id: int
    reminder_type: str
    days_before: int
    channel: str
    is_active: bool
    last_sent_at: Optional[datetime] = None
    next_trigger_date: Optional[date] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReminderLogResponse(BaseModel):
    id: int
    reminder_id: int
    contract_id: int
    sent_at: datetime
    channel: str
    status: str
    recipient_email: Optional[str] = None
    message_preview: Optional[str] = None

    model_config = {"from_attributes": True}


# ── SupportTicket ─────────────────────────────────────────────────────────────


class SupportTicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    order_id: Optional[str] = None
    asset_uid: Optional[str] = None
    contract_id: Optional[str] = None
    invoice_id: Optional[str] = None
    return_id: Optional[str] = None
    subject: str
    description: Optional[str] = None
    priority: str = "medium"
    category: Optional[str] = None


class SupportTicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    category: Optional[str] = None
    asset_uid: Optional[str] = None
    contract_id: Optional[str] = None
    invoice_id: Optional[str] = None
    return_id: Optional[str] = None


class TicketMessageCreate(BaseModel):
    sender: str
    sender_type: str
    message: str
    attachment_url: Optional[str] = None


class TicketMessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender: str
    sender_type: str
    message: str
    attachment_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SupportTicketResponse(BaseModel):
    id: int
    ticket_number: str
    customer_name: str
    customer_email: str
    order_id: Optional[str] = None
    asset_uid: Optional[str] = None
    contract_id: Optional[str] = None
    invoice_id: Optional[str] = None
    return_id: Optional[str] = None
    subject: str
    description: Optional[str] = None
    priority: str
    status: str
    assigned_to: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: list[TicketMessageResponse] = []

    model_config = {"from_attributes": True}


class SupportTicketListResponse(BaseModel):
    items: list[SupportTicketResponse]
    total: int


class TicketMessageListResponse(BaseModel):
    items: list[TicketMessageResponse]
    total: int


# ── Advance Replacement ──────────────────────────────────────────────────────


class AdvanceReplacementCreate(BaseModel):
    order_id: str
    return_id: Optional[str] = None
    faulty_asset_uid: str
    replacement_asset_uid: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class AdvanceReplacementUpdate(BaseModel):
    replacement_asset_uid: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class AdvanceReplacementResponse(BaseModel):
    id: int
    order_id: str
    return_id: Optional[str] = None
    faulty_asset_id: Optional[int] = None
    faulty_asset_uid: str
    replacement_asset_id: Optional[int] = None
    replacement_asset_uid: Optional[str] = None
    reason: Optional[str] = None
    status: str
    notes: Optional[str] = None
    initiated_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Proforma Invoice ────────────────────────────────────────────────────────


class ProformaInvoiceCreate(BaseModel):
    order_id: str
    customer_name: str
    customer_email: EmailStr
    customer_gstin: Optional[str] = None
    items: Optional[list] = []
    subtotal: float = 0.0
    cgst: float = 0.0
    sgst: float = 0.0
    igst: float = 0.0
    total: float = 0.0
    rental_months: int = 12
    security_deposit: float = 0.0
    validity_days: int = 15
    notes: Optional[str] = None
    shipping_address: Optional[dict] = None
    billing_address: Optional[dict] = None


class ProformaInvoiceUpdate(BaseModel):
    items: Optional[list] = None
    subtotal: Optional[float] = None
    cgst: Optional[float] = None
    sgst: Optional[float] = None
    igst: Optional[float] = None
    total: Optional[float] = None
    security_deposit: Optional[float] = None
    validity_days: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ProformaInvoiceResponse(BaseModel):
    id: int
    pi_number: str
    order_id: str
    customer_name: str
    customer_email: str
    customer_gstin: Optional[str] = None
    items: Optional[list] = []
    subtotal: float
    cgst: float
    sgst: float
    igst: float
    total: float
    rental_months: int
    security_deposit: float
    validity_days: int
    status: str
    accepted_at: Optional[datetime] = None
    notes: Optional[str] = None
    document_url: Optional[str] = None
    shipping_address: Optional[dict] = None
    billing_address: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Delivery Challan ────────────────────────────────────────────────────────


class DeliveryChallanCreate(BaseModel):
    order_id: str
    customer_name: str
    customer_email: EmailStr
    customer_gstin: Optional[str] = None
    challan_type: str = "supply_on_rental"
    items: Optional[list] = []
    asset_uids: Optional[list] = []
    total_value: float = 0.0
    transporter_name: Optional[str] = None
    vehicle_number: Optional[str] = None
    transport_mode: Optional[str] = None
    lr_number: Optional[str] = None
    eway_bill_number: Optional[str] = None
    dispatch_from: Optional[dict] = None
    ship_to: Optional[dict] = None
    notes: Optional[str] = None


class DeliveryChallanUpdate(BaseModel):
    items: Optional[list] = None
    asset_uids: Optional[list] = None
    total_value: Optional[float] = None
    transporter_name: Optional[str] = None
    vehicle_number: Optional[str] = None
    transport_mode: Optional[str] = None
    lr_number: Optional[str] = None
    eway_bill_number: Optional[str] = None
    status: Optional[str] = None
    received_by: Optional[str] = None
    notes: Optional[str] = None


class DeliveryChallanResponse(BaseModel):
    id: int
    dc_number: str
    order_id: str
    shipment_id: Optional[int] = None
    customer_name: str
    customer_email: str
    customer_gstin: Optional[str] = None
    challan_type: str
    items: Optional[list] = []
    asset_uids: Optional[list] = []
    total_value: float
    transporter_name: Optional[str] = None
    vehicle_number: Optional[str] = None
    transport_mode: Optional[str] = None
    lr_number: Optional[str] = None
    eway_bill_number: Optional[str] = None
    dispatch_from: Optional[dict] = None
    ship_to: Optional[dict] = None
    status: str
    dispatched_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    received_by: Optional[str] = None
    delivery_proof_url: Optional[str] = None
    notes: Optional[str] = None
    document_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Shipment ────────────────────────────────────────────────────────────────


class ShipmentCreate(BaseModel):
    order_id: str
    dc_number: Optional[str] = None
    shipment_type: str = "outbound"
    logistics_partner: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    estimated_delivery: Optional[date] = None
    asset_uids: Optional[list] = []
    package_count: int = 1
    total_weight: Optional[float] = None
    dimensions: Optional[str] = None
    origin_address: Optional[dict] = None
    destination_address: Optional[dict] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    notes: Optional[str] = None


class ShipmentUpdate(BaseModel):
    logistics_partner: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    estimated_delivery: Optional[date] = None
    status: Optional[str] = None
    received_by: Optional[str] = None
    failed_reason: Optional[str] = None
    notes: Optional[str] = None


class ShipmentTrackingEventCreate(BaseModel):
    status: str
    location: Optional[str] = None
    description: Optional[str] = None
    source: str = "manual"


class ShipmentTrackingEventResponse(BaseModel):
    id: int
    shipment_id: int
    status: str
    location: Optional[str] = None
    description: Optional[str] = None
    event_time: datetime
    source: str

    model_config = {"from_attributes": True}


class ShipmentResponse(BaseModel):
    id: int
    shipment_number: str
    order_id: str
    dc_number: Optional[str] = None
    shipment_type: str
    logistics_partner: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    estimated_delivery: Optional[date] = None
    asset_uids: Optional[list] = []
    package_count: int
    total_weight: Optional[float] = None
    dimensions: Optional[str] = None
    origin_address: Optional[dict] = None
    destination_address: Optional[dict] = None
    status: str
    picked_up_at: Optional[datetime] = None
    in_transit_at: Optional[datetime] = None
    out_for_delivery_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    delivery_proof_url: Optional[str] = None
    received_by: Optional[str] = None
    failed_reason: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    notes: Optional[str] = None
    tracking_events: list[ShipmentTrackingEventResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Replacement (Unified) ───────────────────────────────────────────────────


class ReplacementCreate(BaseModel):
    order_id: str
    contract_id: Optional[str] = None
    ticket_id: Optional[str] = None
    return_id: Optional[str] = None
    customer_name: str
    customer_email: EmailStr
    replacement_type: str  # advance/normal
    faulty_asset_uid: str
    faulty_reason: Optional[str] = None
    fault_description: Optional[str] = None
    replacement_asset_uid: Optional[str] = None
    notes: Optional[str] = None


class ReplacementUpdate(BaseModel):
    replacement_asset_uid: Optional[str] = None
    status: Optional[str] = None
    outbound_shipment_id: Optional[int] = None
    inbound_shipment_id: Optional[int] = None
    outbound_dc_number: Optional[str] = None
    inbound_dc_number: Optional[str] = None
    damage_found: Optional[bool] = None
    damage_charges: Optional[float] = None
    damage_notes: Optional[str] = None
    approved_by: Optional[str] = None
    notes: Optional[str] = None


class ReplacementResponse(BaseModel):
    id: int
    replacement_number: str
    order_id: str
    contract_id: Optional[str] = None
    ticket_id: Optional[str] = None
    return_id: Optional[str] = None
    customer_name: str
    customer_email: str
    replacement_type: str
    faulty_asset_id: Optional[int] = None
    faulty_asset_uid: str
    faulty_reason: Optional[str] = None
    fault_description: Optional[str] = None
    replacement_asset_id: Optional[int] = None
    replacement_asset_uid: Optional[str] = None
    outbound_shipment_id: Optional[int] = None
    inbound_shipment_id: Optional[int] = None
    outbound_dc_number: Optional[str] = None
    inbound_dc_number: Optional[str] = None
    status: str
    damage_found: bool
    damage_charges: float
    damage_notes: Optional[str] = None
    initiated_by: Optional[str] = None
    approved_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Security Deposit ────────────────────────────────────────────────────────


class SecurityDepositCreate(BaseModel):
    order_id: str
    contract_id: Optional[str] = None
    customer_name: str
    customer_email: EmailStr
    amount: float
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    received_date: Optional[date] = None
    notes: Optional[str] = None


class SecurityDepositUpdate(BaseModel):
    status: Optional[str] = None
    refund_amount: Optional[float] = None
    deductions: Optional[float] = None
    deduction_notes: Optional[str] = None
    refund_date: Optional[date] = None
    refund_transaction_id: Optional[str] = None
    notes: Optional[str] = None


class SecurityDepositResponse(BaseModel):
    id: int
    deposit_number: str
    order_id: str
    contract_id: Optional[str] = None
    customer_name: str
    customer_email: str
    amount: float
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    status: str
    received_date: Optional[date] = None
    refund_amount: float
    deductions: float
    deduction_notes: Optional[str] = None
    refund_date: Optional[date] = None
    refund_transaction_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Credit / Debit Note ─────────────────────────────────────────────────────


class CreditNoteCreate(BaseModel):
    note_type: str  # credit/debit
    order_id: Optional[str] = None
    invoice_id: Optional[str] = None
    return_id: Optional[str] = None
    customer_name: str
    customer_email: EmailStr
    reason: Optional[str] = None
    items: Optional[list] = []
    subtotal: float = 0.0
    tax: float = 0.0
    total: float = 0.0
    notes: Optional[str] = None


class CreditNoteUpdate(BaseModel):
    status: Optional[str] = None
    applied_to_invoice: Optional[str] = None
    notes: Optional[str] = None


class CreditNoteResponse(BaseModel):
    id: int
    cn_number: str
    note_type: str
    order_id: Optional[str] = None
    invoice_id: Optional[str] = None
    return_id: Optional[str] = None
    customer_name: str
    customer_email: str
    reason: Optional[str] = None
    items: Optional[list] = []
    subtotal: float
    tax: float
    total: float
    status: str
    applied_to_invoice: Optional[str] = None
    notes: Optional[str] = None
    document_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Insurance Policy ────────────────────────────────────────────────────────


class InsurancePolicyCreate(BaseModel):
    policy_number: str
    provider: str
    asset_uid: Optional[str] = None
    order_id: Optional[str] = None
    coverage_type: Optional[str] = None
    sum_insured: float = 0.0
    premium: float = 0.0
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class InsurancePolicyUpdate(BaseModel):
    status: Optional[str] = None
    claim_id: Optional[str] = None
    claim_amount: Optional[float] = None
    claim_status: Optional[str] = None
    notes: Optional[str] = None


class InsurancePolicyResponse(BaseModel):
    id: int
    policy_number: str
    provider: str
    asset_uid: Optional[str] = None
    order_id: Optional[str] = None
    coverage_type: Optional[str] = None
    sum_insured: float
    premium: float
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str
    claim_id: Optional[str] = None
    claim_amount: float
    claim_status: Optional[str] = None
    document_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
