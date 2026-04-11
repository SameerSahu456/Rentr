"""
Rentr RMS — Comprehensive Seed Data
Creates interconnected data across ALL modules.
Run: cd backend && source venv/bin/activate && python seed_data.py
"""

import random
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.product import Product, Category
from app.models.order import Order, OrderItem
from app.models.rental import (
    Customer, KYC, Asset, AssetLifecycleEvent, Contract, ContractTimeline,
    ContractReminder, ContractAnnexure, Invoice, Payment, Return,
    SupportTicket, TicketMessage, Shipment, DeliveryChallan, Replacement,
    Notification, AuditTrail, BillingRun,
)

now = datetime.now(timezone.utc)


def d(days_ago):
    return now - timedelta(days=days_ago)


def main():
    # Reset all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed(db)
        db.commit()
        print("Seed data created successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


def seed(db):
    # ── 1. USERS ──────────────────────────────────────────────────
    print("Creating users...")
    users = {}
    user_data = [
        ("admin@rentr.in", "Sameer Sahu", "admin", True),
        ("ops@rentr.in", "Rahul Sharma", "ops_manager", True),
        ("service@rentr.in", "Priya Patel", "service_manager", True),
        ("finance@rentr.in", "Ankit Verma", "finance", True),
        ("agent1@rentr.in", "Deepak Kumar", "agent", True),
        ("agent2@rentr.in", "Neha Singh", "agent", True),
        # Partners
        ("raj@techserve.in", "Raj Malhotra", "partner", True),
        ("ananya@cloudrental.in", "Ananya Iyer", "partner", True),
        ("vikram@infratech.in", "Vikram Reddy", "partner", True),
        # Direct customers
        ("it@acmecorp.com", "Suresh Gupta", "customer", True),
        ("procurement@globalfinance.com", "Meera Krishnan", "customer", True),
        ("admin@startupxyz.com", "Arjun Nair", "customer", True),
        ("it@mediplus.in", "Kavitha Rao", "customer", True),
        ("infra@edutechpro.com", "Rohit Joshi", "customer", True),
    ]
    for email, name, role, active in user_data:
        u = User(
            email=email, full_name=name, password_hash=hash_password("Password@123"),
            role=role, is_active=active,
            company_name=email.split("@")[1].split(".")[0].title() + " Solutions",
            city=random.choice(["Mumbai", "Bangalore", "Delhi", "Hyderabad", "Pune", "Chennai"]),
        )
        db.add(u)
        db.flush()
        users[email] = u

    # ── 2. CUSTOMERS & PARTNERS ───────────────────────────────────
    print("Creating customers & partners...")
    customers = {}
    partner_data = [
        ("raj@techserve.in", "Raj Malhotra", "partner", "TechServe Solutions", "27AABCT1234F1ZP", "AABCT1234F", "gold"),
        ("ananya@cloudrental.in", "Ananya Iyer", "partner", "CloudRental India", "29BBCDR5678G2ZQ", "BBCDR5678G", "platinum"),
        ("vikram@infratech.in", "Vikram Reddy", "partner", "InfraTech Systems", "36CCDEI9012H3ZR", "CCDEI9012H", "silver"),
    ]
    direct_data = [
        ("it@acmecorp.com", "Suresh Gupta", "direct", "Acme Corporation", "07DDEFJ3456I4ZS", "DDEFJ3456I", None),
        ("procurement@globalfinance.com", "Meera Krishnan", "direct", "Global Finance Ltd", "06EEFGK7890J5ZT", "EEFGK7890J", None),
        ("admin@startupxyz.com", "Arjun Nair", "direct", "StartupXYZ", "32FFGHL1234K6ZU", "FFGHL1234K", None),
        ("it@mediplus.in", "Kavitha Rao", "direct", "MediPlus Healthcare", "33GGHIM5678L7ZV", "GGHIM5678L", None),
        ("infra@edutechpro.com", "Rohit Joshi", "direct", "EduTech Pro", "29HHIJN9012M8ZW", "HHIJN9012M", None),
    ]
    for email, name, ctype, company, gstin, pan, tier in partner_data + direct_data:
        c = Customer(
            email=email, name=name, customer_type=ctype, company_name=company,
            gstin=gstin, pan=pan, tier=tier,
            kyc_status="approved" if ctype == "partner" else random.choice(["approved", "approved", "pending"]),
            credit_limit=random.choice([500000, 1000000, 2000000, 5000000]),
            credit_used=random.randint(100000, 800000),
            monthly_revenue=random.randint(200000, 2000000),
            outstanding=random.randint(50000, 500000),
            total_assets=random.randint(10, 150),
            open_tickets=random.randint(0, 5),
            created_at=d(random.randint(60, 365)),
        )
        db.add(c)
        db.flush()
        customers[email] = c

    # ── 3. KYC RECORDS ────────────────────────────────────────────
    print("Creating KYC records...")
    kyc_records = {}
    for email, cust in customers.items():
        status = "approved" if cust.customer_type == "partner" else random.choice(["approved", "approved", "pending", "under_review"])
        k = KYC(
            customer_id=cust.id,
            customer_email=email, customer_name=cust.name, company_name=cust.company_name,
            account_type=cust.customer_type, gstin=cust.gstin, pan=cust.pan,
            status=status,
            credit_limit=cust.credit_limit, credit_used=cust.credit_used,
            credit_available=cust.credit_limit - cust.credit_used,
            documents=[
                {"type": "gst_certificate", "filename": f"{cust.company_name}_GST.pdf", "status": "verified"},
                {"type": "pan_card", "filename": f"{cust.company_name}_PAN.pdf", "status": "verified"},
                {"type": "bank_statement", "filename": f"{cust.company_name}_Bank.pdf", "status": "verified" if status == "approved" else "pending"},
            ],
            reviewer="admin@rentr.in" if status == "approved" else None,
            review_notes="KYC verified and approved" if status == "approved" else None,
            reviewed_at=d(30) if status == "approved" else None,
            created_at=d(random.randint(60, 300)),
        )
        db.add(k)
        db.flush()
        kyc_records[email] = k

    # ── 4. CATEGORIES & PRODUCTS ──────────────────────────────────
    print("Creating categories & products...")
    cats = {}
    for cat_name, slug in [("Laptops", "laptops"), ("Servers", "servers"), ("Desktops", "desktops"),
                            ("Networking", "networking"), ("GPU Servers", "gpu-servers"), ("Workstations", "workstations")]:
        c = Category(name=cat_name, slug=slug)
        db.add(c)
        db.flush()
        cats[slug] = c

    products = []
    product_data = [
        ("Dell Latitude 5540", "dell-latitude-5540", "laptops", "Dell", 3500, {"cpu": "i5-1345U", "ram": "16GB", "storage": "512GB SSD", "display": "15.6 FHD"}),
        ("Dell Latitude 7440", "dell-latitude-7440", "laptops", "Dell", 5200, {"cpu": "i7-1365U", "ram": "16GB", "storage": "512GB SSD", "display": "14 FHD"}),
        ("HP ProBook 450 G10", "hp-probook-450-g10", "laptops", "HP", 3200, {"cpu": "i5-1335U", "ram": "8GB", "storage": "256GB SSD", "display": "15.6 FHD"}),
        ("HP EliteBook 840 G10", "hp-elitebook-840-g10", "laptops", "HP", 5800, {"cpu": "i7-1365U", "ram": "16GB", "storage": "512GB SSD", "display": "14 FHD"}),
        ("Lenovo ThinkPad T14s Gen 4", "lenovo-thinkpad-t14s-g4", "laptops", "Lenovo", 5500, {"cpu": "i7-1360P", "ram": "16GB", "storage": "512GB SSD", "display": "14 WUXGA"}),
        ("Lenovo ThinkPad X1 Carbon Gen 11", "lenovo-x1-carbon-g11", "laptops", "Lenovo", 7500, {"cpu": "i7-1365U", "ram": "32GB", "storage": "1TB SSD", "display": "14 2.8K OLED"}),
        ("Dell PowerEdge R750", "dell-poweredge-r750", "servers", "Dell", 25000, {"cpu": "2x Xeon Gold 6338", "ram": "128GB", "storage": "4x 1.2TB SAS", "gpu": "None"}),
        ("HPE ProLiant DL380 Gen10+", "hpe-proliant-dl380-g10p", "servers", "HPE", 22000, {"cpu": "2x Xeon Silver 4314", "ram": "64GB", "storage": "8x 600GB SAS"}),
        ("Dell Precision 5820", "dell-precision-5820", "workstations", "Dell", 12000, {"cpu": "Xeon W-2255", "ram": "64GB", "storage": "1TB SSD", "gpu": "NVIDIA RTX A4000"}),
        ("HP Z4 G5", "hp-z4-g5", "workstations", "HP", 15000, {"cpu": "Xeon w3-2425", "ram": "64GB", "storage": "1TB SSD", "gpu": "NVIDIA RTX A5000"}),
        ("Dell OptiPlex 7010", "dell-optiplex-7010", "desktops", "Dell", 2200, {"cpu": "i5-13500", "ram": "8GB", "storage": "256GB SSD"}),
        ("HP EliteDesk 800 G9", "hp-elitedesk-800-g9", "desktops", "HP", 2800, {"cpu": "i7-12700", "ram": "16GB", "storage": "512GB SSD"}),
        ("NVIDIA DGX A100", "nvidia-dgx-a100", "gpu-servers", "NVIDIA", 150000, {"cpu": "2x AMD EPYC 7742", "ram": "1TB", "storage": "15TB NVMe", "gpu": "8x A100 80GB"}),
        ("Cisco Catalyst 9300", "cisco-catalyst-9300", "networking", "Cisco", 8000, {"ports": "48x 1GbE", "uplink": "4x 10GbE", "type": "L3 Switch"}),
        ("Aruba 6300M", "aruba-6300m", "networking", "Aruba", 6500, {"ports": "24x 1GbE", "uplink": "4x 25GbE", "type": "L3 Switch"}),
    ]
    for name, slug, cat_slug, brand, price, specs in product_data:
        p = Product(
            name=name, slug=slug, category_id=cats[cat_slug].id,
            category=cats[cat_slug].name, brand=brand, price_per_month=price,
            specs=specs, is_active=True, is_featured=random.choice([True, False]),
            description=f"Enterprise-grade {name} available for monthly rental.",
        )
        db.add(p)
        db.flush()
        products.append(p)

    # ── 5. ASSETS ─────────────────────────────────────────────────
    print("Creating assets...")
    cat_codes = {"laptops": "LP", "servers": "SVR", "desktops": "DT", "gpu-servers": "GPU",
                 "networking": "NW", "workstations": "WS"}
    asset_counter = {}
    assets_list = []
    customer_emails = list(customers.keys())

    statuses_deployed = ["deployed"] * 6 + ["in_warehouse"] * 2 + ["in_repair"] + ["staged"]
    for i in range(80):
        prod = random.choice(products)
        cat_slug = prod.slug.split("-")[0]
        for cs, code in cat_codes.items():
            if prod.category and cs in prod.category.lower():
                cat_code = code
                break
        else:
            cat_code = "LP"
        asset_counter[cat_code] = asset_counter.get(cat_code, 0) + 1
        uid = f"RENTR-{cat_code}-2026-{asset_counter[cat_code]:05d}"
        status = random.choice(statuses_deployed)
        cust_email = random.choice(customer_emails) if status == "deployed" else None
        grade = random.choice(["A", "A", "A", "B", "B", "C", "D"]) if status != "in_warehouse" else "A"

        a = Asset(
            uid=uid, oem=prod.brand, model=prod.name,
            category=cat_code, serial_number=f"SN{random.randint(100000, 999999)}",
            specs=prod.specs, acquisition_source=random.choice(["new", "nbfc_residual", "refurbished"]),
            acquisition_cost=prod.price_per_month * random.randint(20, 40),
            book_value=prod.price_per_month * random.randint(10, 25),
            status=status, condition_grade=grade,
            customer_email=cust_email, monthly_rate=prod.price_per_month,
            warranty_expiry=(now + timedelta(days=random.randint(30, 730))).date().isoformat(),
            data_wipe_status="not_requested",
            tags=random.choice([[], ["premium"], ["refurbished"], ["insured", "premium"]]),
            created_at=d(random.randint(30, 300)),
        )
        db.add(a)
        db.flush()
        assets_list.append(a)

        # Lifecycle events
        events = [
            ("registered", "in_warehouse", "Asset registered and labeled", d(random.randint(60, 300))),
        ]
        if status in ("deployed", "in_repair", "staged"):
            events.append(("in_warehouse", "staged", "Assigned to contract", d(random.randint(30, 59))))
            events.append(("staged", "in_transit", "Dispatched", d(random.randint(20, 29))))
            events.append(("in_transit", "deployed", "Delivery confirmed", d(random.randint(10, 19))))
        if status == "in_repair":
            events.append(("deployed", "in_repair", "Hardware fault reported", d(random.randint(1, 9))))

        for from_s, to_s, notes, ts in events:
            db.add(AssetLifecycleEvent(
                asset_id=a.id, from_state=from_s, to_state=to_s,
                notes=notes, user_email="ops@rentr.in", timestamp=ts,
            ))

    db.flush()
    deployed_assets = [a for a in assets_list if a.status == "deployed"]

    # ── 6. ORDERS ─────────────────────────────────────────────────
    print("Creating orders...")
    orders_list = []
    order_statuses = ["delivered", "delivered", "delivered", "active", "active", "processing", "shipped", "pending", "confirmed"]
    for i in range(25):
        cust_email = random.choice(customer_emails)
        cust = customers[cust_email]
        user = users[cust_email]
        status = random.choice(order_statuses)
        num_items = random.randint(1, 4)
        items_products = random.sample(products, min(num_items, len(products)))
        total = sum(p.price_per_month * random.randint(1, 3) for p in items_products)
        months = random.choice([3, 6, 12, 24, 36])

        o = Order(
            user_id=user.id, status=status, total_amount=total,
            rental_months=months,
            shipping_address={
                "line1": f"{random.randint(1, 999)}, {random.choice(['MG Road', 'Brigade Road', 'Park Street', 'Connaught Place', 'Banjara Hills'])}",
                "city": random.choice(["Mumbai", "Bangalore", "Delhi", "Hyderabad", "Pune"]),
                "state": random.choice(["Maharashtra", "Karnataka", "Delhi", "Telangana"]),
                "pincode": str(random.randint(100000, 999999)),
            },
            created_at=d(random.randint(5, 180)),
        )
        db.add(o)
        db.flush()

        for p in items_products:
            qty = random.randint(1, 3)
            db.add(OrderItem(order_id=o.id, product_id=p.id, quantity=qty, price_per_month=p.price_per_month))

        orders_list.append((o, cust))
    db.flush()

    # ── 7. CONTRACTS ──────────────────────────────────────────────
    print("Creating contracts...")
    contracts_list = []
    contract_statuses = ["active", "active", "active", "active", "expiring", "draft", "pending_signature", "expired"]
    for i, (order, cust) in enumerate(orders_list[:20]):
        status = random.choice(contract_statuses)
        start = d(random.randint(30, 300))
        end = start + timedelta(days=order.rental_months * 30)
        # Assign some deployed assets
        cust_assets = [a for a in deployed_assets if a.customer_email == cust.email]
        asset_uids = [a.uid for a in cust_assets[:random.randint(1, 5)]]

        c = Contract(
            contract_number=f"RENTR-CON-2026-{i+1:05d}",
            customer_id=cust.id,
            customer_name=cust.name, customer_email=cust.email,
            order_id=order.id, type="master_agreement" if i % 3 == 0 else "annexure",
            status=status, document_url=f"/docs/contracts/RENTR-CON-2026-{i+1:05d}.pdf",
            signed_at=start + timedelta(days=2) if status in ("active", "expiring", "expired") else None,
            start_date=start, end_date=end,
            assets=[{"uid": uid, "quantity": 1} for uid in asset_uids],
            created_at=start - timedelta(days=5),
        )
        db.add(c)
        db.flush()
        contracts_list.append(c)

        # Link assets to contract
        for a in cust_assets[:len(asset_uids)]:
            a.contract_id = c.id

        # Timeline events
        timeline_events = [
            ("contract_created", "Contract created from order", start - timedelta(days=5)),
            ("sent_for_signing", "Sent to customer for digital signature", start - timedelta(days=3)),
        ]
        if status in ("active", "expiring", "expired"):
            timeline_events.append(("signed", "Contract signed by both parties", start + timedelta(days=2)))
            timeline_events.append(("assets_dispatched", f"Assets dispatched: {', '.join(asset_uids[:3])}", start + timedelta(days=5)))
        for action, desc, ts in timeline_events:
            db.add(ContractTimeline(contract_id=c.id, action_type=action, description=desc, timestamp=ts))

        # Reminders for active/expiring contracts
        if status in ("active", "expiring"):
            db.add(ContractReminder(contract_id=c.id, days_before=90, reminder_type="renewal", channel="email", is_active=True))
            db.add(ContractReminder(contract_id=c.id, days_before=30, reminder_type="expiry", channel="email", is_active=True))

        # Annexure for some contracts
        if asset_uids and i % 2 == 0:
            db.add(ContractAnnexure(
                contract_id=c.id, type="addition", asset_uids=asset_uids,
                notes="Initial asset deployment", status="approved", created_at=start,
            ))

    db.flush()

    # ── 8. INVOICES & PAYMENTS ────────────────────────────────────
    print("Creating invoices & payments...")
    invoices_list = []
    inv_statuses = ["paid", "paid", "paid", "sent", "sent", "overdue", "draft"]
    for i, contract in enumerate(contracts_list):
        # 2-3 invoices per contract
        for j in range(random.randint(1, 3)):
            status = random.choice(inv_statuses)
            total = random.randint(15000, 500000)
            gst = round(total * 0.18, 2)
            due = d(random.randint(-30, 60))
            items = []
            cust_assets = [a for a in deployed_assets if a.customer_email == contract.customer_email]
            for a in cust_assets[:random.randint(1, 4)]:
                items.append({"asset_uid": a.uid, "description": f"{a.oem} {a.model}", "rate": float(a.monthly_rate or 0), "quantity": 1, "amount": float(a.monthly_rate or 0)})

            inv = Invoice(
                invoice_number=f"RENTR-INV-2026-{len(invoices_list)+1:05d}",
                customer_name=contract.customer_name, customer_email=contract.customer_email,
                contract_id=contract.id, items=items, total=total + gst, gst_amount=gst,
                status=status, due_date=due,
                created_at=due - timedelta(days=30),
            )
            db.add(inv)
            db.flush()
            invoices_list.append(inv)

            # Payments for paid invoices
            if status == "paid":
                db.add(Payment(
                    invoice_id=inv.id, invoice_number=inv.invoice_number,
                    amount=inv.total, method=random.choice(["bank_transfer", "upi", "cheque", "neft"]),
                    transaction_id=f"TXN{random.randint(100000000, 999999999)}",
                    status="completed", created_at=due + timedelta(days=random.randint(1, 15)),
                ))
            elif status == "sent" and random.random() > 0.5:
                # Partial payment
                partial = round(inv.total * random.uniform(0.3, 0.7), 2)
                db.add(Payment(
                    invoice_id=inv.id, invoice_number=inv.invoice_number,
                    amount=partial, method="bank_transfer",
                    transaction_id=f"TXN{random.randint(100000000, 999999999)}",
                    status="completed", created_at=due + timedelta(days=5),
                ))

    db.flush()

    # ── 9. RETURNS ────────────────────────────────────────────────
    print("Creating returns...")
    returns_list = []
    return_statuses = ["initiated", "pickup_scheduled", "in_transit", "received", "grn_completed", "closed"]
    for i in range(12):
        cust_email = random.choice(customer_emails)
        cust = customers[cust_email]
        cust_assets = [a for a in deployed_assets if a.customer_email == cust_email]
        if not cust_assets:
            continue
        return_assets = random.sample(cust_assets, min(random.randint(1, 3), len(cust_assets)))
        status = random.choice(return_statuses)

        r = Return(
            return_number=f"RENTR-RET-2026-{i+1:05d}",
            customer_name=cust.name, customer_email=cust_email,
            contract_id=contracts_list[i % len(contracts_list)].id if contracts_list else None,
            asset_uids=[a.uid for a in return_assets],
            reason=random.choice(["Contract ended", "Upgrade required", "Downsizing", "Asset replacement", "End of project"]),
            status=status,
            pickup_date=(now + timedelta(days=random.randint(1, 14))).date().isoformat() if status in ("pickup_scheduled", "in_transit") else None,
            grn_number=f"GRN-{random.randint(10000, 99999)}" if status in ("received", "grn_completed", "closed") else None,
            damage_charges=random.randint(0, 15000) if status in ("grn_completed", "closed") else 0,
            damage_report={"grade": random.choice(["A", "B", "C"]), "notes": "Minor wear and tear", "photos": []} if status in ("received", "grn_completed", "closed") else None,
            created_at=d(random.randint(5, 90)),
        )
        db.add(r)
        db.flush()
        returns_list.append(r)

    # ── 10. SUPPORT TICKETS ───────────────────────────────────────
    print("Creating support tickets...")
    tickets_list = []
    ticket_statuses = ["open", "open", "in_progress", "in_progress", "waiting", "resolved", "closed"]
    categories = ["hardware_failure", "software_issue", "performance", "physical_damage", "preventive_maintenance", "upgrade_request", "general_inquiry"]
    priorities = ["critical", "high", "medium", "medium", "low"]
    agents = ["agent1@rentr.in", "agent2@rentr.in", "service@rentr.in", "ops@rentr.in"]

    for i in range(20):
        cust_email = random.choice(customer_emails)
        cust = customers[cust_email]
        cust_assets = [a for a in deployed_assets if a.customer_email == cust_email]
        asset_uid = cust_assets[0].uid if cust_assets else None
        priority = random.choice(priorities)
        status = random.choice(ticket_statuses)
        sla_hours = {"critical": 4, "high": 8, "medium": 24, "low": 48}[priority]
        created = d(random.randint(1, 60))

        t = SupportTicket(
            ticket_number=f"RENTR-TKT-2026-{i+1:05d}",
            customer_name=cust.name, customer_email=cust_email,
            asset_uid=asset_uid,
            contract_id=contracts_list[i % len(contracts_list)].id if contracts_list else None,
            subject=random.choice([
                "Laptop not booting", "Server overheating", "Network switch port failure",
                "Keyboard not working", "Screen flickering", "Slow performance",
                "Blue screen errors", "Battery not charging", "USB ports not working",
                "Preventive maintenance request", "RAM upgrade needed", "SSD replacement",
                "Fan noise issue", "Touchpad not responding", "WiFi connectivity issues",
                "Display cracked", "Power supply failure", "BIOS update required",
                "Operating system crash", "Data backup assistance",
            ]),
            description="Customer reported an issue with the equipment. Requires immediate attention.",
            category=random.choice(categories),
            priority=priority,
            status=status,
            assigned_to=random.choice(agents),
            sla_deadline=created + timedelta(hours=sla_hours),
            sla_response_deadline=created + timedelta(hours=sla_hours // 2),
            created_at=created,
        )
        db.add(t)
        db.flush()
        tickets_list.append(t)

        # Messages
        messages = [
            (t.customer_name, "customer", "I'm experiencing this issue with the equipment. Please help.", created),
            (t.assigned_to.split("@")[0].title() if t.assigned_to else "Agent", "agent",
             "Thank you for reporting. We're looking into this right away.", created + timedelta(hours=1)),
        ]
        if status in ("in_progress", "resolved", "closed"):
            messages.append(("System", "system", "Ticket assigned to technician. SLA timer started.", created + timedelta(hours=2)))
            messages.append((t.assigned_to.split("@")[0].title() if t.assigned_to else "Agent", "agent",
                           "Diagnosis complete. Proceeding with resolution.", created + timedelta(hours=4)))
        if status in ("resolved", "closed"):
            messages.append((t.assigned_to.split("@")[0].title() if t.assigned_to else "Agent", "agent",
                           "Issue has been resolved. Please confirm if everything is working fine.", created + timedelta(days=1)))
        for sender, stype, msg, ts in messages:
            db.add(TicketMessage(ticket_id=t.id, message=msg, sender=sender, sender_type=stype, timestamp=ts))

    db.flush()

    # ── 11. SHIPMENTS ─────────────────────────────────────────────
    print("Creating shipments...")
    ship_statuses = ["delivered", "delivered", "delivered", "in_transit", "dispatched", "preparing", "out_for_delivery"]
    logistics = ["BlueDart", "DTDC", "Delhivery", "FedEx", "DHL", "Rentr Logistics"]
    for i, (order, cust) in enumerate(orders_list[:18]):
        status = random.choice(ship_statuses)
        created = order.created_at + timedelta(days=2)
        timeline = [
            {"status": "preparing", "timestamp": created.isoformat(), "description": "Shipment being prepared"},
            {"status": "dispatched", "timestamp": (created + timedelta(days=1)).isoformat(), "description": "Dispatched from warehouse"},
        ]
        if status in ("in_transit", "out_for_delivery", "delivered"):
            timeline.append({"status": "in_transit", "timestamp": (created + timedelta(days=2)).isoformat(), "description": "In transit"})
        if status in ("out_for_delivery", "delivered"):
            timeline.append({"status": "out_for_delivery", "timestamp": (created + timedelta(days=3)).isoformat(), "description": "Out for delivery"})
        if status == "delivered":
            timeline.append({"status": "delivered", "timestamp": (created + timedelta(days=4)).isoformat(), "description": "Delivered successfully"})

        db.add(Shipment(
            shipment_number=f"RENTR-SHP-2026-{i+1:05d}",
            order_id=order.id, shipment_type="outbound",
            logistics_partner=random.choice(logistics),
            tracking_number=f"TRK{random.randint(1000000000, 9999999999)}",
            customer_name=cust.name, status=status,
            estimated_delivery=(created + timedelta(days=5)).date().isoformat(),
            timeline=timeline, created_at=created,
        ))
    db.flush()

    # ── 12. DELIVERY CHALLANS ─────────────────────────────────────
    print("Creating delivery challans...")
    dc_statuses = ["delivered", "delivered", "dispatched", "generated", "draft"]
    for i, (order, cust) in enumerate(orders_list[:15]):
        cust_assets = [a for a in deployed_assets if a.customer_email == cust.email]
        items = []
        for a in cust_assets[:random.randint(1, 4)]:
            items.append({"uid": a.uid, "description": f"{a.oem} {a.model}", "quantity": 1, "value": float(a.monthly_rate or 0) * 12})

        db.add(DeliveryChallan(
            dc_number=f"RENTR-DC-2026-{i+1:05d}",
            order_id=order.id, challan_type=random.choice(["outward", "outward", "inward"]),
            customer_name=cust.name,
            total_value=sum(item["value"] for item in items) if items else 50000,
            transporter_name=random.choice(logistics),
            eway_bill_number=f"EWB{random.randint(100000000000, 999999999999)}" if random.random() > 0.3 else None,
            vehicle_number=f"{random.choice(['MH','KA','DL','TG','TN'])}{random.randint(1,99):02d}{random.choice('ABCDEFGH')}{random.choice('ABCDEFGH')}{random.randint(1000,9999)}",
            status=random.choice(dc_statuses),
            items=items, created_at=d(random.randint(5, 120)),
        ))
    db.flush()

    # ── 13. REPLACEMENTS ──────────────────────────────────────────
    print("Creating replacements...")
    rep_statuses = ["completed", "completed", "dispatched", "approved", "initiated"]
    for i in range(8):
        ticket = tickets_list[i % len(tickets_list)]
        faulty = deployed_assets[i % len(deployed_assets)] if deployed_assets else None
        warehouse_assets = [a for a in assets_list if a.status == "in_warehouse"]
        replacement = warehouse_assets[i % len(warehouse_assets)] if warehouse_assets else None
        status = random.choice(rep_statuses)

        timeline = [
            {"action": "initiated", "timestamp": d(random.randint(10, 30)).isoformat(), "description": "Replacement initiated from support ticket"},
            {"action": "approved", "timestamp": d(random.randint(8, 9)).isoformat(), "description": "Approved by service manager"},
        ]
        if status in ("dispatched", "completed"):
            timeline.append({"action": "dispatched", "timestamp": d(random.randint(5, 7)).isoformat(), "description": "Replacement asset dispatched"})
        if status == "completed":
            timeline.append({"action": "completed", "timestamp": d(random.randint(1, 4)).isoformat(), "description": "Replacement completed, faulty asset collected"})

        rep_type = "advance" if i % 3 == 0 else "standard"
        db.add(Replacement(
            replacement_number=f"RENTR-REP-2026-{i+1:05d}",
            replacement_type=rep_type,
            order_id=orders_list[i % len(orders_list)][0].id,
            customer_name=ticket.customer_name,
            ticket_id=ticket.id,
            faulty_asset_uid=faulty.uid if faulty else f"RENTR-LP-2026-{90+i:05d}",
            replacement_asset_uid=replacement.uid if replacement else f"RENTR-LP-2026-{80+i:05d}",
            faulty_reason=ticket.subject,
            status=status,
            damage_charges=random.randint(0, 10000) if status == "completed" else 0,
            timeline=timeline, created_at=d(random.randint(5, 45)),
        ))
    db.flush()

    # ── 14. NOTIFICATIONS ─────────────────────────────────────────
    print("Creating notifications...")
    admin_user = users["admin@rentr.in"]
    notif_types = [
        ("order", "New Order Received", "Order ORD-00001 placed by Acme Corporation for 5 laptops", 1),
        ("contract", "Contract Expiring Soon", "Contract RENTR-CON-2026-00003 expires in 30 days", 3),
        ("ticket", "Critical Ticket Opened", "High priority ticket RENTR-TKT-2026-00001 requires attention", 1),
        ("payment", "Payment Received", "Payment of ₹2,50,000 received from CloudRental India", 2),
        ("return", "Return Request", "Return initiated for 3 assets by TechServe Solutions", 4),
        ("kyc", "KYC Pending Review", "KYC for StartupXYZ requires approval", 5),
        ("asset", "Warranty Expiring", "15 assets have warranties expiring within 30 days", 7),
        ("invoice", "Overdue Invoice", "Invoice RENTR-INV-2026-00008 is 15 days overdue", 3),
        ("shipment", "Shipment Delivered", "Shipment RENTR-SHP-2026-00005 delivered successfully", 1),
        ("system", "Billing Run Completed", "Monthly billing run completed: 45 invoices generated", 1),
        ("contract", "Contract Signed", "Contract RENTR-CON-2026-00012 signed by Global Finance Ltd", 2),
        ("ticket", "SLA Breach Warning", "Ticket RENTR-TKT-2026-00007 approaching SLA deadline", 4),
    ]
    for ntype, title, desc, ref_id in notif_types:
        db.add(Notification(
            user_id=admin_user.id, type=ntype, title=title,
            description=desc, reference_id=str(ref_id),
            is_read=random.choice([True, True, False, False, False]),
            created_at=d(random.randint(0, 14)),
        ))
    db.flush()

    # ── 15. AUDIT TRAIL ───────────────────────────────────────────
    print("Creating audit trail...")
    audit_actions = [
        ("order", "1", "created", "admin@rentr.in", {"status": {"old": None, "new": "pending"}}),
        ("order", "1", "updated", "ops@rentr.in", {"status": {"old": "pending", "new": "confirmed"}}),
        ("contract", "1", "created", "admin@rentr.in", {"status": {"old": None, "new": "draft"}}),
        ("contract", "1", "updated", "admin@rentr.in", {"status": {"old": "draft", "new": "pending_signature"}}),
        ("contract", "1", "updated", "admin@rentr.in", {"status": {"old": "pending_signature", "new": "active"}}),
        ("asset", "1", "created", "ops@rentr.in", {"status": {"old": None, "new": "in_warehouse"}}),
        ("asset", "1", "updated", "ops@rentr.in", {"status": {"old": "in_warehouse", "new": "deployed"}}),
        ("invoice", "1", "created", "finance@rentr.in", {"status": {"old": None, "new": "draft"}}),
        ("invoice", "1", "updated", "finance@rentr.in", {"status": {"old": "draft", "new": "sent"}}),
        ("payment", "1", "created", "finance@rentr.in", {"amount": {"old": None, "new": "250000"}}),
        ("ticket", "1", "created", "agent1@rentr.in", {"priority": {"old": None, "new": "high"}}),
        ("ticket", "1", "updated", "service@rentr.in", {"status": {"old": "open", "new": "in_progress"}}),
        ("customer", "4", "updated", "admin@rentr.in", {"credit_limit": {"old": "500000", "new": "1000000"}}),
        ("kyc", "1", "updated", "admin@rentr.in", {"status": {"old": "pending", "new": "approved"}}),
        ("return", "1", "created", "ops@rentr.in", {"status": {"old": None, "new": "initiated"}}),
        ("shipment", "1", "updated", "ops@rentr.in", {"status": {"old": "dispatched", "new": "in_transit"}}),
        ("replacement", "1", "created", "service@rentr.in", {"type": {"old": None, "new": "advance"}}),
        ("user", "1", "updated", "admin@rentr.in", {"role": {"old": "agent", "new": "ops_manager"}}),
    ]
    for entity_type, entity_id, action, user_email, changes in audit_actions:
        db.add(AuditTrail(
            entity_type=entity_type, entity_id=entity_id, action=action,
            user_email=user_email, changes=changes,
            ip_address=f"192.168.1.{random.randint(10, 250)}",
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            request_id=f"req_{random.randint(100000, 999999)}",
            timestamp=d(random.randint(1, 90)),
        ))
    db.flush()

    # ── 16. BILLING RUNS ──────────────────────────────────────────
    print("Creating billing runs...")
    for i in range(6):
        run_date = d(i * 30)
        db.add(BillingRun(
            run_date=run_date, status="completed",
            total_invoices=random.randint(30, 60),
            total_amount=random.randint(5000000, 15000000),
            created_at=run_date,
        ))
    # One pending run
    db.add(BillingRun(run_date=now, status="pending", total_invoices=0, total_amount=0, created_at=now))
    db.flush()

    # ── 17. UPDATE DASHBOARD STATS ────────────────────────────────
    # Update customer aggregate fields based on created data
    for email, cust in customers.items():
        cust_assets_count = sum(1 for a in assets_list if a.customer_email == email)
        cust_tickets = sum(1 for t in tickets_list if t.customer_email == email and t.status in ("open", "in_progress"))
        cust.total_assets = cust_assets_count
        cust.open_tickets = cust_tickets

    db.flush()
    print(f"""
=== SEED DATA SUMMARY ===
Users:             {len(user_data)}
Customers/Partners: {len(customers)}
KYC Records:       {len(kyc_records)}
Products:          {len(products)}
Assets:            {len(assets_list)}
  - Deployed:      {len(deployed_assets)}
Orders:            {len(orders_list)}
Contracts:         {len(contracts_list)}
Invoices:          {len(invoices_list)}
Returns:           {len(returns_list)}
Support Tickets:   {len(tickets_list)}
Shipments:         18
Delivery Challans: 15
Replacements:      8
Notifications:     {len(notif_types)}
Audit Trail:       {len(audit_actions)}
Billing Runs:      7

Login: admin@rentr.in / Password@123
    """)


if __name__ == "__main__":
    main()
