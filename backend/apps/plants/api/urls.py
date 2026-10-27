from django.urls import path

from apps.plants.api.views import (
    BranchDetailView,
    BranchListCreateView,
    BranchReviewQueueView,
    BranchReviewView,
    PlantDetailView,
    PlantListCreateView,
    PlantReviewQueueView,
    PlantReviewView,
)

app_name = "plants"

urlpatterns = [
    path("branches/", BranchListCreateView.as_view(), name="branch-list-create"),
    path("branches/<uuid:uuid>/", BranchDetailView.as_view(), name="branch-detail"),
    path("plants/", PlantListCreateView.as_view(), name="plant-list-create"),
    path("plants/<uuid:uuid>/", PlantDetailView.as_view(), name="plant-detail"),
    path("staff/branches/", BranchReviewQueueView.as_view(), name="branch-review-queue"),
    path("staff/branches/<uuid:uuid>/review/", BranchReviewView.as_view(), name="branch-review"),
    path("staff/plants/", PlantReviewQueueView.as_view(), name="plant-review-queue"),
    path("staff/plants/<uuid:uuid>/review/", PlantReviewView.as_view(), name="plant-review"),
]
