from __future__ import annotations

import pytest
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser

from apps.accounts.tests.factories import UserFactory
from apps.accounts.tokens import VersionedRefreshToken
from apps.realtime.auth import token_and_subprotocol_from_scope, user_from_token


def _access_token_for(user) -> str:
    return str(VersionedRefreshToken.for_user(user).access_token)


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_from_token_valid(fake_redis):
    user = await sync_to_async(UserFactory)()
    token = await sync_to_async(_access_token_for)(user)
    resolved = await user_from_token(token)
    assert resolved.is_authenticated
    assert resolved.pk == user.pk


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_from_token_invalid(fake_redis):
    resolved = await user_from_token("not-a-jwt")
    assert isinstance(resolved, AnonymousUser)


def test_token_from_authorization_header():
    scope = {
        "headers": [(b"authorization", b"Bearer abc123")],
        "subprotocols": [],
    }
    token, accepted = token_and_subprotocol_from_scope(scope)
    assert token == "abc123"
    assert accepted is None


def test_token_from_subprotocols():
    scope = {"headers": [], "subprotocols": ["bearer", "abc123"]}
    token, accepted = token_and_subprotocol_from_scope(scope)
    assert token == "abc123"
    assert accepted == "bearer"


def test_querystring_token_ignored():
    scope = {
        "headers": [],
        "subprotocols": [],
        "query_string": b"token=abc123",
    }
    token, accepted = token_and_subprotocol_from_scope(scope)
    assert token is None
    assert accepted is None
