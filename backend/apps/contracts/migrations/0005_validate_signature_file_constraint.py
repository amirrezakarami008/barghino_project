from django.db import migrations


class Migration(migrations.Migration):
    atomic = False

    dependencies = [("contracts", "0004_contract_signing_and_review")]

    operations = [
        migrations.RunSQL(
            "SET LOCAL lock_timeout = '2s'; "
            'ALTER TABLE "contracts_contract" '
            'VALIDATE CONSTRAINT "contracts_contract_signature_file_fk"',
            reverse_sql=(
                "SET LOCAL lock_timeout = '2s'; "
                'ALTER TABLE "contracts_contract" '
                'DROP CONSTRAINT "contracts_contract_signature_file_fk"'
            ),
        ),
    ]
