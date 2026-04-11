import logging
import os
import uuid
from datetime import datetime

from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

from app.models.models import Contract, Order
from app.services.contract_pdf import generate_contract_pdf

logger = logging.getLogger(__name__)


def _generate_contract_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"CTR-{year}-"
    last = (
        db.query(Contract)
        .filter(Contract.contract_number.like(f"{prefix}%"))
        .order_by(Contract.contract_number.desc())
        .first()
    )
    if last:
        seq = int(last.contract_number.split("-")[-1]) + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"


def create_contract_for_order(db: Session, order: Order) -> Contract:
    """Auto-create a contract with PDF when an order is placed."""

    now = datetime.utcnow()
    start_date = now.date()
    end_date = start_date + relativedelta(months=order.rental_months)

    contract_number = _generate_contract_number(db)

    contract = Contract(
        contract_number=contract_number,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        order_id=order.order_number,
        type="rental",
        start_date=start_date,
        end_date=end_date,
        terms="Auto-generated rental agreement. See attached PDF for full terms.",
        status="pending_signature",
        signing_token=str(uuid.uuid4()),
    )
    db.add(contract)
    db.flush()  # get ID before PDF generation

    # Resolve media root relative to the admin-api directory
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    media_root = os.path.join(base_dir, "media")

    document_url = generate_contract_pdf(contract, order, media_root=media_root)
    contract.document_url = document_url

    db.commit()
    db.refresh(contract)

    logger.info(
        "Auto-created contract %s for order %s",
        contract.contract_number,
        order.order_number,
    )
    return contract
