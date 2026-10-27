from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"

    def ready(self) -> None:
        # Register OpenAPI auth extension for Swagger JWT Authorize button.
        from apps.accounts import schema as _schema  # noqa: F401
