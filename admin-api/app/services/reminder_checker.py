"""
Contract Expiry Reminder Checker

This module provides a background task that runs periodically to check for
contract reminders that are due and processes them. It runs on app startup
and checks every hour.
"""

import asyncio
import logging
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.models import Contract, ContractReminder, ContractReminderLog

logger = logging.getLogger(__name__)


def check_and_process_reminders():
    """Check for due reminders and create log entries for them."""
    db: Session = SessionLocal()
    try:
        today = date.today()

        # Find all active reminders that are due
        due_reminders = (
            db.query(ContractReminder)
            .filter(
                ContractReminder.is_active == True,
                ContractReminder.next_trigger_date != None,
                ContractReminder.next_trigger_date <= today,
            )
            .all()
        )

        if not due_reminders:
            return 0

        processed = 0
        for reminder in due_reminders:
            contract = db.query(Contract).filter(Contract.id == reminder.contract_id).first()
            if not contract or contract.status not in ("active", "pending_signature"):
                # Skip reminders for terminated/cancelled contracts
                reminder.is_active = False
                continue

            days_left = (contract.end_date - today).days if contract.end_date else 0

            message = (
                f"Dear {contract.customer_name},\n\n"
                f"This is a reminder that your rental contract {contract.contract_number} "
                f"is expiring on {contract.end_date}. "
                f"You have {days_left} days remaining.\n\n"
                f"Please contact us to renew or extend your contract.\n\n"
                f"Best regards,\nRentr Team"
            )

            # Create log entry
            log = ContractReminderLog(
                reminder_id=reminder.id,
                contract_id=contract.id,
                channel=reminder.channel,
                status="pending",
                recipient_email=contract.customer_email,
                message_preview=message[:500],
            )
            db.add(log)

            # Update reminder state
            reminder.last_sent_at = datetime.utcnow()

            # Set next trigger to None (one-shot) unless contract end date is far enough
            # for the same reminder to fire again (e.g., after extension)
            if contract.end_date:
                future_trigger = contract.end_date - timedelta(days=reminder.days_before)
                if future_trigger > today:
                    reminder.next_trigger_date = future_trigger
                else:
                    reminder.next_trigger_date = None
            else:
                reminder.next_trigger_date = None

            processed += 1

        db.commit()
        logger.info(f"Processed {processed} due contract reminders")
        return processed

    except Exception as e:
        logger.error(f"Error processing reminders: {e}")
        db.rollback()
        return 0
    finally:
        db.close()


def auto_expire_contracts():
    """Automatically expire contracts whose end_date has passed."""
    db: Session = SessionLocal()
    try:
        today = date.today()
        expired = (
            db.query(Contract)
            .filter(
                Contract.status == "active",
                Contract.end_date != None,
                Contract.end_date < today,
            )
            .all()
        )
        count = 0
        for contract in expired:
            contract.status = "expired"
            count += 1

        if count:
            db.commit()
            logger.info(f"Auto-expired {count} contracts")
        return count
    except Exception as e:
        logger.error(f"Error auto-expiring contracts: {e}")
        db.rollback()
        return 0
    finally:
        db.close()


async def reminder_background_loop():
    """Background loop that checks reminders every hour."""
    while True:
        try:
            auto_expire_contracts()
            check_and_process_reminders()
        except Exception as e:
            logger.error(f"Reminder loop error: {e}")
        await asyncio.sleep(3600)  # Check every hour
