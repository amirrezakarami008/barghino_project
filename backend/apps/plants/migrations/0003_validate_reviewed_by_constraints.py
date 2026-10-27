from django.db import migrations


def validate_reviewed_by_constraints(apps, schema_editor):
    quote = schema_editor.quote_name
    for table, constraint_name in (
        ("plants_branch", "plants_branch_reviewed_by_fk"),
        ("plants_plant", "plants_plant_reviewed_by_fk"),
    ):
        schema_editor.execute(
            f"ALTER TABLE {quote(table)} VALIDATE CONSTRAINT {quote(constraint_name)}"
        )


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ("plants", "0002_branch_review_decision_branch_review_note_and_more"),
    ]

    operations = [
        migrations.RunPython(
            validate_reviewed_by_constraints,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
