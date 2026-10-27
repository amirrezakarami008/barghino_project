"""Resolve the authenticated user from a JWT access token (header or subprotocol)."""

from __future__ import annotations

from channels.db import database_sync_to_async
from django.contrib.auth.models import AbstractBaseUser, AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from apps.accounts.authentication import (
    get_bearer_from_headers,
    get_token_from_subprotocols,
    user_from_validated_access,
)
from apps.accounts.tokens import VersionedAccessToken


@database_sync_to_async
def user_from_token(raw_token: str) -> AbstractBaseUser | AnonymousUser:
    try:
        access = VersionedAccessToken(raw_token)
        return user_from_validated_access(access)
    except (InvalidToken, TokenError, KeyError, TypeError):
        return AnonymousUser()


def token_and_subprotocol_from_scope(scope: dict) -> tuple[str | None, str | None]:
    """Return ``(raw_token, accepted_subprotocol)``.

    Prefers ``Authorization: Bearer``; falls back to subprotocols ``bearer, <jwt>``.
    Query-string tokens are intentionally unsupported.
    """
    headers = scope.get("headers") or []
    bearer = get_bearer_from_headers(headers)
    if bearer:
        return bearer, None

    token, accepted = get_token_from_subprotocols(scope.get("subprotocols") or [])
    return token, accepted
