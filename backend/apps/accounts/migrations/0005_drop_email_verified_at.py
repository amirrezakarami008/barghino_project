"""Drop the unused email_verified_at column.

On PostgreSQL the drop takes a brief ACCESS EXCLUSIVE lock and fails fast
if that lock is not available within 2 seconds.
"""

from django.db import migrations


def drop_email_verified_at(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute("SET LOCAL lock_timeout = '2s'")
    schema_editor.execute("ALTER TABLE accounts_user DROP COLUMN email_verified_at")


def restore_email_verified_at(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute("SET LOCAL lock_timeout = '2s'")
        schema_editor.execute(
            "ALTER TABLE accounts_user ADD COLUMN email_verified_at timestamp with time zone NULL"
        )
        return
    schema_editor.execute("ALTER TABLE accounts_user ADD COLUMN email_verified_at datetime NULL")


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0004_remove_email_verified_at_state"),
    ]

    operations = [
        migrations.RunPython(drop_email_verified_at, restore_email_verified_at),
    ]
