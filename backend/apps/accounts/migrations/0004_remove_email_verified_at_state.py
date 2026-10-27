"""Drop email_verified_at from the ORM. The column stays until the next migration."""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_user_phone_and_profiles"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(
                    model_name="user",
                    name="email_verified_at",
                ),
            ],
            database_operations=[],
        ),
    ]
