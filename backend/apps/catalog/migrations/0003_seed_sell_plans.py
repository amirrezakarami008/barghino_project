"""Create inactive placeholder plans without overwriting existing product values."""

from copy import deepcopy

from django.db import migrations

from apps.catalog.seed_data import PLACEHOLDER_SELL_PLANS


def seed_sell_plans(apps, schema_editor):
    plan_model = apps.get_model("catalog", "SellPlan")
    manager = plan_model._base_manager.db_manager(schema_editor.connection.alias)
    for values in PLACEHOLDER_SELL_PLANS:
        defaults = deepcopy(values)
        name = defaults.pop("name")
        manager.get_or_create(name=name, defaults=defaults)


class Migration(migrations.Migration):
    dependencies = [("catalog", "0002_sellplan")]

    operations = [
        # Reversal preserves rows because staff may have customized their commercial terms.
        migrations.RunPython(seed_sell_plans, reverse_code=migrations.RunPython.noop),
    ]
