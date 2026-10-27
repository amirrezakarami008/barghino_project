"""ASGI middleware that authenticates WebSocket connections via JWT."""

from __future__ import annotations

from collections.abc import Callable

from channels.auth import AuthMiddlewareStack
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser

from apps.realtime.auth import token_and_subprotocol_from_scope, user_from_token


class JWTAuthMiddleware(BaseMiddleware):
    """Populate ``scope["user"]`` from Authorization header or ``bearer`` subprotocol."""

    async def __call__(self, scope: dict, receive: Callable, send: Callable):
        if scope["type"] == "websocket":
            token, accepted = token_and_subprotocol_from_scope(scope)
            scope["user"] = await user_from_token(token) if token else AnonymousUser()
            scope["accepted_subprotocol"] = accepted
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """Session stack first, then JWT overwrites ``scope["user"]``."""
    return AuthMiddlewareStack(JWTAuthMiddleware(inner))
