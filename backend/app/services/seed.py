"""
Seed script to populate the database with sample categories and products.
Run with: python -m app.services.seed
"""

from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.models.product import Category, Product
from app.models.user import User, SearchHistory  # noqa: F401 - ensure tables are created
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.cart import Cart, CartItem  # noqa: F401


CATEGORIES = [
    {"name": "Servers", "slug": "servers", "parent_id": None},
    {"name": "Laptops", "slug": "laptops", "parent_id": None},
    {"name": "Desktops", "slug": "desktops", "parent_id": None},
    {"name": "Storage", "slug": "storage", "parent_id": None},
    {"name": "Network", "slug": "network", "parent_id": None},
    {"name": "Chassis", "slug": "chassis", "parent_id": None},
    {"name": "Accessories", "slug": "accessories", "parent_id": None},
    # Subcategories
    {"name": "Tower Servers", "slug": "tower-servers", "parent_slug": "servers"},
    {"name": "Rack Servers", "slug": "rack-servers", "parent_slug": "servers"},
    {"name": "Business Laptops", "slug": "business-laptops", "parent_slug": "laptops"},
    {"name": "Workstation Laptops", "slug": "workstation-laptops", "parent_slug": "laptops"},
    {"name": "SAN Storage", "slug": "san-storage", "parent_slug": "storage"},
    {"name": "NAS Storage", "slug": "nas-storage", "parent_slug": "storage"},
    {"name": "Switches", "slug": "switches", "parent_slug": "network"},
    {"name": "Routers", "slug": "routers", "parent_slug": "network"},
]


