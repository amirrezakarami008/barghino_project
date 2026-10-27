from __future__ import annotations

import pytest
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.files.models import FileVisibility, StoredFile
from apps.files.tests.factories import StoredFileFactory


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    cache.clear()
    yield
    cache.clear()


def _jpeg(name: str = "roof.jpg", payload: bytes = b"\xff\xd8\xff\xd9") -> SimpleUploadedFile:
    return SimpleUploadedFile(name, payload, content_type="image/jpeg")


@pytest.mark.django_db
class TestFileUploadPermissions:
    def test_upload_requires_authentication(self, api_client):
        response = api_client.post(
            reverse("v1:files:list-create"),
            {"file": _jpeg(), "purpose": "document"},
            format="multipart",
        )
        assert response.status_code == 401

    def test_other_user_cannot_retrieve_or_delete(self, api_client):
        owner = UserFactory()
        other = UserFactory()
        stored = StoredFileFactory(owner=owner)

        api_client.force_authenticate(user=other)
        detail = reverse("v1:files:detail", kwargs={"uuid": stored.uuid})
        assert api_client.get(detail).status_code == 404
        assert api_client.delete(detail).status_code == 404

    def test_other_user_cannot_download_private_content(self, api_client):
        owner = UserFactory()
        other = UserFactory()
        stored = StoredFileFactory(owner=owner)

        api_client.force_authenticate(user=other)
        content = reverse("v1:files:content", kwargs={"uuid": stored.uuid})
        assert api_client.get(content).status_code == 404


@pytest.mark.django_db
class TestFileUploadMainPath:
    def test_upload_list_detail_download_and_soft_delete(self, api_client):
        user = UserFactory()
        api_client.force_authenticate(user=user)

        create = api_client.post(
            reverse("v1:files:list-create"),
            {"file": _jpeg("id-card.jpg"), "purpose": "national_id"},
            format="multipart",
        )
        assert create.status_code == 201
        body = create.json()
        assert body["purpose"] == "national_id"
        assert body["visibility"] == "private"
        assert body["original_name"] == "id-card.jpg"
        assert body["size_bytes"] == 4
        assert "storage_key" not in body
        assert "file" not in body
        assert "/api/v1/files/" in body["url"]
        assert "/content/" in body["url"]
        file_uuid = body["uuid"]

        listed = api_client.get(reverse("v1:files:list-create"))
        assert listed.status_code == 200
        assert listed.json()["count"] == 1
        assert listed.json()["results"][0]["uuid"] == file_uuid

        detail = api_client.get(reverse("v1:files:detail", kwargs={"uuid": file_uuid}))
        assert detail.status_code == 200
        assert detail.json()["content_type"] == "image/jpeg"

        download = api_client.get(reverse("v1:files:content", kwargs={"uuid": file_uuid}))
        assert download.status_code == 200
        assert download.headers["Content-Type"].startswith("image/jpeg")
        payload = (
            b"".join(download.streaming_content)
            if getattr(download, "streaming_content", None) is not None
            else download.content
        )
        assert payload == b"\xff\xd8\xff\xd9"

        deleted = api_client.delete(reverse("v1:files:detail", kwargs={"uuid": file_uuid}))
        assert deleted.status_code == 204
        assert StoredFile.objects.filter(uuid=file_uuid).count() == 0
        assert StoredFile.all_objects.filter(uuid=file_uuid).count() == 1
        gone = api_client.get(reverse("v1:files:detail", kwargs={"uuid": file_uuid}))
        assert gone.status_code == 404

    def test_rejects_disallowed_content_type(self, api_client):
        user = UserFactory()
        api_client.force_authenticate(user=user)
        bad = SimpleUploadedFile("notes.txt", b"hello", content_type="text/plain")

        response = api_client.post(
            reverse("v1:files:list-create"),
            {"file": bad, "purpose": "document"},
            format="multipart",
        )
        assert response.status_code == 400
        assert response.json()["error"]["code"] in {"invalid_content_type", "invalid"}

    def test_rejects_oversized_file(self, api_client, settings):
        settings.FILES_UPLOAD_RULES = {
            "document": {
                "max_bytes": 8,
                "content_types": ["image/jpeg"],
            }
        }
        user = UserFactory()
        api_client.force_authenticate(user=user)

        response = api_client.post(
            reverse("v1:files:list-create"),
            {"file": _jpeg(payload=b"\xff\xd8" + b"x" * 20 + b"\xff\xd9"), "purpose": "document"},
            format="multipart",
        )
        assert response.status_code == 400

    def test_non_staff_cannot_upload_public(self, api_client):
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.post(
            reverse("v1:files:list-create"),
            {"file": _jpeg(), "purpose": "content", "visibility": "public"},
            format="multipart",
        )
        assert response.status_code == 403

    def test_public_content_readable_without_auth(self, api_client):
        staff = UserFactory(is_staff=True)
        stored = StoredFileFactory(
            owner=staff,
            visibility=FileVisibility.PUBLIC,
            purpose="content",
            original_name="hero.webp",
            content_type="image/webp",
        )

        response = api_client.get(reverse("v1:files:content", kwargs={"uuid": stored.uuid}))
        assert response.status_code == 200

    def test_staff_can_retrieve_another_users_file(self, api_client):
        owner = UserFactory()
        staff = UserFactory(is_staff=True)
        stored = StoredFileFactory(owner=owner)

        api_client.force_authenticate(user=staff)
        response = api_client.get(reverse("v1:files:detail", kwargs={"uuid": stored.uuid}))
        assert response.status_code == 200
        assert response.json()["uuid"] == str(stored.uuid)

    def test_unauthenticated_private_content_returns_401(self, api_client):
        stored = StoredFileFactory()
        response = api_client.get(reverse("v1:files:content", kwargs={"uuid": stored.uuid}))
        assert response.status_code == 401
