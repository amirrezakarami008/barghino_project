from __future__ import annotations

import pytest
from django.db import connection, models

from apps.core.models import BaseModel


class SoftItem(BaseModel):
    """Concrete BaseModel used only in soft-delete tests."""

    name = models.CharField(max_length=64)

    class Meta:
        app_label = "core"


def _table_exists() -> bool:
    return SoftItem._meta.db_table in connection.introspection.table_names()


@pytest.fixture(scope="session")
def soft_item_table(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        with connection.schema_editor() as schema_editor:
            if not _table_exists():
                schema_editor.create_model(SoftItem)
    yield SoftItem
    with django_db_blocker.unblock():
        with connection.schema_editor() as schema_editor:
            if _table_exists():
                schema_editor.delete_model(SoftItem)


@pytest.fixture
def soft_model(db, soft_item_table):
    SoftItem.all_objects.all().hard_delete()
    return SoftItem


@pytest.mark.django_db
def test_soft_delete_hides_from_default_manager(soft_model):
    item = soft_model.objects.create(name="keep-me")
    item.delete()

    assert soft_model.objects.filter(pk=item.pk).exists() is False
    assert soft_model.all_objects.filter(pk=item.pk).exists() is True
    assert soft_model.all_objects.get(pk=item.pk).is_deleted is True


@pytest.mark.django_db
def test_restore_brings_row_back(soft_model):
    item = soft_model.objects.create(name="gone")
    item.delete()
    soft_model.all_objects.get(pk=item.pk).restore()

    assert soft_model.objects.filter(pk=item.pk).exists() is True
    assert soft_model.objects.get(pk=item.pk).is_deleted is False


@pytest.mark.django_db
def test_queryset_soft_delete_and_hard_delete(soft_model):
    a = soft_model.objects.create(name="a")
    b = soft_model.objects.create(name="b")

    soft_model.objects.filter(pk=a.pk).delete()
    assert soft_model.objects.count() == 1
    assert soft_model.all_objects.count() == 2

    soft_model.all_objects.filter(pk=b.pk).hard_delete()
    assert soft_model.all_objects.count() == 1
    assert soft_model.all_objects.filter(pk=a.pk).exists() is True


@pytest.mark.django_db
def test_queryset_restore(soft_model):
    item = soft_model.objects.create(name="batch")
    soft_model.objects.filter(pk=item.pk).delete()
    restored = soft_model.all_objects.dead().restore()

    assert restored == 1
    assert soft_model.objects.filter(pk=item.pk).exists() is True
