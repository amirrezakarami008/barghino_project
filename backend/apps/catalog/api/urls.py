from django.urls import path

from apps.catalog.api.plan_views import SellPlanDetailView, SellPlanListCreateView
from apps.catalog.api.views import (
    EquipmentDetailView,
    EquipmentEstimateView,
    EquipmentListCreateView,
)

app_name = "catalog"

urlpatterns = [
    path("plans/", SellPlanListCreateView.as_view(), name="plans-list-create"),
    path("plans/<uuid:uuid>/", SellPlanDetailView.as_view(), name="plans-detail"),
    path("equipment/", EquipmentListCreateView.as_view(), name="equipment-list-create"),
    path("equipment/estimate/", EquipmentEstimateView.as_view(), name="equipment-estimate"),
    path("equipment/<uuid:uuid>/", EquipmentDetailView.as_view(), name="equipment-detail"),
]
