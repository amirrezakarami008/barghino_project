from django.conf import settings
from django.db import connection
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.http import require_GET

from apps.core.redis import get_redis


@require_GET
def health_live(request: HttpRequest) -> JsonResponse:
    """Liveness probe: process is up (no dependency checks)."""
    return JsonResponse({"status": "ok"})


def _ready_unauthorized() -> JsonResponse:
    return JsonResponse({"status": "error", "detail": "Unauthorized."}, status=401)


def _check_ready_token(request: HttpRequest) -> bool:
    expected = getattr(settings, "HEALTH_CHECK_TOKEN", "") or ""
    if not expected:
        return True
    provided = request.headers.get("X-Health-Token", "")
    return provided == expected


@require_GET
def health_ready(request: HttpRequest) -> HttpResponse:
    """Readiness probe: verifies the database and Redis.

    When ``HEALTH_CHECK_TOKEN`` is set, require header ``X-Health-Token``.
    """
    if not _check_ready_token(request):
        return _ready_unauthorized()

    checks: dict[str, str] = {}
    healthy = True

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception:  # noqa: BLE001
        checks["database"] = "unavailable"
        healthy = False

    try:
        if get_redis().ping():
            checks["redis"] = "ok"
        else:
            checks["redis"] = "unavailable"
            healthy = False
    except Exception:  # noqa: BLE001
        checks["redis"] = "unavailable"
        healthy = False

    status = "ok" if healthy else "error"
    code = 200 if healthy else 503
    return JsonResponse({"status": status, **checks}, status=code)


# Backwards-compatible alias (same as ready).
health_check = health_ready