PRODUCTS = [
    {
        "name": "Dell PowerEdge T30 Mini Tower Server",
        "slug": "dell-poweredge-t30-mini-tower-server",
        "category": "Servers",
        "subcategory": "Tower Servers",
        "brand": "Dell",
        "description": "The Dell PowerEdge T30 is a powerful mini tower server ideal for small businesses. Features Intel Xeon E3-1225 v5 processor, 8GB RAM, and 1TB HDD. Perfect for file sharing, mail hosting, and basic business applications.",
        "specs": {
            "processor": "Intel Xeon E3-1225 v5 3.3GHz",
            "ram": "8GB DDR4 ECC",
            "storage": "1TB 7.2K RPM SATA HDD",
            "form_factor": "Mini Tower",
            "os": "No OS (Optional Windows Server)",
            "warranty": "3 Year Basic Hardware Warranty",
        },
        "price_per_month": 3000,
        "image_url": "/images/products/dell-poweredge-t30.jpg",
        "is_featured": True,
    },
    {
        "name": "Dell PowerEdge T40 Tower Server",
        "slug": "dell-poweredge-t40-tower-server",
        "category": "Servers",
        "subcategory": "Tower Servers",
        "brand": "Dell",
        "description": "Dell PowerEdge T40 tower server with Intel Xeon E-2224G processor. Ideal for growing businesses requiring reliable compute and storage capabilities.",
        "specs": {
            "processor": "Intel Xeon E-2224G 3.5GHz",
            "ram": "8GB DDR4 ECC UDIMM",
            "storage": "1TB 7.2K RPM SATA HDD",
            "form_factor": "Tower",
            "ports": "4x USB 3.1, 2x USB 2.0, 1x VGA, 1x DisplayPort",
        },
        "price_per_month": 3500,
        "image_url": "/images/products/dell-poweredge-t40.jpg",
        "is_featured": True,
    },
    {
        "name": "HP ProLiant ML30 Gen10 Plus Tower Server",
        "slug": "hp-proliant-ml30-gen10-plus-tower-server",
        "category": "Servers",
        "subcategory": "Tower Servers",
        "brand": "HP",
        "description": "HP ProLiant ML30 Gen10 Plus is an affordable, compact, and easy-to-manage tower server. Built for small offices and growing businesses with Intel Xeon E-2300 series processors.",
        "specs": {
            "processor": "Intel Xeon E-2314 2.8GHz",
            "ram": "16GB DDR4 ECC UDIMM",
            "storage": "1TB SATA HDD",
            "form_factor": "4U Tower",
            "networking": "1GbE",
            "power_supply": "350W",
        },
        "price_per_month": 4000,
        "image_url": "/images/products/hp-proliant-ml30-gen10.jpg",
        "is_featured": True,
    },
    {
        "name": "HP ProLiant DL380 Gen10 Rack Server",
        "slug": "hp-proliant-dl380-gen10-rack-server",
        "category": "Servers",
        "subcategory": "Rack Servers",
        "brand": "HP",
        "description": "The industry-leading HP ProLiant DL380 Gen10 is securely designed to reduce costs and complexity. Versatile for a variety of workloads from containers to AI/ML.",
        "specs": {
            "processor": "2x Intel Xeon Silver 4214R 2.4GHz",
            "ram": "32GB DDR4 Registered",
            "storage": "2x 600GB SAS 10K",
            "form_factor": "2U Rack",
            "networking": "4x 1GbE",
            "power_supply": "2x 500W Redundant",
        },
        "price_per_month": 8500,
        "image_url": "/images/products/hp-proliant-dl380-gen10.jpg",
        "is_featured": True,
    },
    {
        "name": "Dell PowerEdge R740 Rack Server",
        "slug": "dell-poweredge-r740-rack-server",
        "category": "Servers",
        "subcategory": "Rack Servers",
        "brand": "Dell",
        "description": "Dell PowerEdge R740 is a 2U, 2-socket rack server designed for complex workloads using highly scalable memory, I/O, and network options.",
        "specs": {
            "processor": "2x Intel Xeon Silver 4210R 2.4GHz",
            "ram": "64GB DDR4 Registered",
            "storage": "2x 480GB SSD + 4x 1.2TB SAS",
            "form_factor": "2U Rack",
            "networking": "4x 1GbE + 2x 10GbE SFP+",
            "power_supply": "2x 750W Redundant",
        },
        "price_per_month": 12000,
        "image_url": "/images/products/dell-poweredge-r740.jpg",
        "is_featured": True,
    },
    {
        "name": "Lenovo ThinkPad E14 Gen 5 Laptop",
        "slug": "lenovo-thinkpad-e14-gen5-laptop",
        "category": "Laptops",
        "subcategory": "Business Laptops",
        "brand": "Lenovo",
        "description": "Lenovo ThinkPad E14 Gen 5 business laptop with 13th Gen Intel Core processor. Durable, lightweight, and designed for everyday business use.",
        "specs": {
            "processor": "Intel Core i5-1335U",
            "ram": "16GB DDR5",
            "storage": "512GB NVMe SSD",
            "display": "14-inch FHD IPS",
            "battery": "Up to 12 hours",
            "weight": "1.59 kg",
        },
        "price_per_month": 2500,
        "image_url": "/images/products/lenovo-thinkpad-e14.jpg",
        "is_featured": True,
    },
    {
        "name": "Dell Latitude 5540 Business Laptop",
        "slug": "dell-latitude-5540-business-laptop",
        "category": "Laptops",
        "subcategory": "Business Laptops",
        "brand": "Dell",
        "description": "Dell Latitude 5540 offers enterprise-level security and manageability in a sleek 15.6-inch form factor. Built for the modern mobile workforce.",
        "specs": {
            "processor": "Intel Core i7-1365U",
            "ram": "16GB DDR5",
            "storage": "512GB NVMe SSD",
            "display": "15.6-inch FHD",
            "battery": "Up to 10 hours",
            "weight": "1.66 kg",
        },
        "price_per_month": 3000,
        "image_url": "/images/products/dell-latitude-5540.jpg",
        "is_featured": False,
    },
    {
        "name": "HP EliteBook 840 G9 Laptop",
        "slug": "hp-elitebook-840-g9-laptop",
        "category": "Laptops",
        "subcategory": "Business Laptops",
        "brand": "HP",
        "description": "HP EliteBook 840 G9 is a premium business laptop featuring Intel vPro platform. Thin, light, and built with recycled materials for sustainability.",
        "specs": {
            "processor": "Intel Core i7-1265U",
            "ram": "16GB DDR5",
            "storage": "512GB NVMe SSD",
            "display": "14-inch WUXGA IPS",
            "battery": "Up to 14 hours",
            "weight": "1.36 kg",
        },
        "price_per_month": 3500,
        "image_url": "/images/products/hp-elitebook-840-g9.jpg",
        "is_featured": False,
    },
    {
        "name": "Dell OptiPlex 7010 Micro Desktop",
        "slug": "dell-optiplex-7010-micro-desktop",
        "category": "Desktops",
        "subcategory": None,
        "brand": "Dell",
        "description": "Dell OptiPlex 7010 Micro is an ultra-compact desktop built for modern workspaces. Powerful performance with a minimal footprint.",
        "specs": {
            "processor": "Intel Core i5-13500T",
            "ram": "16GB DDR5",
            "storage": "256GB NVMe SSD",
            "form_factor": "Micro (1.12L)",
            "ports": "USB-C, DisplayPort, HDMI, RJ-45",
        },
        "price_per_month": 2000,
        "image_url": "/images/products/dell-optiplex-7010.jpg",
        "is_featured": False,
    },
    {
        "name": "HP Z2 Tower G9 Workstation",
        "slug": "hp-z2-tower-g9-workstation",
        "category": "Desktops",
        "subcategory": None,
        "brand": "HP",
        "description": "HP Z2 Tower G9 entry workstation provides powerful performance for CAD, BIM, and content creation workflows at an accessible price point.",
        "specs": {
            "processor": "Intel Core i7-12700",
            "ram": "32GB DDR5 ECC",
            "storage": "512GB NVMe SSD + 1TB HDD",
            "graphics": "NVIDIA T1000 4GB",
            "form_factor": "Tower",
        },
        "price_per_month": 4500,
        "image_url": "/images/products/hp-z2-tower-g9.jpg",
        "is_featured": True,
    },
    {
        "name": "Synology DS920+ NAS",
        "slug": "synology-ds920-plus-nas",
        "category": "Storage",
        "subcategory": "NAS Storage",
        "brand": "Synology",
        "description": "Synology DS920+ is a 4-bay NAS designed for data management, file collaboration, and backup. Supports hardware-accelerated transcoding and SSD caching.",
        "specs": {
            "processor": "Intel Celeron J4125",
            "ram": "4GB DDR4 (expandable to 8GB)",
            "drive_bays": "4x 3.5-inch SATA",
            "m2_slots": "2x NVMe SSD",
            "networking": "2x 1GbE (Link Aggregation)",
            "max_capacity": "64TB (4x 16TB)",
        },
        "price_per_month": 2500,
        "image_url": "/images/products/synology-ds920-plus.jpg",
        "is_featured": False,
    },
    {
        "name": "Cisco Catalyst 9200 Switch",
        "slug": "cisco-catalyst-9200-switch",
        "category": "Network",
        "subcategory": "Switches",
        "brand": "Cisco",
        "description": "Cisco Catalyst 9200 series fixed switches are purpose-built for simplicity, offering enterprise-class Layer 2 and Layer 3 access.",
        "specs": {
            "ports": "24x 1GbE + 4x 10GbE SFP+",
            "switching_capacity": "128 Gbps",
            "poe_budget": "370W PoE+",
            "management": "Cisco DNA Center, CLI, SNMP",
            "stack_support": "Up to 8 switches",
        },
        "price_per_month": 5000,
        "image_url": "/images/products/cisco-catalyst-9200.jpg",
        "is_featured": False,
    },
    {
        "name": "Dell PowerEdge MX7000 Chassis",
        "slug": "dell-poweredge-mx7000-chassis",
        "category": "Chassis",
        "subcategory": None,
        "brand": "Dell",
        "description": "Dell PowerEdge MX7000 modular chassis designed for kinetic infrastructure. Enables disaggregated compute, storage, and networking for maximum flexibility.",
        "specs": {
            "form_factor": "7U Modular Chassis",
            "compute_slots": "8 single-width or 4 double-width",
            "networking": "Integrated 25GbE fabric",
            "power": "6x 3000W PSU (N+N redundancy)",
            "management": "OpenManage Enterprise Modular Edition",
        },
        "price_per_month": 25000,
        "image_url": "/images/products/dell-poweredge-mx7000.jpg",
        "is_featured": False,
    },
    {
        "name": "Logitech MK540 Wireless Keyboard and Mouse Combo",
        "slug": "logitech-mk540-wireless-keyboard-mouse-combo",
        "category": "Accessories",
        "subcategory": None,
        "brand": "Logitech",
        "description": "Logitech MK540 Advanced wireless keyboard and mouse combo. Comfortable, reliable, and built for all-day productivity.",
        "specs": {
            "connectivity": "2.4GHz Wireless (Unifying Receiver)",
            "keyboard_battery": "36 months",
            "mouse_battery": "18 months",
            "keyboard_layout": "Full-size with palm rest",
            "mouse_dpi": "1000 DPI",
        },
        "price_per_month": 200,
        "image_url": "/images/products/logitech-mk540.jpg",
        "is_featured": False,
    },
    {
        "name": "Dell UltraSharp U2723QE 4K Monitor",
        "slug": "dell-ultrasharp-u2723qe-4k-monitor",
        "category": "Accessories",
        "subcategory": None,
        "brand": "Dell",
        "description": "Dell UltraSharp 27-inch 4K USB-C Hub monitor. IPS Black technology for deeper blacks and wider contrast ratio. Built-in KVM switch and RJ45 ethernet.",
        "specs": {
            "size": "27 inches",
            "resolution": "3840x2160 (4K UHD)",
            "panel": "IPS Black",
            "connectivity": "USB-C 90W PD, HDMI, DP, USB Hub, RJ45",
            "color_accuracy": "98% DCI-P3",
            "refresh_rate": "60Hz",
        },
        "price_per_month": 1500,
        "image_url": "/images/products/dell-u2723qe.jpg",
        "is_featured": True,
    },
]


