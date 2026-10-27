"""
Base settings shared by all environments.

Environment-specific values are read from environment variables (or a `.env`
file in the project root). See `.env.example` for the full list.
"""

from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
# Read .env file if present (development convenience; production should use
# real environment variables).
environ.Env.read_env(BASE_DIR / ".env")

# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------
# No default here on purpose: production.py requires it strictly, while
# development.py provides an insecure fallback.
SECRET_KEY = env("DJANGO_SECRET_KEY", default="")
DEBUG = env.bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])

# WebSockets (Django Channels). Set USE_WEBSOCKETS=False to run HTTP-only.
USE_WEBSOCKETS = env.bool("USE_WEBSOCKETS", default=True)

INSTALLED_APPS = [
    # Daphne must be first when websockets are enabled (ASGI runserver).
    *(["daphne"] if USE_WEBSOCKETS else []),
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    *(["channels"] if USE_WEBSOCKETS else []),
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "drf_spectacular",
    # Local
    "apps.core",
    "apps.accounts",
    "apps.files",
    "apps.plants",
    "apps.catalog",
    "apps.contracts",
    *(["apps.realtime"] if USE_WEBSOCKETS else []),
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default="postgres://postgres:postgres@localhost:5432/backend",
    ),
}
DATABASES["default"]["CONN_MAX_AGE"] = env.int("DJANGO_CONN_MAX_AGE", default=60)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Used in password-reset emails (frontend route that reads uid + token).
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")

# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="noreply@example.com")
EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = env("EMAIL_HOST", default="localhost")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)

# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = env("DJANGO_TIME_ZONE", default="UTC")
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Static & media files
# ---------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# Uploads (apps.files). Install media cap in the backlog is 25 MiB.
DATA_UPLOAD_MAX_MEMORY_SIZE = env.int("DATA_UPLOAD_MAX_MEMORY_SIZE", default=26 * 1024 * 1024)
FILE_UPLOAD_MAX_MEMORY_SIZE = env.int("FILE_UPLOAD_MAX_MEMORY_SIZE", default=26 * 1024 * 1024)
FILES_SIGNED_URL_TTL_SECONDS = env.int("FILES_SIGNED_URL_TTL_SECONDS", default=300)
FILES_PUBLIC_BASE_URL = env("FILES_PUBLIC_BASE_URL", default="")


# ---------------------------------------------------------------------------
# Cache (Redis)
# ---------------------------------------------------------------------------
# DB 0 is reserved for Celery; caches use DB 1 by default.
REDIS_URL = env("REDIS_URL", default="redis://localhost:6379/1")
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
    },
}

# Domain Redis clients (apps.core.redis) — separate from Django cache / Celery.
# DB 1 = default app client; DB 2 = streams. Do not reuse DB 0 (Celery).
REDIS_KEY_PREFIX = env("REDIS_KEY_PREFIX", default="backend")
REDIS_CONNECTIONS = {
    "default": env("REDIS_URL", default="redis://localhost:6379/1"),
    "streams": env("REDIS_STREAMS_URL", default="redis://localhost:6379/2"),
}

# ---------------------------------------------------------------------------
# WebSockets / Channels (Redis DB 3)
# ---------------------------------------------------------------------------
REDIS_CHANNELS_URL = env("REDIS_CHANNELS_URL", default="redis://localhost:6379/3")
if USE_WEBSOCKETS:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [REDIS_CHANNELS_URL]},
        },
    }

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_CREDENTIALS = env.bool("CORS_ALLOW_CREDENTIALS", default=True)

# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("apps.accounts.authentication.DenylistJWTAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.DefaultPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.core.exceptions.exception_handler",
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("DRF_THROTTLE_ANON", default="100/min"),
        "user": env("DRF_THROTTLE_USER", default="1000/min"),
        "register": env("DRF_THROTTLE_REGISTER", default="5/min"),
        "token_refresh": env("DRF_THROTTLE_TOKEN_REFRESH", default="30/min"),
        "otp_request": env("DRF_THROTTLE_OTP_REQUEST", default="10/min"),
        "otp_verify": env("DRF_THROTTLE_OTP_VERIFY", default="30/min"),
        "file_upload": env("DRF_THROTTLE_FILE_UPLOAD", default="30/min"),
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=env.int("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", default=15)
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=env.int("JWT_REFRESH_TOKEN_LIFETIME_DAYS", default=7)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_TOKEN_CLASSES": ("apps.accounts.tokens.VersionedAccessToken",),
    "TOKEN_REFRESH_SERIALIZER": "apps.accounts.api.serializers.VersionedTokenRefreshSerializer",
}

# Shared secret for readiness probes (empty = no auth). Set in production if /health
# is reachable from the public internet.
HEALTH_CHECK_TOKEN = env("HEALTH_CHECK_TOKEN", default="")

WS_MAX_CONNECTIONS_PER_USER = env.int("WS_MAX_CONNECTIONS_PER_USER", default=5)
WS_MAX_MESSAGE_BYTES = env.int("WS_MAX_MESSAGE_BYTES", default=64 * 1024)

from apps.core.openapi import API_DESCRIPTION, OPENAPI_TAGS  # noqa: E402

SPECTACULAR_SETTINGS = {
    "TITLE": "Bargino API",
    "DESCRIPTION": API_DESCRIPTION,
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    # Production default: docs require staff login. Development overrides to AllowAny.
    "SERVE_PERMISSIONS": ["rest_framework.permissions.IsAdminUser"],
    "TAGS": OPENAPI_TAGS,
    "ENUM_NAME_OVERRIDES": {
        "BranchStatusEnum": "apps.plants.models.BranchStatus.choices",
        "PlantStatusEnum": "apps.plants.models.PlantStatus.choices",
    },
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_PATH_PREFIX": r"/api/v1/",
    "APPEND_COMPONENTS": {
        "securitySchemes": {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
        }
    },
    "SECURITY": [{"bearerAuth": []}],
    "SWAGGER_UI_SETTINGS": {
        "persistAuthorization": True,
        "displayRequestDuration": True,
        "filter": True,
        "docExpansion": "list",
        "operationsSorter": "method",
        "tryItOutEnabled": True,
    },
}

# ---------------------------------------------------------------------------
# Celery
# ---------------------------------------------------------------------------
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default=CELERY_BROKER_URL)
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 60 * 5

# ---------------------------------------------------------------------------
# OTP
# ---------------------------------------------------------------------------
OTP_CODE_TTL_SECONDS = env.int("OTP_CODE_TTL_SECONDS", default=120)
OTP_MAX_ATTEMPTS = env.int("OTP_MAX_ATTEMPTS", default=5)
OTP_PHONE_HOURLY_LIMIT = env.int("OTP_PHONE_HOURLY_LIMIT", default=5)
OTP_IP_HOURLY_LIMIT = env.int("OTP_IP_HOURLY_LIMIT", default=20)
OTP_HOURLY_WINDOW_SECONDS = 3600
OTP_LOG_CODES = env.bool("OTP_LOG_CODES", default=False)
SMS_DRIVER = env("SMS_DRIVER", default="log")

# ---------------------------------------------------------------------------
# Sentry (optional — only initialises when SENTRY_DSN is set)
# ---------------------------------------------------------------------------
SENTRY_DSN = env("SENTRY_DSN", default="")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.redis import RedisIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        environment=env("SENTRY_ENVIRONMENT", default="development"),
        traces_sample_rate=env.float("SENTRY_TRACES_SAMPLE_RATE", default=0.0),
        send_default_pii=False,
    )

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "sensitive_data": {
            "()": "apps.core.logging.SensitiveDataFilter",
        },
    },
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {name} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
            "filters": ["sensitive_data"],
        },
    },
    "root": {
        "handlers": ["console"],
        "level": env("DJANGO_LOG_LEVEL", default="INFO"),
    },
}
