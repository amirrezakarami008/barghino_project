from django.urls import path

from apps.files.api.views import (
    StoredFileContentView,
    StoredFileDetailView,
    StoredFileListCreateView,
)

app_name = "files"

urlpatterns = [
    path("", StoredFileListCreateView.as_view(), name="list-create"),
    path("<uuid:uuid>/", StoredFileDetailView.as_view(), name="detail"),
    path("<uuid:uuid>/content/", StoredFileContentView.as_view(), name="content"),
]
