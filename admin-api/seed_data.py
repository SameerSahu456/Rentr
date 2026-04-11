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
    Customer,
    Invoice,
    KYCSubmission,
    Order,
    Payment,
    ReturnRequest,
    SupportTicket,
    TicketMessage,
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
        conn.commit()

    db = SessionLocal()

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
                    shipping_address={"firstName": "Vikram", "lastName": "Singh", "streetAddress1": "Sector 18, Noida", "city": "Noida", "countryArea": "Uttar Pradesh", "postalCode": "201301", "country": "India"},
                ),
                Order(
                    order_number="ORD-2026-0004", customer_id=4,
                    customer_name="Meera Patel", customer_email="meera@finserv.in", customer_type="customer",
                    items=[
                        {"product_name": "Dell OptiPlex 7010", "quantity": 20, "price_per_month": 2500},
                    ],
                    total_monthly=50000, rental_months=12, status="delivered",
                    shipping_address={"firstName": "Meera", "lastName": "Patel", "streetAddress1": "SG Highway", "city": "Ahmedabad", "countryArea": "Gujarat", "postalCode": "380015", "country": "India"},
                ),
                Order(
                    order_number="ORD-2025-0010", customer_id=1,
                    customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", customer_type="customer",
                    items=[{"product_name": "HP EliteBook 840 G8", "quantity": 2, "price_per_month": 3800}],
                    total_monthly=7600, rental_months=12, status="completed",
                    shipping_address={"firstName": "Santosh", "lastName": "Kumar", "streetAddress1": "Flat 302, Nensey Society", "city": "Mumbai", "countryArea": "Maharashtra", "postalCode": "400050", "country": "India"},
                ),
            ]
            db.add_all(orders)
            db.flush()
            print("  ✓ Orders created")

        # ── Contracts ───────────────────────────────────────────────────
        if db.query(Contract).count() == 0:
            today = date.today()
            contracts = [
                Contract(contract_number="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", order_id="ORD-2026-0001", type="rental", start_date=today - timedelta(days=60), end_date=today + timedelta(days=305), status="active", signed_at=datetime.now() - timedelta(days=60)),
                Contract(contract_number="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in", order_id="ORD-2026-0002", type="rental", start_date=today - timedelta(days=30), end_date=today + timedelta(days=700), status="active", signed_at=datetime.now() - timedelta(days=30)),
                Contract(contract_number="CTR-2026-0003", customer_name="Vikram Singh", customer_email="vikram@distributor.in", order_id="ORD-2026-0003", type="lease", start_date=today, end_date=today + timedelta(days=1095), status="pending_signature"),
                Contract(contract_number="CTR-2026-0004", customer_name="Meera Patel", customer_email="meera@finserv.in", order_id="ORD-2026-0004", type="rental", start_date=today - timedelta(days=15), end_date=today + timedelta(days=350), status="active", signed_at=datetime.now() - timedelta(days=15)),
                Contract(contract_number="CTR-2025-0010", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", order_id="ORD-2025-0010", type="rental", start_date=today - timedelta(days=400), end_date=today - timedelta(days=35), status="expired"),
            ]
            db.add_all(contracts)
            db.flush()
            print("  ✓ Contracts created")

        # ── Assets ──────────────────────────────────────────────────────
        if db.query(Asset).count() == 0:
            today = date.today()
            assets = [
                Asset(uid="RENTR-LP-2026-00001", category="LP", oem="Dell", model="Latitude 5540", specs="Intel i5-1345U, 16GB RAM, 512GB SSD", serial_number="DL5540-A001", acquisition_cost=72000, acquisition_date=today - timedelta(days=90), monthly_rate=3500, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", warranty_expiry=today + timedelta(days=900)),
                Asset(uid="RENTR-LP-2026-00002", category="LP", oem="Dell", model="Latitude 5540", specs="Intel i5-1345U, 16GB RAM, 512GB SSD", serial_number="DL5540-A002", acquisition_cost=72000, acquisition_date=today - timedelta(days=90), monthly_rate=3500, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-DT-2026-00001", category="DT", oem="HP", model="ProDesk 400 G9", specs="Intel i5-13500, 8GB RAM, 256GB SSD", serial_number="HP400-B001", acquisition_cost=48000, acquisition_date=today - timedelta(days=90), monthly_rate=2800, status="deployed", condition_grade="A", site="TechCorp Mumbai", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-LP-2026-00003", category="LP", oem="Lenovo", model="ThinkPad T14s", specs="AMD Ryzen 7 PRO 6850U, 16GB RAM, 512GB SSD", serial_number="LTP14S-C001", acquisition_cost=95000, acquisition_date=today - timedelta(days=45), monthly_rate=4200, status="deployed", condition_grade="A", site="StartupLab Bangalore", order_id="ORD-2026-0002", contract_id="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in"),
                Asset(uid="RENTR-SVR-2026-00001", category="SVR", oem="HPE", model="ProLiant DL360 Gen10", specs="Xeon Silver 4210R, 64GB RAM, 1.2TB SAS", serial_number="HPE360-D001", acquisition_cost=350000, acquisition_date=today - timedelta(days=30), monthly_rate=15000, status="staged", condition_grade="A", order_id="ORD-2026-0003", customer_name="Vikram Singh", customer_email="vikram@distributor.in"),
                Asset(uid="RENTR-SVR-2026-00002", category="SVR", oem="Dell", model="PowerEdge R740", specs="Xeon Gold 5218R, 128GB RAM, 2.4TB SAS", serial_number="DPE740-D002", acquisition_cost=520000, acquisition_date=today - timedelta(days=30), monthly_rate=18000, status="in_warehouse", condition_grade="A"),
                Asset(uid="RENTR-DT-2026-00002", category="DT", oem="Dell", model="OptiPlex 7010", specs="Intel i5-13500T, 16GB RAM, 512GB SSD", serial_number="DO7010-E001", acquisition_cost=55000, acquisition_date=today - timedelta(days=20), monthly_rate=2500, status="deployed", condition_grade="A", site="FinServ Ahmedabad", order_id="ORD-2026-0004", contract_id="CTR-2026-0004", customer_name="Meera Patel", customer_email="meera@finserv.in"),
                Asset(uid="RENTR-LP-2025-00010", category="LP", oem="HP", model="EliteBook 840 G8", specs="Intel i7-1165G7, 16GB RAM, 512GB SSD", serial_number="HPE840-F001", acquisition_cost=85000, acquisition_date=today - timedelta(days=450), monthly_rate=3800, status="in_warehouse", condition_grade="B", order_id="ORD-2025-0010", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in"),
                Asset(uid="RENTR-NW-2026-00001", category="NW", oem="Cisco", model="Catalyst 9200L", specs="24-port PoE+, 4x1G uplink", serial_number="CSC9200-G001", acquisition_cost=120000, acquisition_date=today - timedelta(days=60), monthly_rate=5000, status="in_warehouse", condition_grade="A"),
                Asset(uid="RENTR-GPU-2026-00001", category="GPU", oem="NVIDIA", model="A100 80GB", specs="PCIe, 80GB HBM2e", serial_number="NVA100-H001", acquisition_cost=800000, acquisition_date=today - timedelta(days=10), monthly_rate=35000, status="in_warehouse", condition_grade="A"),
            ]
            db.add_all(assets)
            db.flush()

            # Lifecycle events
            events = [
                AssetLifecycleEvent(asset_id=1, asset_uid="RENTR-LP-2026-00001", from_state=None, to_state="in_warehouse", triggered_by="System", notes="Asset acquired"),
                AssetLifecycleEvent(asset_id=1, asset_uid="RENTR-LP-2026-00001", from_state="in_warehouse", to_state="staged", triggered_by="admin@rentr.in", notes="Staged for ORD-2026-0001"),
                AssetLifecycleEvent(asset_id=1, asset_uid="RENTR-LP-2026-00001", from_state="staged", to_state="deployed", triggered_by="admin@rentr.in", notes="Deployed to TechCorp Mumbai"),
            ]
            db.add_all(events)
            db.flush()
            print("  ✓ Assets & lifecycle events created")

        # ── Invoices ────────────────────────────────────────────────────
        if db.query(Invoice).count() == 0:
            today = date.today()
            invoices = [
                Invoice(invoice_number="INV-2026-0001", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", items=[{"description": "Monthly rental - Apr 2026", "quantity": 1, "unit_price": 25900}], subtotal=25900, tax=4662, total=30562, status="paid", due_date=today - timedelta(days=20), paid_date=today - timedelta(days=18)),
                Invoice(invoice_number="INV-2026-0002", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", items=[{"description": "Monthly rental - May 2026", "quantity": 1, "unit_price": 25900}], subtotal=25900, tax=4662, total=30562, status="sent", due_date=today + timedelta(days=10)),
                Invoice(invoice_number="INV-2026-0003", order_id="ORD-2026-0002", contract_id="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in", items=[{"description": "Monthly rental - Apr 2026", "quantity": 1, "unit_price": 54000}], subtotal=54000, tax=9720, total=63720, status="paid", due_date=today - timedelta(days=15), paid_date=today - timedelta(days=13)),
                Invoice(invoice_number="INV-2026-0004", order_id="ORD-2026-0002", contract_id="CTR-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in", items=[{"description": "Monthly rental - May 2026", "quantity": 1, "unit_price": 54000}], subtotal=54000, tax=9720, total=63720, status="overdue", due_date=today - timedelta(days=5)),
                Invoice(invoice_number="INV-2026-0005", order_id="ORD-2026-0004", contract_id="CTR-2026-0004", customer_name="Meera Patel", customer_email="meera@finserv.in", items=[{"description": "Monthly rental - Apr 2026", "quantity": 1, "unit_price": 50000}], subtotal=50000, tax=9000, total=59000, status="draft", due_date=today + timedelta(days=20)),
                Invoice(invoice_number="INV-2026-0006", order_id="ORD-2026-0003", customer_name="Vikram Singh", customer_email="vikram@distributor.in", items=[{"description": "Setup & first month", "quantity": 1, "unit_price": 48000}], subtotal=48000, tax=8640, total=56640, status="sent", due_date=today + timedelta(days=15)),
            ]
            db.add_all(invoices)
            db.flush()
            print("  ✓ Invoices created")

        # ── Payments ────────────────────────────────────────────────────
        if db.query(Payment).count() == 0:
            payments = [
                Payment(invoice_id=1, amount=30562, method="bank_transfer", transaction_id="NEFT-20260320-001", status="completed", paid_at=datetime.now() - timedelta(days=18)),
                Payment(invoice_id=3, amount=63720, method="bank_transfer", transaction_id="NEFT-20260325-002", status="completed", paid_at=datetime.now() - timedelta(days=13)),
                Payment(invoice_id=4, amount=30000, method="bank_transfer", transaction_id="NEFT-20260405-003", status="completed", paid_at=datetime.now() - timedelta(days=3)),
            ]
            db.add_all(payments)
            db.flush()
            print("  ✓ Payments created")

        # ── Support Tickets ─────────────────────────────────────────────
        if db.query(SupportTicket).count() == 0:
            tickets = [
                SupportTicket(ticket_number="TKT-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", order_id="ORD-2026-0001", asset_uid="RENTR-LP-2026-00001", contract_id="CTR-2026-0001", subject="Laptop overheating issue", description="Dell Latitude 5540 (RENTR-LP-2026-00001) is overheating during heavy workloads. Fan runs at max speed constantly.", priority="high", status="in_progress", assigned_to="Rahul Mehta", category="Hardware"),
                SupportTicket(ticket_number="TKT-2026-0002", customer_name="Anita Desai", customer_email="anita@startuplab.in", order_id="ORD-2026-0002", subject="Need additional monitors", description="We need 5 more Dell UltraSharp monitors for new team members joining next week.", priority="medium", status="open", category="Request"),
                SupportTicket(ticket_number="TKT-2026-0003", customer_name="Meera Patel", customer_email="meera@finserv.in", order_id="ORD-2026-0004", invoice_id="INV-2026-0005", subject="Invoice billing query", description="The April invoice shows incorrect tax calculation. Please review INV-2026-0005.", priority="low", status="open", category="Billing"),
                SupportTicket(ticket_number="TKT-2026-0004", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", order_id="ORD-2025-0010", subject="Return request for completed order", description="Order ORD-2025-0010 has completed its tenure. Please initiate return pickup.", priority="medium", status="resolved", assigned_to="Priya Sharma", category="Returns"),
            ]
            db.add_all(tickets)
            db.flush()

            # Ticket messages
            msgs = [
                TicketMessage(ticket_id=1, sender="Santosh Kumar", sender_type="customer", message="The laptop started overheating 3 days ago. It shuts down during video calls."),
                TicketMessage(ticket_id=1, sender="Rahul Mehta", sender_type="agent", message="Thank you for reporting this. We'll schedule a technician visit. Can you confirm availability on Monday?"),
                TicketMessage(ticket_id=1, sender="Santosh Kumar", sender_type="customer", message="Yes, Monday works. Office hours 10am-6pm."),
                TicketMessage(ticket_id=4, sender="Priya Sharma", sender_type="agent", message="Return pickup has been scheduled for next Tuesday. Please keep the equipment ready."),
                TicketMessage(ticket_id=4, sender="System", sender_type="system", message="Return request RET-2026-0001 has been created for this ticket."),
            ]
            db.add_all(msgs)
            db.flush()
            print("  ✓ Support tickets & messages created")

        # ── Return Requests ─────────────────────────────────────────────
        if db.query(ReturnRequest).count() == 0:
            today = date.today()
            returns = [
                ReturnRequest(return_number="RET-2026-0001", order_id="ORD-2025-0010", contract_id="CTR-2025-0010", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", asset_uids=["RENTR-LP-2025-00010"], ticket_id="TKT-2026-0004", reason="contract_end", pickup_date=today + timedelta(days=5), pickup_time="10:00 AM - 12:00 PM", site="Flat 302, Nensey Society, Mumbai", data_wipe_requested=True, status="approved"),
                ReturnRequest(return_number="RET-2026-0002", order_id="ORD-2026-0001", contract_id="CTR-2026-0001", customer_name="Santosh Kumar", customer_email="santosh@techcorp.in", asset_uids=["RENTR-LP-2026-00001"], ticket_id="TKT-2026-0001", reason="faulty", pickup_date=today + timedelta(days=3), site="TechCorp Mumbai", data_wipe_requested=False, status="pending", special_instructions="Laptop has overheating issue. Handle with care."),
            ]
            db.add_all(returns)
            db.flush()
            print("  ✓ Return requests created")

        # ── KYC Submissions ─────────────────────────────────────────────
        if db.query(KYCSubmission).count() == 0:
            kyc = [
                KYCSubmission(customer_email="vikram@distributor.in", customer_name="Vikram Singh", company_name="DigiDistribute", account_type="channel_partner", gstin="07AAECV9012H1ZQ", pan="AAECV9012H", documents=[{"type": "gstin_cert", "filename": "gstin.pdf", "status": "verified"}, {"type": "pan_card", "filename": "pan.pdf", "status": "verified"}], status="approved", credit_limit=500000, reviewer="admin@rentr.in", review_notes="All documents verified. Approved as channel partner."),
                KYCSubmission(customer_email="meera@finserv.in", customer_name="Meera Patel", company_name="FinServ Solutions", account_type="direct_enterprise", gstin="24AAGCM3456K1ZR", pan="AAGCM3456K", documents=[{"type": "gstin_cert", "filename": "gstin.pdf", "status": "pending"}], status="under_review"),
            ]
            db.add_all(kyc)
            db.flush()
            print("  ✓ KYC submissions created")

        db.commit()
        print("\n✅ Seed data complete! All entities populated with interlinked sample data.")
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
