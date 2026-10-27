from django.urls import path

from apps.contracts.api.views import (
    ContractDetailView,
    ContractListCreateView,
    ContractReviewQueueView,
    ContractReviewView,
    ContractSignView,
)

app_name = "contracts"

urlpatterns = [
    path("contracts/", ContractListCreateView.as_view(), name="contract-list-create"),
    path("contracts/<uuid:uuid>/", ContractDetailView.as_view(), name="contract-detail"),
    path("contracts/<uuid:uuid>/sign/", ContractSignView.as_view(), name="contract-sign"),
    path("staff/contracts/", ContractReviewQueueView.as_view(), name="contract-review-queue"),
    path(
        "staff/contracts/<uuid:uuid>/review/",
        ContractReviewView.as_view(),
        name="contract-review",
    ),
]
