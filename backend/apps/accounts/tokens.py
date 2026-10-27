"""JWT classes that embed ``tv`` (token_version) for session invalidation."""

from rest_framework_simplejwt.tokens import AccessToken, RefreshToken


class VersionedAccessToken(AccessToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token["tv"] = int(getattr(user, "token_version", 0))
        return token


class VersionedRefreshToken(RefreshToken):
    access_token_class = VersionedAccessToken

    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token["tv"] = int(getattr(user, "token_version", 0))
        return token
