"""Access denylist and refresh-token revocation."""

from __future__ import annotations

import time

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import AccessToken

from apps.accounts.models import User
from apps.accounts.tokens import VersionedAccessToken, VersionedRefreshToken
from apps.core.redis import build_key, get_redis


def issue_token_pair(user: User) -> dict[str, str]:
    refresh = VersionedRefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


def denylist_key(jti: str) -> str:
    return build_key("auth", "denylist", jti)


def is_access_token_denied(jti: str) -> bool:
    return get_redis().exists(denylist_key(jti))


def denylist_access_token(token: AccessToken | str) -> bool:
    """Add an access token ``jti`` to the Redis denylist until its ``exp``.

    Returns ``True`` if the token was denylisted.
    """
    try:
        access = token if isinstance(token, AccessToken) else VersionedAccessToken(token)
    except TokenError:
        return False

    jti = access.get("jti")
    exp = access.get("exp")
    if not jti or not exp:
        return False

    ttl = int(exp) - int(time.time())
    if ttl <= 0:
        return False

    get_redis().set(denylist_key(str(jti)), True, ttl=ttl)
    return True


def denylist_access_from_authorization_header(header_value: str | None) -> bool:
    if not header_value:
        return False
    parts = header_value.split(None, 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return False
    return denylist_access_token(parts[1].strip())


def blacklist_user_tokens(user: User, *, bump_version: bool = True) -> int:
    """Blacklist all outstanding refresh tokens; optionally bump ``token_version``."""
    count = 0
    for outstanding in OutstandingToken.objects.filter(user=user):
        _, created = BlacklistedToken.objects.get_or_create(token=outstanding)
        if created:
            count += 1
    if bump_version:
        user.bump_token_version()
    return count
