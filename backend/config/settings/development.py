"""Development settings."""

from .base import *  # noqa: F401,F403
from .base import SPECTACULAR_SETTINGS, env

DEBUG = True
OTP_LOG_CODES = env.bool("OTP_LOG_CODES", default=True)

SECRET_KEY = env("DJANGO_SECRET_KEY", default="insecure-dev-only-secret-key")

ALLOWED_HOSTS = ["*"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Allow any origin in local development; production uses an explicit allow-list.
CORS_ALLOW_ALL_ORIGINS = True

# LocMem cache so tests and local runs work without a live Redis.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "backend-dev",
    },
}

# Plain static files storage in development (no manifest hashing).
STORAGES["staticfiles"] = {  # noqa: F405
    "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
}

SPECTACULAR_SETTINGS = {
    **SPECTACULAR_SETTINGS,
    "SERVE_PERMISSIONS": ["rest_framework.permissions.AllowAny"],
}
