from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView, TokenVerifyView

from apps.accounts.api.serializers import (
    DetailResponseSerializer,
    OtpRequestSerializer,
    OtpVerifySerializer,
    RegisterSerializer,
    TokenPairSerializer,
    UserSerializer,
)
from apps.accounts.models import User
from apps.accounts.selectors import get_account
from apps.accounts.services.account import update_account
from apps.accounts.services.otp import OTP_DISPATCHED_DETAIL, request_login_code, verify_login_code
from apps.accounts.services.registration import start_registration, verify_registration
from apps.accounts.services.sessions import (
    denylist_access_from_authorization_header,
    issue_token_pair,
)
from apps.core.openapi import TAG_ACCOUNT, TAG_AUTH
from apps.core.throttling import (
    OtpRequestRateThrottle,
    OtpVerifyRateThrottle,
    RegisterRateThrottle,
    TokenRefreshRateThrottle,
)


@extend_schema(
    tags=[TAG_AUTH],
    auth=[],
    summary="Refresh access token",
    description=(
        "Exchange a valid refresh token for a new access token. "
        "Refresh tokens are rotated (`ROTATE_REFRESH_TOKENS`); "
        "the previous refresh is blacklisted. "
        "The new access token carries the user's current `token_version` (`tv` claim)."
    ),
)
class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_classes = (TokenRefreshRateThrottle,)


@extend_schema(
    tags=[TAG_AUTH],
    auth=[],
    summary="Verify access token",
    description=(
        "Check whether an access token is well-formed and not expired. Does not check the denylist."
    ),
)
class DocumentedTokenVerifyView(TokenVerifyView):
    pass


@extend_schema(
    tags=[TAG_AUTH],
    auth=[],
    summary="Start registration (send OTP)",
    description=(
        "Validate registration data for an individual or legal account and dispatch a 6-digit OTP "
        "by SMS (log driver in development). Does **not** create the user yet. "
        "On success returns a generic detail message; "
        "complete signup with `/auth/register/verify/`.\n\n"
        "**Individual** requires: `first_name`, `last_name`, `national_id`.\n"
        "**Legal** requires: `company_name`, `company_national_id`, "
        "representative name + national id.\n"
        "`path` must be `sell` or `install`. `terms_accepted` must be `true`.\n"
        "Rate-limited."
    ),
    request=RegisterSerializer,
    responses={200: DetailResponseSerializer},
)
class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (RegisterRateThrottle,)

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        start_registration(serializer.validated_data, ip=_client_ip(request))
        return Response({"detail": OTP_DISPATCHED_DETAIL}, status=status.HTTP_200_OK)


@extend_schema(
    tags=[TAG_AUTH],
    auth=[],
    summary="Confirm registration OTP",
    description=(
        "Consume the registration OTP for `phone`. Creates the user + profile, "
        "marks the phone verified, and returns JWT `access` / `refresh` plus the user payload. "
        "Invalid or expired codes return a validation error."
    ),
    request=OtpVerifySerializer,
    responses={201: TokenPairSerializer},
)
class RegisterVerifyView(generics.GenericAPIView):
    serializer_class = OtpVerifySerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (OtpVerifyRateThrottle,)

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = verify_registration(**serializer.validated_data)
        return Response(_token_body(user), status=status.HTTP_201_CREATED)


@extend_schema(
    tags=[TAG_AUTH],
    auth=[],
    summary="Request login OTP",
    description=(
        "Send a 6-digit login code to an Iranian mobile (`09xxxxxxxxx`). "
        "Response shape is the same whether or not the account exists (anti-enumeration), "
        "subject to rate limits. Confirm with `/auth/otp/verify/`."
    ),
    request=OtpRequestSerializer,
    responses={200: DetailResponseSerializer},
)
class OtpRequestView(generics.GenericAPIView):
    serializer_class = OtpRequestSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (OtpRequestRateThrottle,)

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_login_code(phone=serializer.validated_data["phone"], ip=_client_ip(request))
        return Response({"detail": OTP_DISPATCHED_DETAIL}, status=status.HTTP_200_OK)


@extend_schema(
    tags=[TAG_AUTH],
    auth=[],
    summary="Confirm login OTP",
    description=(
        "Verify the login OTP and return a JWT pair plus user profile. "
        "Customer auth is OTP-only; there is no password login endpoint."
    ),
    request=OtpVerifySerializer,
    responses={200: TokenPairSerializer},
)
class OtpVerifyView(generics.GenericAPIView):
    serializer_class = OtpVerifySerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (OtpVerifyRateThrottle,)

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = verify_login_code(**serializer.validated_data)
        return Response(_token_body(user), status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        tags=[TAG_ACCOUNT],
        summary="Get current user",
        description=(
            "Return the authenticated user's profile, including role "
            "(`user` / `admin` from `is_staff`), path, verification flag, "
            "structured identity details from the linked profile, and a list of "
            "required identity fields that are still missing. Completion means the "
            "required values are present; it is not an external identity verification."
        ),
        responses={200: UserSerializer},
    ),
    put=extend_schema(
        tags=[TAG_ACCOUNT],
        summary="Replace editable profile fields",
        description=(
            "Full update of editable account fields. "
            "Phone, email, account type, and path are read-only. "
            "Prefer `PATCH` for partial updates."
        ),
        request=UserSerializer,
        responses={200: UserSerializer},
    ),
    patch=extend_schema(
        tags=[TAG_ACCOUNT],
        summary="Update editable profile fields",
        description=(
            "Partial update. Currently editable: `first_name`, `last_name`; these are "
            "synchronized to the linked individual or legal representative profile. "
            "Phone, email, account type, path, and identity numbers cannot be changed here."
        ),
        request=UserSerializer,
        responses={200: UserSerializer},
    ),
)
class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self) -> User:
        return get_account(self.request.user)

    def update(self, request: Request, *args, **kwargs) -> Response:
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = update_account(instance, **serializer.validated_data)
        return Response(self.get_serializer(user).data)


@extend_schema(
    tags=[TAG_AUTH],
    auth=[],
    summary="Logout",
    description=(
        "Blacklist the given refresh token (body field `refresh`). "
        "If `Authorization: Bearer <access>` is also sent, "
        "that access token is denylisted immediately "
        "so it cannot be reused until expiry would have occurred."
    ),
)
class LogoutView(TokenBlacklistView):
    """Blacklist the refresh token and denylist the current access token if sent."""

    permission_classes = (permissions.AllowAny,)

    def post(self, request: Request, *args, **kwargs) -> Response:
        denylist_access_from_authorization_header(request.headers.get("Authorization"))
        return super().post(request, *args, **kwargs)


def _client_ip(request: Request) -> str:
    return request.META.get("REMOTE_ADDR") or "unknown"


def _token_body(user: User) -> dict:
    body = issue_token_pair(user)
    body["user"] = UserSerializer(user).data
    return body