def seed_database(db: Session) -> None:
    """Seed categories and products into the database."""
    # Check if data already exists
    existing_categories = db.query(Category).count()
    if existing_categories > 0:
        print("Database already seeded. Skipping.")
        return

    print("Seeding categories...")
    category_map: dict[str, int] = {}

    # Insert top-level categories first
    for cat_data in CATEGORIES:
        if "parent_slug" not in cat_data and cat_data.get("parent_id") is None:
            category = Category(
                name=cat_data["name"],
                slug=cat_data["slug"],
                parent_id=None,
            )
            db.add(category)
            db.flush()
            category_map[cat_data["slug"]] = category.id

    # Insert subcategories
    for cat_data in CATEGORIES:
        if "parent_slug" in cat_data:
            parent_id = category_map.get(cat_data["parent_slug"])
            category = Category(
                name=cat_data["name"],
                slug=cat_data["slug"],
                parent_id=parent_id,
            )
            db.add(category)
            db.flush()
            category_map[cat_data["slug"]] = category.id

    print(f"  Created {len(category_map)} categories.")

    print("Seeding products...")
    for prod_data in PRODUCTS:
        # Find the category id
        cat_slug = prod_data["category"].lower().replace(" ", "-") if prod_data.get("category") else None
        category_id = category_map.get(cat_slug) if cat_slug else None

        product = Product(
            name=prod_data["name"],
            slug=prod_data["slug"],
            category_id=category_id,
            category=prod_data.get("category"),
            subcategory=prod_data.get("subcategory"),
            brand=prod_data.get("brand"),
            description=prod_data.get("description"),
            specs=prod_data.get("specs"),
            price_per_month=prod_data["price_per_month"],
            image_url=prod_data.get("image_url"),
            is_featured=prod_data.get("is_featured", False),
        )
        db.add(product)

    db.commit()
    print(f"  Created {len(PRODUCTS)} products.")
    print("Seeding complete!")


def run():
    """Create tables and seed data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


if __name__ == "__main__":
    run()
