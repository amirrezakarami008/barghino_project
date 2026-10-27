"""Outbound SMS. The log driver records the message until a provider is configured."""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger("apps.accounts.sms")


def send_sms(phone: str, message: str) -> None:
    driver = settings.SMS_DRIVER
    if driver == "log":
        logger.info("sms phone=%s message=%s", phone, message)
        return
    raise ImproperlyConfigured(f"Unknown SMS driver: {driver}")
