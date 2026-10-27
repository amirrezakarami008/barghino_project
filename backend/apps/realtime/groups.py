"""Channel-layer group name helpers."""


def user_group(user_id: int | str) -> str:
    return f"user_{user_id}"
