from django.urls import path

from apps.accounts.api.views import (
    DocumentedTokenVerifyView,
    LogoutView,
    MeView,
    OtpRequestView,
    OtpVerifyView,
    RegisterVerifyView,
    RegisterView,
    ThrottledTokenRefreshView,
)

app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register/verify/", RegisterVerifyView.as_view(), name="register-verify"),
    path("otp/request/", OtpRequestView.as_view(), name="otp-request"),
    path("otp/verify/", OtpVerifyView.as_view(), name="otp-verify"),
    path("token/refresh/", ThrottledTokenRefreshView.as_view(), name="token-refresh"),
    path("token/verify/", DocumentedTokenVerifyView.as_view(), name="token-verify"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
]
