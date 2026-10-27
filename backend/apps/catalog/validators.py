from django.core.exceptions import ValidationError


def validate_plan_benefits(value: object) -> None:
    if not isinstance(value, list) or any(
        not isinstance(item, str) or not item.strip() for item in value
    ):
        raise ValidationError("Benefits must be a list of non-empty strings.")
