"""
Custom DRF exception handler producing a consistent error envelope:

    {
        "error": {
            "code": "validation_error",
            "detail": {...} | "...",
        }
    }
"""

from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import exceptions
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def _error_code(exc: Exception) -> str:
    if isinstance(exc, Http404):
        return "not_found"
    if isinstance(exc, PermissionDenied):
        return "permission_denied"
    if isinstance(exc, exceptions.APIException):
        codes = exc.get_codes()
        if isinstance(codes, str):
            return codes
        if isinstance(codes, dict):
            for value in codes.values():
                if isinstance(value, str):
                    return value
        if isinstance(codes, list) and codes:
            first = codes[0]
            if isinstance(first, str):
                return first
        return str(exc.default_code)
    return "error"


def exception_handler(exc: Exception, context: dict) -> Response | None:
    response = drf_exception_handler(exc, context)
    if response is None:
        # Non-API exception: let Django's 500 handling take over.
        return None

    response.data = {
        "error": {
            "code": _error_code(exc),
            "detail": response.data,
        }
    }
    return response
