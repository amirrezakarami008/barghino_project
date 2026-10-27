from types import SimpleNamespace

import pytest
from rest_framework.test import APIRequestFactory

from apps.accounts.tests.factories import UserFactory
from apps.core.permissions import (
    IsAdmin,
    IsOwner,
    IsOwnerOrReadOnly,
    IsOwnerOrStaff,
    IsStaff,
    ReadOnly,
)


@pytest.fixture
def factory() -> APIRequestFactory:
    return APIRequestFactory()


@pytest.mark.django_db
class TestIsStaff:
    def test_staff_allowed(self, factory):
        user = UserFactory(is_staff=True)
        request = factory.get("/")
        request.user = user
        assert IsStaff().has_permission(request, None) is True

    def test_non_staff_denied(self, factory):
        user = UserFactory(is_staff=False)
        request = factory.get("/")
        request.user = user
        assert IsStaff().has_permission(request, None) is False


@pytest.mark.django_db
class TestIsAdmin:
    def test_superuser_allowed(self, factory):
        user = UserFactory(is_superuser=True, is_staff=True)
        request = factory.get("/")
        request.user = user
        assert IsAdmin().has_permission(request, None) is True

    def test_staff_not_enough(self, factory):
        user = UserFactory(is_staff=True, is_superuser=False)
        request = factory.get("/")
        request.user = user
        assert IsAdmin().has_permission(request, None) is False


@pytest.mark.django_db
class TestIsOwner:
    def test_owner_via_user_field(self, factory):
        user = UserFactory()
        request = factory.get("/")
        request.user = user
        obj = SimpleNamespace(user=user)
        assert IsOwner().has_object_permission(request, SimpleNamespace(), obj) is True

    def test_owner_via_owner_field_fallback(self, factory):
        user = UserFactory()
        request = factory.get("/")
        request.user = user
        obj = SimpleNamespace(owner=user)
        # no `.user` attribute
        assert IsOwner().has_object_permission(request, SimpleNamespace(), obj) is True

    def test_custom_owner_field_on_view(self, factory):
        user = UserFactory()
        other = UserFactory()
        request = factory.get("/")
        request.user = user
        obj = SimpleNamespace(author=user)
        view = SimpleNamespace(owner_field="author")
        assert IsOwner().has_object_permission(request, view, obj) is True
        request.user = other
        assert IsOwner().has_object_permission(request, view, obj) is False


@pytest.mark.django_db
class TestIsOwnerOrReadOnly:
    def test_safe_methods_allowed_for_non_owner(self, factory):
        owner = UserFactory()
        other = UserFactory()
        request = factory.get("/")
        request.user = other
        obj = SimpleNamespace(user=owner)
        assert IsOwnerOrReadOnly().has_object_permission(request, SimpleNamespace(), obj) is True

    def test_unsafe_requires_owner(self, factory):
        owner = UserFactory()
        other = UserFactory()
        request = factory.post("/")
        request.user = other
        obj = SimpleNamespace(user=owner)
        assert IsOwnerOrReadOnly().has_object_permission(request, SimpleNamespace(), obj) is False


@pytest.mark.django_db
class TestIsOwnerOrStaff:
    def test_staff_can_access_others_object(self, factory):
        owner = UserFactory()
        staff = UserFactory(is_staff=True)
        request = factory.delete("/")
        request.user = staff
        obj = SimpleNamespace(user=owner)
        assert IsOwnerOrStaff().has_object_permission(request, SimpleNamespace(), obj) is True


class TestReadOnly:
    def test_get_allowed(self, factory):
        request = factory.get("/")
        assert ReadOnly().has_permission(request, None) is True

    def test_post_denied(self, factory):
        request = factory.post("/")
        assert ReadOnly().has_permission(request, None) is False
