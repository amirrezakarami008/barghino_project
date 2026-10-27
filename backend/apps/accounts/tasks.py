"""Background delivery for account messages."""

from __future__ import annotations

from celery import shared_task


@shared_task(
    name="accounts.tasks.send_otp_sms",
    autoretry_for=(ConnectionError, TimeoutError, OSError),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
    soft_time_limit=10,
    time_limit=15,
)
def send_otp_sms(phone: str, code: str, purpose: str) -> None:
    """Deliver a one-time code. Retries resend the same code."""
    from apps.accounts.services.sms import send_sms

    send_sms(phone, f"Bargino code ({purpose}): {code}")
