"""Scoped rate limits for sensitive auth endpoints."""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class RegisterRateThrottle(AnonRateThrottle):
    scope = "register"


class TokenRefreshRateThrottle(AnonRateThrottle):
    scope = "token_refresh"


class OtpRequestRateThrottle(AnonRateThrottle):
    scope = "otp_request"


class OtpVerifyRateThrottle(AnonRateThrottle):
    scope = "otp_verify"


class FileUploadRateThrottle(UserRateThrottle):
    scope = "file_upload"
