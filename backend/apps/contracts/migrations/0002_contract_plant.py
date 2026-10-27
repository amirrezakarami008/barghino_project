import django.db.models.deletion
from django.db import migrations, models


def add_contract_plant_constraint(apps, schema_editor):
    contract_model = apps.get_model("contracts", "Contract")
    plant_model = apps.get_model("plants", "Plant")
    quote = schema_editor.quote_name
    schema_editor.execute("SET LOCAL lock_timeout = '2s'")
    schema_editor.execute(
        f"ALTER TABLE {quote(contract_model._meta.db_table)} "
        f"ADD CONSTRAINT {quote('contracts_contract_plant_fk')} "
        f"FOREIGN KEY ({quote('plant_id')}) "
        f"REFERENCES {quote(plant_model._meta.db_table)} ({quote(plant_model._meta.pk.column)}) "
        "DEFERRABLE INITIALLY DEFERRED NOT VALID"
    )


def remove_contract_plant_constraint(apps, schema_editor):
    contract_model = apps.get_model("contracts", "Contract")
    quote = schema_editor.quote_name
    schema_editor.execute(
        f"ALTER TABLE {quote(contract_model._meta.db_table)} "
        f"DROP CONSTRAINT {quote('contracts_contract_plant_fk')}"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("contracts", "0001_initial"),
        ("plants", "0003_validate_reviewed_by_constraints"),
    ]

    operations = [
        migrations.RunSQL(
            "SET LOCAL lock_timeout = '2s'",
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.AddField(
            model_name="contract",
            name="plant",
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                db_index=False,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="contracts",
                to="plants.plant",
            ),
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_contract_plant_constraint,
                    reverse_code=remove_contract_plant_constraint,
                ),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name="contract",
                    name="plant",
                    field=models.ForeignKey(
                        blank=True,
                        db_index=False,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="contracts",
                        to="plants.plant",
                    ),
                ),
            ],
        ),
    ]
