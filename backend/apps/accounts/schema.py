"""drf-spectacular extensions for accounts auth."""

from drf_spectacular.extensions import OpenApiAuthenticationExtension


class DenylistJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "apps.accounts.authentication.DenylistJWTAuthentication"
    name = "bearerAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": (
                "JWT access token from register/verify or otp/verify. "
                "Header: `Authorization: Bearer <access>`."
            ),
        }
