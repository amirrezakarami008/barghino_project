from django.urls import path

from apps.core.views import health_check, health_live, health_ready

app_name = "core"

urlpatterns = [
    path("", health_check, name="health-check"),
    path("live/", health_live, name="health-live"),
    path("ready/", health_ready, name="health-ready"),
]
