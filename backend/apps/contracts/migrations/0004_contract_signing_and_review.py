import django.db.models.deletion
import uuid
from django.db import migrations, models


def add_signature_file_constraint(apps, schema_editor):
    contract_model = apps.get_model("contracts", "Contract")
    file_model = apps.get_model("files", "StoredFile")
    quote = schema_editor.quote_name
    schema_editor.execute("SET LOCAL lock_timeout = '2s'")
    schema_editor.execute(
        f"ALTER TABLE {quote(contract_model._meta.db_table)} "
        f"ADD CONSTRAINT {quote('contracts_contract_signature_file_fk')} "
        f"FOREIGN KEY ({quote('signature_file_id')}) "
        f"REFERENCES {quote(file_model._meta.db_table)} ({quote(file_model._meta.pk.column)}) "
        "DEFERRABLE INITIALLY DEFERRED NOT VALID"
    )


def remove_signature_file_constraint(apps, schema_editor):
    contract_model = apps.get_model("contracts", "Contract")
    quote = schema_editor.quote_name
    schema_editor.execute("SET LOCAL lock_timeout = '2s'")
    schema_editor.execute(
        f"ALTER TABLE {quote(contract_model._meta.db_table)} "
        f"DROP CONSTRAINT {quote('contracts_contract_signature_file_fk')}"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("contracts", "0003_validate_contract_plant_constraint"),
        ("files", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL("SET LOCAL lock_timeout = '2s'", reverse_sql=migrations.RunSQL.noop),
        migrations.AddField(
            model_name="contract",
            name="terms_version",
            field=models.CharField(blank=True, db_default="", default="", max_length=64),
        ),
        migrations.AddField(
            model_name="contract",
            name="terms_sha256",
            field=models.CharField(blank=True, db_default="", default="", max_length=64),
        ),
        migrations.AddField(
            model_name="contract",
            name="signed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="contract",
            name="signature_file",
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                db_index=False,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="signed_contracts",
                to="files.storedfile",
            ),
        ),
        migrations.AddField(
            model_name="contract",
            name="review_decision",
            field=models.CharField(blank=True, db_default="", default="", max_length=16),
        ),
        migrations.AddField(
            model_name="contract",
            name="reviewed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="contract",
            name="reviewed_by_uuid",
            field=models.UUIDField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="contract",
            name="review_note",
            field=models.CharField(blank=True, db_default="", default="", max_length=1000),
        ),
        migrations.CreateModel(
            name="ContractHistory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("uuid", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ("event_type", models.CharField(choices=[("signed", "Signed by seller"), ("approved", "Approved by company"), ("rejected", "Rejected by company")], max_length=16)),
                ("from_status", models.CharField(max_length=16)),
                ("to_status", models.CharField(max_length=16)),
                ("actor_uuid", models.UUIDField(blank=True, null=True)),
                ("details", models.JSONField(default=dict)),
                ("contract", models.ForeignKey(db_index=False, on_delete=django.db.models.deletion.CASCADE, related_name="history", to="contracts.contract")),
            ],
            options={"ordering": ["created_at", "id"]},
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_signature_file_constraint,
                    reverse_code=remove_signature_file_constraint,
                ),
            ],
            state_operations=[],
        ),
    ]
