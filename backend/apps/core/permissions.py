"""Reusable DRF permission classes for domain views."""

from __future__ import annotations

from typing import Any

from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView


class IsStaff(BasePermission):
    """Allow only staff users (``is_staff=True``)."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsAdmin(BasePermission):
    """Allow only superusers."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class IsOwner(BasePermission):
    """Object-level: ``request.user`` must own the object.

    Looks for ``owner_field`` on the view (default ``\"user\"``), then falls
    back to attributes ``user`` or ``owner`` on the object.
    """

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        field = getattr(view, "owner_field", "user")
        owner = getattr(obj, field, None)
        if owner is None and field == "user":
            owner = getattr(obj, "owner", None)
        return owner == request.user


class IsOwnerOrReadOnly(IsOwner):
    """Read for anyone authenticated by default permission; writes need ownership.

    Pair with ``IsAuthenticated`` (project default). Safe methods always pass
    object checks here; unsafe methods require ownership.
    """

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return super().has_object_permission(request, view, obj)


class IsOwnerOrStaff(IsOwner):
    """Owner of the object, or any staff user."""

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        if request.user and request.user.is_authenticated and request.user.is_staff:
            return True
        return super().has_object_permission(request, view, obj)


class ReadOnly(BasePermission):
    """Allow only safe HTTP methods."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        return request.method in SAFE_METHODS
