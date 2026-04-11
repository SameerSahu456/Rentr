import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import engine, Base


def _migrate_new_columns():
    """Add columns introduced after initial create_all."""
    from sqlalchemy import text, inspect
    with engine.connect() as conn:
        inspector = inspect(engine)

        def _add_col_if_missing(table, column, col_type="VARCHAR(100)"):
            cols = [c["name"] for c in inspector.get_columns(table)]
            if column not in cols:
                conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {column} {col_type}'))
                conn.execute(text(f'CREATE INDEX IF NOT EXISTS ix_{table}_{column} ON {table} ({column})'))

        # SupportTicket new cross-link columns
        _add_col_if_missing("support_tickets", "asset_uid")
        _add_col_if_missing("support_tickets", "contract_id")
        _add_col_if_missing("support_tickets", "invoice_id")
        _add_col_if_missing("support_tickets", "return_id")

        # Invoice new column
        _add_col_if_missing("invoices", "contract_id")

        # ReturnRequest new columns
        _add_col_if_missing("return_requests", "ticket_id")
        _add_col_if_missing("return_requests", "invoice_id")

        # Order new columns
        _add_col_if_missing("orders", "source", "VARCHAR(50) DEFAULT 'website'")
        _add_col_if_missing("orders", "crm_order_id")
        _add_col_if_missing("orders", "next_billing_date", "DATE")

        # Contract extension columns
        _add_col_if_missing("contracts", "original_end_date", "DATE")
        _add_col_if_missing("contracts", "extended_months", "INTEGER DEFAULT 0")

        # Order: sales_order_pdf for CRM orders
        _add_col_if_missing("orders", "sales_order_pdf", "VARCHAR(500)")

        # Rename 'distributor' to 'partner' in customer_type and role columns
        conn.execute(text("UPDATE orders SET customer_type = 'partner' WHERE customer_type = 'distributor'"))
        conn.execute(text("UPDATE customers SET role = 'partner' WHERE role = 'distributor'"))

        # Order: delivery tracking & billing fields
        _add_col_if_missing("orders", "delivery_status", "VARCHAR(50) DEFAULT 'pending'")
        _add_col_if_missing("orders", "delivered_at", "TIMESTAMP WITH TIME ZONE")
        _add_col_if_missing("orders", "delivery_confirmed_by", "VARCHAR(255)")
        _add_col_if_missing("orders", "billing_start_date", "DATE")
        _add_col_if_missing("orders", "billing_end_date", "DATE")
        _add_col_if_missing("orders", "billing_status", "VARCHAR(50) DEFAULT 'not_started'")
        _add_col_if_missing("orders", "proforma_invoice_number", "VARCHAR(100)")
        _add_col_if_missing("orders", "delivery_challan_number", "VARCHAR(100)")

        conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrate_new_columns()
    # Start background reminder checker (runs every hour)
    from app.services.reminder_checker import reminder_background_loop
    task = asyncio.create_task(reminder_background_loop())
    yield
    task.cancel()


app = FastAPI(title="Rentr Admin API", lifespan=lifespan)

# CORS: allow all origins dynamically. We use allow_origin_regex to match
# localhost, Vercel previews, ngrok tunnels, and any future deployment domains.
# The API is protected by JWT auth so open CORS is safe.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers after app is created to avoid circular imports
from app.api.routes import router as api_router  # noqa: E402

app.include_router(api_router, prefix="/api")

# Serve contract PDFs and other media files
_media_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media")
os.makedirs(_media_dir, exist_ok=True)
app.mount("/media", StaticFiles(directory=_media_dir), name="media")
