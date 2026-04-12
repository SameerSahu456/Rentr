"""
Email Service for Rentr RMS

Sends contract expiry reminders and other transactional emails via SMTP.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, body_text: str, body_html: str | None = None) -> bool:
    """Send an email via SMTP. Returns True on success, False on failure."""
    if not settings.SMTP_HOST:
        logger.warning("SMTP not configured — skipping email to %s", to_email)
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body_text, "plain"))
    if body_html:
        msg.attach(MIMEText(body_html, "html"))

    try:
        if settings.SMTP_USE_TLS:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
            server.starttls()
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
        server.quit()
        logger.info("Email sent to %s: %s", to_email, subject)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)
        return False


def send_contract_expiry_reminder(
    to_email: str,
    customer_name: str,
    contract_number: str,
    end_date,
    days_left: int,
) -> bool:
    """Send a contract expiry reminder email."""
    subject = f"Reminder: Your rental contract {contract_number} expires in {days_left} days"

    body_text = (
        f"Dear {customer_name},\n\n"
        f"This is a reminder that your rental contract {contract_number} "
        f"is expiring on {end_date}. "
        f"You have {days_left} day(s) remaining.\n\n"
        f"Please contact us to renew or extend your contract.\n\n"
        f"Best regards,\nRentr Team"
    )

    body_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Contract Expiry Reminder</h2>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Dear <strong>{customer_name}</strong>,</p>
            <p>This is a reminder that your rental contract
               <strong>{contract_number}</strong> is expiring on
               <strong>{end_date}</strong>.</p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                <strong>⏰ {days_left} day(s) remaining</strong>
            </div>
            <p>Please contact us to renew or extend your contract.</p>
            <p style="margin-top: 24px;">Best regards,<br><strong>Rentr Team</strong></p>
        </div>
    </div>
    """

    return send_email(to_email, subject, body_text, body_html)
