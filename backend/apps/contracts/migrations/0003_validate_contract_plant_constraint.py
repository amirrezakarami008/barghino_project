from django.db import migrations


def validate_contract_plant_constraint(apps, schema_editor):
    contract_model = apps.get_model("contracts", "Contract")
    quote = schema_editor.quote_name
    schema_editor.execute(
        f"ALTER TABLE {quote(contract_model._meta.db_table)} "
        f"VALIDATE CONSTRAINT {quote('contracts_contract_plant_fk')}"
    )


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ("contracts", "0002_contract_plant"),
    ]

    operations = [
        migrations.RunPython(
            validate_contract_plant_constraint,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
