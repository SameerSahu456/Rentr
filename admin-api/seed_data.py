"""
Seed script: populates the rentr_admin database with sample data
for all entities so every page has visible, interlinked data.

Usage:
    cd admin-api
    python seed_data.py
"""

import os
import sys
from datetime import date, datetime, timedelta

# Ensure the app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.models import (
    AdminUser,
    Asset,
    AssetLifecycleEvent,
    Contract,
    ContractReminder,
    Customer,
    DeliveryChallan,
    DistributorUser,
    DistributorCustomer,
    DistributorOrder,
    DistributorContract,
    DistributorInvoice,
    Invoice,
    KYCSubmission,
    Order,
    Payment,
    ProformaInvoice,
    Replacement,
    ReturnRequest,
    SecurityDeposit,
    Shipment,
    ShipmentTrackingEvent,
    SupportTicket,
    TicketMessage,
    CreditNote,
)
from app.core.security import hash_password


def seed():
    # Create all tables (including new columns)
    Base.metadata.create_all(bind=engine)

    # Run migration for new columns
    from sqlalchemy import text, inspect
    with engine.connect() as conn:
        inspector = inspect(engine)

        def _add_col(table, column, col_type="VARCHAR(100)"):
            if table not in inspector.get_table_names():
                return
            cols = [c["name"] for c in inspector.get_columns(table)]
            if column not in cols:
                conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {column} {col_type}'))

        _add_col("support_tickets", "asset_uid")
        _add_col("support_tickets", "contract_id")
        _add_col("support_tickets", "invoice_id")
        _add_col("support_tickets", "return_id")
        _add_col("invoices", "contract_id")
        _add_col("return_requests", "ticket_id")
        _add_col("return_requests", "invoice_id")
        _add_col("orders", "source", "VARCHAR(50) DEFAULT 'website'")
        _add_col("orders", "crm_order_id")
        _add_col("orders", "next_billing_date", "DATE")
        _add_col("contracts", "original_end_date", "DATE")
        _add_col("contracts", "extended_months", "INTEGER DEFAULT 0")
        _add_col("contracts", "version", "INTEGER DEFAULT 1")
        _add_col("contracts", "parent_contract_id", "INTEGER")
        _add_col("orders", "sales_order_pdf", "VARCHAR(500)")
        _add_col("orders", "delivery_status", "VARCHAR(50) DEFAULT 'pending'")
        _add_col("orders", "delivered_at", "TIMESTAMP WITH TIME ZONE")
        _add_col("orders", "delivery_confirmed_by", "VARCHAR(255)")
        _add_col("orders", "billing_start_date", "DATE")
        _add_col("orders", "billing_end_date", "DATE")
        _add_col("orders", "billing_status", "VARCHAR(50) DEFAULT 'not_started'")
        _add_col("orders", "proforma_invoice_number", "VARCHAR(100)")
        _add_col("orders", "delivery_challan_number", "VARCHAR(100)")
        conn.commit()

    db = SessionLocal()

    today = date.today()

    try:
        # ── Admin Users ─────────────────────────────────────────────────
        if db.query(AdminUser).count() == 0:
            admins = [
                AdminUser(email="admin@rentr.in", name="Rentr Admin", role="admin", password_hash=hash_password("admin123")),
                AdminUser(email="manager@rentr.in", name="Priya Sharma", role="manager", password_hash=hash_password("manager123")),
                AdminUser(email="agent@rentr.in", name="Rahul Mehta", role="agent", password_hash=hash_password("agent123")),
            ]
            db.add_all(admins)
            db.flush()
            print("  ✓ Admin users created")

        # ── Customers ───────────────────────────────────────────────────
        if db.query(Customer).count() == 0:
            customers = [
                Customer(email="santosh@techcorp.in", full_name="Santosh Kumar", phone="+919870200089", role="customer", company_name="TechCorp India", industry="Technology", gst_no="27AABCT1234F1ZH", company_pan="AABCT1234F", password_hash=hash_password("customer123")),
                Customer(email="anita@startuplab.in", full_name="Anita Desai", phone="+919876543210", role="customer", company_name="StartupLab", industry="SaaS", gst_no="29AADCS5678G1ZP", company_pan="AADCS5678G", password_hash=hash_password("customer123")),
                Customer(email="vikram@distributor.in", full_name="Vikram Singh", phone="+919812345678", role="partner", company_name="DigiDistribute", industry="IT Distribution", gst_no="07AAECV9012H1ZQ", company_pan="AAECV9012H", password_hash=hash_password("customer123")),
                Customer(email="meera@finserv.in", full_name="Meera Patel", phone="+919898765432", role="customer", company_name="FinServ Solutions", industry="Finance", gst_no="24AAGCM3456K1ZR", company_pan="AAGCM3456K", password_hash=hash_password("customer123")),
                Customer(email="rajesh@infrabuild.in", full_name="Rajesh Nair", phone="+919845123456", role="partner", company_name="InfraBuild Tech", industry="Construction Tech", gst_no="32AAHCI7890L1ZS", company_pan="AAHCI7890L", password_hash=hash_password("customer123")),
                Customer(email="preethi@cloudnine.in", full_name="Preethi Reddy", phone="+919900112233", role="customer", company_name="CloudNine Solutions", industry="Cloud Services", gst_no="36AABCC2345M1ZT", company_pan="AABCC2345M", password_hash=hash_password("customer123")),
            ]
            db.add_all(customers)
            db.flush()
            print("  ✓ Customers created")

        # ── Orders ──────────────────────────────────────────────────────
        if db.query(Order).count() == 0:
            orders = [
                Order(
                    order_number="ORD-2026-0001", customer_id=1,
                    customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", customer_type="customer",
                    items=[
                        {"product_name": "Dell Latitude 5540", "quantity": 5, "price_per_month": 3500},
                        {"product_name": "HP ProDesk 400 G9", "quantity": 3, "price_per_month": 2800},
                    ],
                    total_monthly=25900, rental_months=12, status="active",
                    delivery_status="delivered", delivered_at=datetime.now() - timedelta(days=58),
                    billing_start_date=today - timedelta(days=58), billing_status="active",
                    next_billing_date=today + timedelta(days=2),
                    proforma_invoice_number="PI-2026-0001", delivery_challan_number="DC-2026-0001",
                    shipping_address={"firstName": "Santosh", "lastName": "Kumar", "streetAddress1": "Flat 302, Nensey Society", "city": "Mumbai", "countryArea": "Maharashtra", "postalCode": "400050", "country": "India"},
                    billing_address={"firstName": "Santosh", "lastName": "Kumar", "streetAddress1": "TechCorp India, BKC", "city": "Mumbai", "countryArea": "Maharashtra", "postalCode": "400051", "country": "India"},
                ),
                Order(
                    order_number="ORD-2026-0002", customer_id=2,
                    customer_name="Anita Desai", customer_email="anita@startuplab.in", customer_type="customer",
                    items=[
                        {"product_name": "Lenovo ThinkPad T14s", "quantity": 10, "price_per_month": 4200},
                        {"product_name": "Dell UltraSharp 27\" Monitor", "quantity": 10, "price_per_month": 1200},
                    ],
                    total_monthly=54000, rental_months=24, status="active",
                    delivery_status="delivered", delivered_at=datetime.now() - timedelta(days=28),
                    billing_start_date=today - timedelta(days=28), billing_status="active",
                    next_billing_date=today + timedelta(days=2),
                    shipping_address={"firstName": "Anita", "lastName": "Desai", "streetAddress1": "Koramangala 5th Block", "city": "Bangalore", "countryArea": "Karnataka", "postalCode": "560095", "country": "India"},
                ),
                Order(
                    order_number="ORD-2026-0003", customer_id=3,
                    customer_name="Vikram Singh", customer_email="vikram@distributor.in", customer_type="partner",
                    items=[
                        {"product_name": "HPE ProLiant DL360 Gen10", "quantity": 2, "price_per_month": 15000},
                        {"product_name": "Dell PowerEdge R740", "quantity": 1, "price_per_month": 18000},
                    ],
                    total_monthly=48000, rental_months=36, status="confirmed",
                    delivery_status="dispatched",
                    shipping_address={"firstName": "Vikram", "lastName": "Singh", "streetAddress1": "Sector 18, Noida", "city": "Noida", "countryArea": "Uttar Pradesh", "postalCode": "201301", "country": "India"},
                ),
                Order(
                    order_number="ORD-2026-0004", customer_id=4,
                    customer_name="Meera Patel", customer_email="meera@finserv.in", customer_type="customer",
                    items=[
                        {"product_name": "Dell OptiPlex 7010", "quantity": 20, "price_per_month": 2500},
                    ],
                    total_monthly=50000, rental_months=12, status="delivered",
                    delivery_status="delivered", delivered_at=datetime.now() - timedelta(days=13),
                    billing_start_date=today - timedelta(days=13), billing_status="active",
                    shipping_address={"firstName": "Meera", "lastName": "Patel", "streetAddress1": "SG Highway", "city": "Ahmedabad", "countryArea": "Gujarat", "postalCode": "380015", "country": "India"},
                ),
                Order(
                    order_number="ORD-2025-0010", customer_id=1,
                    customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", customer_type="customer",
                    items=[{"product_name": "HP EliteBook 840 G8", "quantity": 2, "price_per_month": 3800}],
                    total_monthly=7600, rental_months=12, status="completed",
                    delivery_status="delivered", billing_status="completed",
                    shipping_address={"firstName": "Santosh", "lastName": "Kumar", "streetAddress1": "Flat 302, Nensey Society", "city": "Mumbai", "countryArea": "Maharashtra", "postalCode": "400050", "country": "India"},
                ),
                Order(
                    order_number="ORD-2026-0005", customer_id=5,
                    customer_name="Rajesh Nair", customer_email="rajesh@infrabuild.in", customer_type="partner",
                    items=[
                        {"product_name": "Lenovo ThinkStation P360", "quantity": 5, "price_per_month": 6000},
                        {"product_name": "Dell Precision 3660", "quantity": 5, "price_per_month": 5500},
                    ],
                    total_monthly=57500, rental_months=18, status="active",
                    delivery_status="delivered", delivered_at=datetime.now() - timedelta(days=45),
                    billing_start_date=today - timedelta(days=45), billing_status="active",
                    next_billing_date=today + timedelta(days=15),
                    shipping_address={"firstName": "Rajesh", "lastName": "Nair", "streetAddress1": "Technopark Phase III", "city": "Thiruvananthapuram", "countryArea": "Kerala", "postalCode": "695581", "country": "India"},
                ),
                Order(
                    order_number="ORD-2026-0006", customer_id=6,
                    customer_name="Preethi Reddy", customer_email="preethi@cloudnine.in", customer_type="customer",
                    items=[
                        {"product_name": "NVIDIA A100 80GB GPU Server", "quantity": 1, "price_per_month": 35000},
                        {"product_name": "Cisco Catalyst 9200L Switch", "quantity": 2, "price_per_month": 5000},
                    ],
                    total_monthly=45000, rental_months=12, status="confirmed",
                    delivery_status="pending",
                    shipping_address={"firstName": "Preethi", "lastName": "Reddy", "streetAddress1": "HITEC City, Madhapur", "city": "Hyderabad", "countryArea": "Telangana", "postalCode": "500081", "country": "India"},
                ),
            ]
            db.add_all(orders)
            db.flush()
            print("  ✓ Orders created")

        # ── Contracts (with versioning) ─────────────────────────────────
        if db.query(Contract).count() == 0:
            contracts = [
                # Order 1: Active contract
                Contract(contract_number="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", order_id="ORD-2026-0001", type="rental", version=1, start_date=today - timedelta(days=60), end_date=today + timedelta(days=305), status="active", signed_at=datetime.now() - timedelta(days=60), terms="Standard 12-month rental agreement. Monthly billing on 1st. Security deposit equivalent to 2 months rent."),
                # Order 2: Active contract
                Contract(contract_number="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in", order_id="ORD-2026-0002", type="rental", version=1, start_date=today - timedelta(days=30), end_date=today + timedelta(days=700), status="active", signed_at=datetime.now() - timedelta(days=30), terms="24-month rental agreement with option to buy at residual value after term."),
                # Order 3: Pending signature
                Contract(contract_number="CTR-2026-0003", customer_name="Vikram Singh", customer_email="vikram@distributor.in", order_id="ORD-2026-0003", type="lease", version=1, start_date=today, end_date=today + timedelta(days=1095), status="pending_signature", terms="36-month lease agreement for server infrastructure. Partner rates apply."),
                # Order 4: Active contract - expiring soon (for testing alert)
                Contract(contract_number="CTR-2026-0004", customer_name="Meera Patel", customer_email="meera@finserv.in", order_id="ORD-2026-0004", type="rental", version=1, start_date=today - timedelta(days=340), end_date=today + timedelta(days=25), status="active", signed_at=datetime.now() - timedelta(days=340), terms="12-month rental agreement for desktop fleet."),
                # Order 5 (old): EXPIRED v1
                Contract(contract_number="CTR-2025-0010", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", order_id="ORD-2025-0010", type="rental", version=1, start_date=today - timedelta(days=400), end_date=today - timedelta(days=35), status="expired", terms="12-month rental for laptops."),
                # Order 5 (old): RENEWED v2 - shows version history
                Contract(contract_number="CTR-2026-0010", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", order_id="ORD-2025-0010", type="rental", version=2, parent_contract_id=5, start_date=today - timedelta(days=30), end_date=today + timedelta(days=335), status="active", signed_at=datetime.now() - timedelta(days=28), terms="Renewed 12-month rental. Continuation of CTR-2025-0010."),
                # Order 5: Draft contract
                Contract(contract_number="CTR-2026-0005", customer_name="Rajesh Nair", customer_email="rajesh@infrabuild.in", order_id="ORD-2026-0005", type="rental", version=1, start_date=today - timedelta(days=45), end_date=today + timedelta(days=500), status="active", signed_at=datetime.now() - timedelta(days=44), terms="18-month rental agreement for workstation fleet. Partner discount applied."),
                # Order 6: Draft
                Contract(contract_number="CTR-2026-0006", customer_name="Preethi Reddy", customer_email="preethi@cloudnine.in", order_id="ORD-2026-0006", type="rental", version=1, start_date=today, end_date=today + timedelta(days=365), status="draft", terms="12-month rental for GPU server and network equipment."),
            ]
            db.add_all(contracts)
            db.flush()
            print("  ✓ Contracts created (with versioning)")

        # ── Contract Reminders ──────────────────────────────────────────
        if db.query(ContractReminder).count() == 0:
            reminders = [
                ContractReminder(contract_id=1, reminder_type="expiry", days_before=30, channel="email", is_active=True, next_trigger_date=today + timedelta(days=275)),
                ContractReminder(contract_id=1, reminder_type="expiry", days_before=7, channel="both", is_active=True, next_trigger_date=today + timedelta(days=298)),
                ContractReminder(contract_id=4, reminder_type="expiry", days_before=30, channel="email", is_active=True, next_trigger_date=None),  # already triggered
                ContractReminder(contract_id=4, reminder_type="renewal", days_before=15, channel="email", is_active=True, next_trigger_date=today + timedelta(days=10)),
                ContractReminder(contract_id=2, reminder_type="expiry", days_before=60, channel="email", is_active=True, next_trigger_date=today + timedelta(days=640)),
            ]
            db.add_all(reminders)
            db.flush()
            print("  ✓ Contract reminders created")

        # ── Assets ──────────────────────────────────────────────────────
        if db.query(Asset).count() == 0:
            assets = [
                # Order 1 assets (Santosh - TechCorp)
                Asset(uid="RENTR-LP-2026-00001", category="LP", oem="Dell", model="Latitude 5540", specs="Intel i5-1345U, 16GB RAM, 512GB SSD", serial_number="DL5540-A001", acquisition_cost=72000, acquisition_date=today - timedelta(days=90), monthly_rate=3500, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", warranty_expiry=today + timedelta(days=900)),
                Asset(uid="RENTR-LP-2026-00002", category="LP", oem="Dell", model="Latitude 5540", specs="Intel i5-1345U, 16GB RAM, 512GB SSD", serial_number="DL5540-A002", acquisition_cost=72000, acquisition_date=today - timedelta(days=90), monthly_rate=3500, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-LP-2026-00003", category="LP", oem="Dell", model="Latitude 5540", specs="Intel i5-1345U, 16GB RAM, 512GB SSD", serial_number="DL5540-A003", acquisition_cost=72000, acquisition_date=today - timedelta(days=90), monthly_rate=3500, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-LP-2026-00004", category="LP", oem="Dell", model="Latitude 5540", specs="Intel i5-1345U, 16GB RAM, 512GB SSD", serial_number="DL5540-A004", acquisition_cost=72000, acquisition_date=today - timedelta(days=90), monthly_rate=3500, status="deployed", condition_grade="B", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-LP-2026-00005", category="LP", oem="Dell", model="Latitude 5540", specs="Intel i5-1345U, 16GB RAM, 512GB SSD", serial_number="DL5540-A005", acquisition_cost=72000, acquisition_date=today - timedelta(days=90), monthly_rate=3500, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-DT-2026-00001", category="DT", oem="HP", model="ProDesk 400 G9", specs="Intel i5-13500, 8GB RAM, 256GB SSD", serial_number="HP400-B001", acquisition_cost=48000, acquisition_date=today - timedelta(days=90), monthly_rate=2800, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-DT-2026-00002", category="DT", oem="HP", model="ProDesk 400 G9", specs="Intel i5-13500, 8GB RAM, 256GB SSD", serial_number="HP400-B002", acquisition_cost=48000, acquisition_date=today - timedelta(days=90), monthly_rate=2800, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-DT-2026-00003", category="DT", oem="HP", model="ProDesk 400 G9", specs="Intel i5-13500, 8GB RAM, 256GB SSD", serial_number="HP400-B003", acquisition_cost=48000, acquisition_date=today - timedelta(days=90), monthly_rate=2800, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                # Order 2 assets (Anita - StartupLab)
                Asset(uid="RENTR-LP-2026-00010", category="LP", oem="Lenovo", model="ThinkPad T14s", specs="AMD Ryzen 7 PRO 6850U, 16GB RAM, 512GB SSD", serial_number="LTP14S-C001", acquisition_cost=95000, acquisition_date=today - timedelta(days=45), monthly_rate=4200, status="deployed", condition_grade="A", site="StartupLab Bangalore", order_id="ORD-2026-0002", contract_id="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in"),
                Asset(uid="RENTR-LP-2026-00011", category="LP", oem="Lenovo", model="ThinkPad T14s", specs="AMD Ryzen 7 PRO 6850U, 16GB RAM, 512GB SSD", serial_number="LTP14S-C002", acquisition_cost=95000, acquisition_date=today - timedelta(days=45), monthly_rate=4200, status="deployed", condition_grade="A", site="StartupLab Bangalore", order_id="ORD-2026-0002", contract_id="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in"),
                # Order 3 assets (Vikram - servers)
                Asset(uid="RENTR-SVR-2026-00001", category="SVR", oem="HPE", model="ProLiant DL360 Gen10", specs="Xeon Silver 4210R, 64GB RAM, 1.2TB SAS", serial_number="HPE360-D001", acquisition_cost=350000, acquisition_date=today - timedelta(days=30), monthly_rate=15000, status="staged", condition_grade="A", order_id="ORD-2026-0003", customer_name="Vikram Singh", customer_email="vikram@distributor.in"),
                Asset(uid="RENTR-SVR-2026-00002", category="SVR", oem="HPE", model="ProLiant DL360 Gen10", specs="Xeon Silver 4210R, 64GB RAM, 1.2TB SAS", serial_number="HPE360-D002", acquisition_cost=350000, acquisition_date=today - timedelta(days=30), monthly_rate=15000, status="staged", condition_grade="A", order_id="ORD-2026-0003", customer_name="Vikram Singh", customer_email="vikram@distributor.in"),
                Asset(uid="RENTR-SVR-2026-00003", category="SVR", oem="Dell", model="PowerEdge R740", specs="Xeon Gold 5218R, 128GB RAM, 2.4TB SAS", serial_number="DPE740-D003", acquisition_cost=520000, acquisition_date=today - timedelta(days=30), monthly_rate=18000, status="in_warehouse", condition_grade="A"),
                # Order 4 assets (Meera - desktops)
                Asset(uid="RENTR-DT-2026-00010", category="DT", oem="Dell", model="OptiPlex 7010", specs="Intel i5-13500T, 16GB RAM, 512GB SSD", serial_number="DO7010-E001", acquisition_cost=55000, acquisition_date=today - timedelta(days=20), monthly_rate=2500, status="deployed", condition_grade="A", site="FinServ Ahmedabad", order_id="ORD-2026-0004", contract_id="CTR-2026-0004", customer_name="Meera Patel", customer_email="meera@finserv.in"),
                Asset(uid="RENTR-DT-2026-00011", category="DT", oem="Dell", model="OptiPlex 7010", specs="Intel i5-13500T, 16GB RAM, 512GB SSD", serial_number="DO7010-E002", acquisition_cost=55000, acquisition_date=today - timedelta(days=20), monthly_rate=2500, status="deployed", condition_grade="A", site="FinServ Ahmedabad", order_id="ORD-2026-0004", contract_id="CTR-2026-0004", customer_name="Meera Patel", customer_email="meera@finserv.in"),
                # Old order assets (returned)
                Asset(uid="RENTR-LP-2025-00010", category="LP", oem="HP", model="EliteBook 840 G8", specs="Intel i7-1165G7, 16GB RAM, 512GB SSD", serial_number="HPE840-F001", acquisition_cost=85000, acquisition_date=today - timedelta(days=450), monthly_rate=3800, status="deployed", condition_grade="B", order_id="ORD-2025-0010", contract_id="CTR-2026-0010", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-LP-2025-00011", category="LP", oem="HP", model="EliteBook 840 G8", specs="Intel i7-1165G7, 16GB RAM, 512GB SSD", serial_number="HPE840-F002", acquisition_cost=85000, acquisition_date=today - timedelta(days=450), monthly_rate=3800, status="deployed", condition_grade="B", order_id="ORD-2025-0010", contract_id="CTR-2026-0010", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                # Order 5 assets (Rajesh)
                Asset(uid="RENTR-WS-2026-00001", category="WS", oem="Lenovo", model="ThinkStation P360", specs="Intel i7-12700, 32GB RAM, 1TB SSD, NVIDIA T1000", serial_number="LTS360-G001", acquisition_cost=130000, acquisition_date=today - timedelta(days=60), monthly_rate=6000, status="deployed", condition_grade="A", site="InfraBuild Trivandrum", order_id="ORD-2026-0005", contract_id="CTR-2026-0005", customer_name="Rajesh Nair", customer_email="rajesh@infrabuild.in"),
                Asset(uid="RENTR-WS-2026-00002", category="WS", oem="Dell", model="Precision 3660", specs="Intel i7-13700, 32GB RAM, 1TB SSD, NVIDIA RTX A2000", serial_number="DP3660-G002", acquisition_cost=145000, acquisition_date=today - timedelta(days=60), monthly_rate=5500, status="deployed", condition_grade="A", site="InfraBuild Trivandrum", order_id="ORD-2026-0005", contract_id="CTR-2026-0005", customer_name="Rajesh Nair", customer_email="rajesh@infrabuild.in"),
                # Unassigned inventory
                Asset(uid="RENTR-NW-2026-00001", category="NW", oem="Cisco", model="Catalyst 9200L", specs="24-port PoE+, 4x1G uplink", serial_number="CSC9200-G001", acquisition_cost=120000, acquisition_date=today - timedelta(days=60), monthly_rate=5000, status="in_warehouse", condition_grade="A"),
                Asset(uid="RENTR-GPU-2026-00001", category="GPU", oem="NVIDIA", model="A100 80GB", specs="PCIe, 80GB HBM2e", serial_number="NVA100-H001", acquisition_cost=800000, acquisition_date=today - timedelta(days=10), monthly_rate=35000, status="in_warehouse", condition_grade="A"),
                Asset(uid="RENTR-LP-2026-00020", category="LP", oem="Apple", model="MacBook Pro 14\"", specs="M3 Pro, 18GB RAM, 512GB SSD", serial_number="AMBP14-J001", acquisition_cost=175000, acquisition_date=today - timedelta(days=5), monthly_rate=7500, status="in_warehouse", condition_grade="A"),
            ]
            db.add_all(assets)
            db.flush()

            # Lifecycle events
            events = [
                AssetLifecycleEvent(asset_id=1, asset_uid="RENTR-LP-2026-00001", from_state=None, to_state="in_warehouse", triggered_by="System", notes="Asset acquired"),
                AssetLifecycleEvent(asset_id=1, asset_uid="RENTR-LP-2026-00001", from_state="in_warehouse", to_state="staged", triggered_by="admin@rentr.in", notes="Staged for ORD-2026-0001"),
                AssetLifecycleEvent(asset_id=1, asset_uid="RENTR-LP-2026-00001", from_state="staged", to_state="deployed", triggered_by="admin@rentr.in", notes="Deployed to TechCorp Mumbai"),
                AssetLifecycleEvent(asset_id=11, asset_uid="RENTR-SVR-2026-00001", from_state=None, to_state="in_warehouse", triggered_by="System", notes="Server acquired"),
                AssetLifecycleEvent(asset_id=11, asset_uid="RENTR-SVR-2026-00001", from_state="in_warehouse", to_state="staged", triggered_by="admin@rentr.in", notes="Staged for ORD-2026-0003"),
            ]
            db.add_all(events)
            db.flush()
            print("  ✓ Assets & lifecycle events created")

        # ── Invoices ────────────────────────────────────────────────────
        if db.query(Invoice).count() == 0:
            invoices = [
                Invoice(invoice_number="INV-2026-0001", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", items=[{"description": "Monthly rental - Feb 2026", "quantity": 1, "unit_price": 25900}], subtotal=25900, tax=4662, total=30562, status="paid", due_date=today - timedelta(days=50), paid_date=today - timedelta(days=48)),
                Invoice(invoice_number="INV-2026-0002", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", items=[{"description": "Monthly rental - Mar 2026", "quantity": 1, "unit_price": 25900}], subtotal=25900, tax=4662, total=30562, status="paid", due_date=today - timedelta(days=20), paid_date=today - timedelta(days=18)),
                Invoice(invoice_number="INV-2026-0003", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", items=[{"description": "Monthly rental - Apr 2026", "quantity": 1, "unit_price": 25900}], subtotal=25900, tax=4662, total=30562, status="sent", due_date=today + timedelta(days=10)),
                Invoice(invoice_number="INV-2026-0004", order_id="ORD-2026-0002", contract_id="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in", items=[{"description": "Monthly rental - Mar 2026", "quantity": 1, "unit_price": 54000}], subtotal=54000, tax=9720, total=63720, status="paid", due_date=today - timedelta(days=15), paid_date=today - timedelta(days=13)),
                Invoice(invoice_number="INV-2026-0005", order_id="ORD-2026-0002", contract_id="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in", items=[{"description": "Monthly rental - Apr 2026", "quantity": 1, "unit_price": 54000}], subtotal=54000, tax=9720, total=63720, status="overdue", due_date=today - timedelta(days=5)),
                Invoice(invoice_number="INV-2026-0006", order_id="ORD-2026-0004", contract_id="CTR-2026-0004", customer_name="Meera Patel", customer_email="meera@finserv.in", items=[{"description": "Monthly rental - Apr 2026", "quantity": 1, "unit_price": 50000}], subtotal=50000, tax=9000, total=59000, status="sent", due_date=today + timedelta(days=20)),
                Invoice(invoice_number="INV-2026-0007", order_id="ORD-2026-0003", customer_name="Vikram Singh", customer_email="vikram@distributor.in", items=[{"description": "Setup & first month - servers", "quantity": 1, "unit_price": 48000}], subtotal=48000, tax=8640, total=56640, status="sent", due_date=today + timedelta(days=15)),
                Invoice(invoice_number="INV-2026-0008", order_id="ORD-2026-0005", contract_id="CTR-2026-0005", customer_name="Rajesh Nair", customer_email="rajesh@infrabuild.in", items=[{"description": "Monthly rental - Mar 2026", "quantity": 1, "unit_price": 57500}], subtotal=57500, tax=10350, total=67850, status="paid", due_date=today - timedelta(days=25), paid_date=today - timedelta(days=23)),
                Invoice(invoice_number="INV-2026-0009", order_id="ORD-2026-0005", contract_id="CTR-2026-0005", customer_name="Rajesh Nair", customer_email="rajesh@infrabuild.in", items=[{"description": "Monthly rental - Apr 2026", "quantity": 1, "unit_price": 57500}], subtotal=57500, tax=10350, total=67850, status="sent", due_date=today + timedelta(days=5)),
            ]
            db.add_all(invoices)
            db.flush()
            print("  ✓ Invoices created")

        # ── Payments ────────────────────────────────────────────────────
        if db.query(Payment).count() == 0:
            payments = [
                Payment(invoice_id=1, amount=30562, method="bank_transfer", transaction_id="NEFT-20260220-001", status="completed", paid_at=datetime.now() - timedelta(days=48)),
                Payment(invoice_id=2, amount=30562, method="bank_transfer", transaction_id="NEFT-20260320-002", status="completed", paid_at=datetime.now() - timedelta(days=18)),
                Payment(invoice_id=4, amount=63720, method="bank_transfer", transaction_id="NEFT-20260325-003", status="completed", paid_at=datetime.now() - timedelta(days=13)),
                Payment(invoice_id=5, amount=30000, method="upi", transaction_id="UPI-20260405-004", status="completed", paid_at=datetime.now() - timedelta(days=3)),
                Payment(invoice_id=8, amount=67850, method="bank_transfer", transaction_id="NEFT-20260318-005", status="completed", paid_at=datetime.now() - timedelta(days=23)),
            ]
            db.add_all(payments)
            db.flush()
            print("  ✓ Payments created")

        # ── Support Tickets ─────────────────────────────────────────────
        if db.query(SupportTicket).count() == 0:
            tickets = [
                SupportTicket(ticket_number="TKT-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", order_id="ORD-2026-0001", asset_uid="RENTR-LP-2026-00001", contract_id="CTR-2026-0001", subject="Laptop overheating issue", description="Dell Latitude 5540 (RENTR-LP-2026-00001) is overheating during heavy workloads.", priority="high", status="in_progress", assigned_to="Rahul Mehta", category="Hardware"),
                SupportTicket(ticket_number="TKT-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in", order_id="ORD-2026-0002", subject="Need additional monitors", description="We need 5 more Dell UltraSharp monitors for new team members.", priority="medium", status="open", category="Request"),
                SupportTicket(ticket_number="TKT-2026-0003", customer_name="Meera Patel", customer_email="meera@finserv.in", order_id="ORD-2026-0004", invoice_id="INV-2026-0006", subject="Invoice billing query", description="The April invoice shows incorrect tax calculation.", priority="low", status="open", category="Billing"),
                SupportTicket(ticket_number="TKT-2026-0004", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", order_id="ORD-2025-0010", subject="Return request for completed order", description="Order ORD-2025-0010 tenure completed. Please initiate return.", priority="medium", status="resolved", assigned_to="Priya Sharma", category="Returns"),
                SupportTicket(ticket_number="TKT-2026-0005", customer_name="Rajesh Nair", customer_email="rajesh@infrabuild.in", order_id="ORD-2026-0005", asset_uid="RENTR-WS-2026-00001", contract_id="CTR-2026-0005", subject="Workstation RAM upgrade request", description="Need to upgrade ThinkStation P360 RAM from 32GB to 64GB for CAD workloads.", priority="medium", status="open", assigned_to="Rahul Mehta", category="Hardware"),
            ]
            db.add_all(tickets)
            db.flush()

            msgs = [
                TicketMessage(ticket_id=1, sender="Santosh Kumar", sender_type="customer", message="The laptop started overheating 3 days ago. It shuts down during video calls."),
                TicketMessage(ticket_id=1, sender="Rahul Mehta", sender_type="agent", message="We'll schedule a technician visit. Can you confirm availability on Monday?"),
                TicketMessage(ticket_id=1, sender="Santosh Kumar", sender_type="customer", message="Yes, Monday works. Office hours 10am-6pm."),
                TicketMessage(ticket_id=4, sender="Priya Sharma", sender_type="agent", message="Return pickup scheduled for next Tuesday. Please keep equipment ready."),
                TicketMessage(ticket_id=4, sender="System", sender_type="system", message="Return request RET-2026-0001 has been created."),
                TicketMessage(ticket_id=5, sender="Rajesh Nair", sender_type="customer", message="Current 32GB is insufficient for our AutoCAD and Revit workloads."),
                TicketMessage(ticket_id=5, sender="Rahul Mehta", sender_type="agent", message="Checking availability of 64GB kits. Will update within 24 hours."),
            ]
            db.add_all(msgs)
            db.flush()
            print("  ✓ Support tickets & messages created")

        # ── Return Requests ─────────────────────────────────────────────
        if db.query(ReturnRequest).count() == 0:
            returns = [
                ReturnRequest(return_number="RET-2026-0001", order_id="ORD-2025-0010", contract_id="CTR-2025-0010", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", asset_uids=["RENTR-LP-2025-00010", "RENTR-LP-2025-00011"], ticket_id="TKT-2026-0004", reason="contract_end", pickup_date=today + timedelta(days=5), pickup_time="10:00 AM - 12:00 PM", site="Flat 302, Nensey Society, Mumbai", data_wipe_requested=True, status="approved"),
                ReturnRequest(return_number="RET-2026-0002", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", asset_uids=["RENTR-LP-2026-00001"], ticket_id="TKT-2026-0001", reason="faulty", pickup_date=today + timedelta(days=3), site="TechCorp Mumbai", data_wipe_requested=False, status="pending", special_instructions="Laptop has overheating issue."),
            ]
            db.add_all(returns)
            db.flush()
            print("  ✓ Return requests created")

        # ── KYC Submissions ─────────────────────────────────────────────
        if db.query(KYCSubmission).count() == 0:
            kyc = [
                KYCSubmission(customer_email="vikram@distributor.in", customer_name="Vikram Singh", company_name="DigiDistribute", account_type="channel_partner", gstin="07AAECV9012H1ZQ", pan="AAECV9012H", documents=[{"type": "gstin_cert", "filename": "gstin.pdf", "status": "verified"}, {"type": "pan_card", "filename": "pan.pdf", "status": "verified"}], status="approved", credit_limit=500000, reviewer="admin@rentr.in", review_notes="All documents verified."),
                KYCSubmission(customer_email="meera@finserv.in", customer_name="Meera Patel", company_name="FinServ Solutions", account_type="direct_enterprise", gstin="24AAGCM3456K1ZR", pan="AAGCM3456K", documents=[{"type": "gstin_cert", "filename": "gstin.pdf", "status": "pending"}], status="under_review"),
                KYCSubmission(customer_email="rajesh@infrabuild.in", customer_name="Rajesh Nair", company_name="InfraBuild Tech", account_type="channel_partner", gstin="32AAHCI7890L1ZS", pan="AAHCI7890L", documents=[{"type": "gstin_cert", "filename": "gstin.pdf", "status": "verified"}, {"type": "pan_card", "filename": "pan.pdf", "status": "verified"}, {"type": "bank_statement", "filename": "bank.pdf", "status": "verified"}], status="approved", credit_limit=750000, reviewer="admin@rentr.in"),
                KYCSubmission(customer_email="preethi@cloudnine.in", customer_name="Preethi Reddy", company_name="CloudNine Solutions", account_type="direct_enterprise", gstin="36AABCC2345M1ZT", pan="AABCC2345M", documents=[{"type": "gstin_cert", "filename": "gstin.pdf", "status": "pending"}, {"type": "pan_card", "filename": "pan.pdf", "status": "pending"}], status="pending"),
            ]
            db.add_all(kyc)
            db.flush()
            print("  ✓ KYC submissions created")

        # ── Proforma Invoices ───────────────────────────────────────────
        if db.query(ProformaInvoice).count() == 0:
            pis = [
                ProformaInvoice(pi_number="PI-2026-0001", order_id="ORD-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", customer_gstin="27AABCT1234F1ZH", items=[{"description": "Dell Latitude 5540 x5", "quantity": 5, "unit_price": 3500}, {"description": "HP ProDesk 400 G9 x3", "quantity": 3, "unit_price": 2800}], subtotal=25900, cgst=2331, sgst=2331, igst=0, total=30562, rental_months=12, security_deposit=51800, validity_days=7, status="accepted", accepted_at=datetime.now() - timedelta(days=62)),
                ProformaInvoice(pi_number="PI-2026-0002", order_id="ORD-2026-0006", customer_name="Preethi Reddy", customer_email="preethi@cloudnine.in", customer_gstin="36AABCC2345M1ZT", items=[{"description": "NVIDIA A100 GPU Server x1", "quantity": 1, "unit_price": 35000}, {"description": "Cisco Catalyst 9200L x2", "quantity": 2, "unit_price": 5000}], subtotal=45000, cgst=0, sgst=0, igst=8100, total=53100, rental_months=12, security_deposit=90000, validity_days=7, status="sent"),
            ]
            db.add_all(pis)
            db.flush()
            print("  ✓ Proforma invoices created")

        # ── Delivery Challans ───────────────────────────────────────────
        if db.query(DeliveryChallan).count() == 0:
            dcs = [
                DeliveryChallan(dc_number="DC-2026-0001", order_id="ORD-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", customer_gstin="27AABCT1234F1ZH", challan_type="supply_on_rental", items=[{"description": "Dell Latitude 5540", "quantity": 5, "value": 360000}, {"description": "HP ProDesk 400 G9", "quantity": 3, "value": 144000}], asset_uids=["RENTR-LP-2026-00001", "RENTR-LP-2026-00002", "RENTR-LP-2026-00003", "RENTR-LP-2026-00004", "RENTR-LP-2026-00005", "RENTR-DT-2026-00001", "RENTR-DT-2026-00002", "RENTR-DT-2026-00003"], total_value=504000, transporter_name="BlueDart Express", vehicle_number="MH-01-AB-1234", transport_mode="road", status="delivered", dispatched_at=datetime.now() - timedelta(days=60), delivered_at=datetime.now() - timedelta(days=58), received_by="Santosh Kumar", ship_to={"name": "TechCorp India", "address": "Flat 302, Nensey Society", "city": "Mumbai", "state": "Maharashtra", "pincode": "400050"}),
                DeliveryChallan(dc_number="DC-2026-0002", order_id="ORD-2026-0003", customer_name="Vikram Singh", customer_email="vikram@distributor.in", customer_gstin="07AAECV9012H1ZQ", challan_type="supply_on_rental", items=[{"description": "HPE ProLiant DL360 Gen10", "quantity": 2, "value": 700000}, {"description": "Dell PowerEdge R740", "quantity": 1, "value": 520000}], asset_uids=["RENTR-SVR-2026-00001", "RENTR-SVR-2026-00002", "RENTR-SVR-2026-00003"], total_value=1220000, transporter_name="DTDC", vehicle_number="DL-05-CD-5678", transport_mode="road", status="dispatched", dispatched_at=datetime.now() - timedelta(days=1), ship_to={"name": "DigiDistribute", "address": "Sector 18", "city": "Noida", "state": "Uttar Pradesh", "pincode": "201301"}),
            ]
            db.add_all(dcs)
            db.flush()
            print("  ✓ Delivery challans created")

        # ── Shipments ───────────────────────────────────────────────────
        if db.query(Shipment).count() == 0:
            shipments = [
                Shipment(shipment_number="SHP-2026-0001", order_id="ORD-2026-0001", dc_number="DC-2026-0001", shipment_type="outbound", logistics_partner="BlueDart Express", tracking_number="BD1234567890", tracking_url="https://bluedart.com/track/BD1234567890", asset_uids=["RENTR-LP-2026-00001", "RENTR-LP-2026-00002", "RENTR-LP-2026-00003", "RENTR-LP-2026-00004", "RENTR-LP-2026-00005", "RENTR-DT-2026-00001", "RENTR-DT-2026-00002", "RENTR-DT-2026-00003"], package_count=4, total_weight=45.5, customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", status="delivered", delivered_at=datetime.now() - timedelta(days=58), received_by="Santosh Kumar", origin_address={"city": "Mumbai", "state": "Maharashtra"}, destination_address={"city": "Mumbai", "state": "Maharashtra"}),
                Shipment(shipment_number="SHP-2026-0002", order_id="ORD-2026-0003", dc_number="DC-2026-0002", shipment_type="outbound", logistics_partner="DTDC", tracking_number="DTDC9876543210", asset_uids=["RENTR-SVR-2026-00001", "RENTR-SVR-2026-00002", "RENTR-SVR-2026-00003"], package_count=3, total_weight=120.0, customer_name="Vikram Singh", customer_email="vikram@distributor.in", status="in_transit", origin_address={"city": "Mumbai", "state": "Maharashtra"}, destination_address={"city": "Noida", "state": "Uttar Pradesh"}),
            ]
            db.add_all(shipments)
            db.flush()

            tracking_events = [
                ShipmentTrackingEvent(shipment_id=1, status="preparing", location="Mumbai Warehouse", description="Shipment packed", event_time=datetime.now() - timedelta(days=61), source="manual"),
                ShipmentTrackingEvent(shipment_id=1, status="picked_up", location="Mumbai", description="Picked up by BlueDart", event_time=datetime.now() - timedelta(days=60), source="manual"),
                ShipmentTrackingEvent(shipment_id=1, status="delivered", location="Mumbai", description="Delivered to Santosh Kumar", event_time=datetime.now() - timedelta(days=58), source="manual"),
                ShipmentTrackingEvent(shipment_id=2, status="preparing", location="Mumbai Warehouse", description="Servers packed for shipping", event_time=datetime.now() - timedelta(days=2), source="manual"),
                ShipmentTrackingEvent(shipment_id=2, status="picked_up", location="Mumbai", description="Picked up by DTDC", event_time=datetime.now() - timedelta(days=1), source="manual"),
                ShipmentTrackingEvent(shipment_id=2, status="in_transit", location="Delhi Hub", description="In transit to Noida", event_time=datetime.now() - timedelta(hours=6), source="manual"),
            ]
            db.add_all(tracking_events)
            db.flush()
            print("  ✓ Shipments & tracking events created")

        # ── Replacements ────────────────────────────────────────────────
        if db.query(Replacement).count() == 0:
            replacements = [
                Replacement(replacement_number="REP-2026-0001", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", ticket_id="TKT-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", replacement_type="advance", faulty_asset_uid="RENTR-LP-2026-00001", faulty_reason="Overheating", fault_description="Fan malfunction causing thermal shutdown", status="initiated", initiated_by="Rahul Mehta", notes="Advance replacement approved due to severity of issue"),
            ]
            db.add_all(replacements)
            db.flush()
            print("  ✓ Replacements created")

        # ── Security Deposits ───────────────────────────────────────────
        if db.query(SecurityDeposit).count() == 0:
            deposits = [
                SecurityDeposit(deposit_number="DEP-2026-0001", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", amount=51800, payment_method="bank_transfer", transaction_id="NEFT-DEP-001", status="received", received_date=today - timedelta(days=62)),
                SecurityDeposit(deposit_number="DEP-2026-0002", order_id="ORD-2026-0002", contract_id="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in", amount=108000, payment_method="bank_transfer", transaction_id="NEFT-DEP-002", status="received", received_date=today - timedelta(days=32)),
                SecurityDeposit(deposit_number="DEP-2026-0003", order_id="ORD-2026-0005", contract_id="CTR-2026-0005", customer_name="Rajesh Nair", customer_email="rajesh@infrabuild.in", amount=115000, payment_method="bank_transfer", transaction_id="NEFT-DEP-003", status="received", received_date=today - timedelta(days=47)),
            ]
            db.add_all(deposits)
            db.flush()
            print("  ✓ Security deposits created")

        # ── Credit Notes ────────────────────────────────────────────────
        if db.query(CreditNote).count() == 0:
            cns = [
                CreditNote(cn_number="CN-2026-0001", note_type="credit", order_id="ORD-2026-0002", invoice_id="INV-2026-0005", customer_name="Anita Desai", customer_email="anita@startuplab.in", reason="Partial payment adjustment", items=[{"description": "Credit for partial payment received", "amount": 33720}], subtotal=33720, tax=0, total=33720, status="applied", applied_to_invoice="INV-2026-0005"),
            ]
            db.add_all(cns)
            db.flush()
            print("  ✓ Credit notes created")

        # ── Distributor Users & Data ────────────────────────────────────
        if db.query(DistributorUser).count() == 0:
            dist_users = [
                DistributorUser(
                    email="vikram@digidistribute.in", name="Vikram Singh", phone="+919812345678",
                    company_name="DigiDistribute", gstin="07AAECV9012H1ZQ", pan="AAECV9012H",
                    password_hash=hash_password("dist123"), is_active=True,
                    partner_email="vikram@distributor.in",
                    commission_rate=12.0, credit_limit=500000, credit_used=56640,
                ),
                DistributorUser(
                    email="rajesh@infrabuild.in", name="Rajesh Nair", phone="+919845123456",
                    company_name="InfraBuild Tech", gstin="32AAHCI7890L1ZS", pan="AAHCI7890L",
                    password_hash=hash_password("dist123"), is_active=True,
                    partner_email="rajesh@infrabuild.in",
                    commission_rate=10.0, credit_limit=750000, credit_used=67850,
                ),
            ]
            db.add_all(dist_users)
            db.flush()

            # Distributor customers
            dist_customers = [
                DistributorCustomer(distributor_id=1, email="acme@corp.in", name="Acme Corp", phone="+919900110011", company_name="Acme Corporation", gstin="07AABCA1234D1ZP", kyc_status="approved", is_active=True),
                DistributorCustomer(distributor_id=1, email="beta@tech.in", name="Beta Technologies", phone="+919900220022", company_name="Beta Tech Pvt Ltd", gstin="07AABCB5678E1ZQ", kyc_status="approved", is_active=True),
                DistributorCustomer(distributor_id=2, email="gamma@build.in", name="Gamma Builders", phone="+919900330033", company_name="Gamma Construction", gstin="32AABCG9012F1ZR", kyc_status="pending", is_active=True),
            ]
            db.add_all(dist_customers)
            db.flush()

            # Distributor orders
            dist_orders = [
                DistributorOrder(distributor_id=1, customer_id=1, order_number="DIST-ORD-2026-0001", customer_name="Acme Corp", customer_email="acme@corp.in", items=[{"product_name": "Dell Latitude 5540", "quantity": 10, "price_per_month": 4000}], total_monthly=40000, rentr_monthly=35000, spread=5000, rental_months=12, status="active", shipping_address={"city": "Delhi", "state": "Delhi"}),
                DistributorOrder(distributor_id=1, customer_id=2, order_number="DIST-ORD-2026-0002", customer_name="Beta Technologies", customer_email="beta@tech.in", items=[{"product_name": "HP ProDesk 400 G9", "quantity": 5, "price_per_month": 3200}], total_monthly=16000, rentr_monthly=14000, spread=2000, rental_months=12, status="active", shipping_address={"city": "Noida", "state": "UP"}),
                DistributorOrder(distributor_id=2, customer_id=3, order_number="DIST-ORD-2026-0003", customer_name="Gamma Builders", customer_email="gamma@build.in", items=[{"product_name": "Lenovo ThinkStation P360", "quantity": 3, "price_per_month": 7000}], total_monthly=21000, rentr_monthly=18000, spread=3000, rental_months=18, status="confirmed", shipping_address={"city": "Kochi", "state": "Kerala"}),
            ]
            db.add_all(dist_orders)
            db.flush()

            # Distributor contracts
            dist_contracts = [
                DistributorContract(distributor_id=1, customer_id=1, order_id=1, contract_number="DIST-CON-2026-0001", customer_name="Acme Corp", customer_email="acme@corp.in", type="rental", start_date=today - timedelta(days=30), end_date=today + timedelta(days=335), status="active", signed_at=datetime.now() - timedelta(days=28)),
                DistributorContract(distributor_id=1, customer_id=2, order_id=2, contract_number="DIST-CON-2026-0002", customer_name="Beta Technologies", customer_email="beta@tech.in", type="rental", start_date=today - timedelta(days=15), end_date=today + timedelta(days=350), status="active", signed_at=datetime.now() - timedelta(days=14)),
            ]
            db.add_all(dist_contracts)
            db.flush()

            # Distributor invoices
            dist_invoices = [
                DistributorInvoice(distributor_id=1, customer_id=1, contract_id=1, order_id=1, invoice_number="DIST-INV-2026-0001", customer_name="Acme Corp", customer_email="acme@corp.in", items=[{"description": "Monthly rental - Apr 2026", "quantity": 1, "unit_price": 40000}], subtotal=40000, tax=7200, total=47200, status="paid", due_date=today - timedelta(days=10), paid_date=today - timedelta(days=8)),
                DistributorInvoice(distributor_id=1, customer_id=2, contract_id=2, order_id=2, invoice_number="DIST-INV-2026-0002", customer_name="Beta Technologies", customer_email="beta@tech.in", items=[{"description": "Monthly rental - Apr 2026", "quantity": 1, "unit_price": 16000}], subtotal=16000, tax=2880, total=18880, status="sent", due_date=today + timedelta(days=5)),
            ]
            db.add_all(dist_invoices)
            db.flush()
            print("  ✓ Distributor users, customers, orders, contracts & invoices created")

        db.commit()
        print("\n✅ Seed data complete! All entities populated with comprehensive interlinked data.")
        print("\nAdmin login: admin@rentr.in / admin123")
        print("Customer login: santosh@techcorp.in / customer123")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding Rentr Admin database...\n")
    seed()
