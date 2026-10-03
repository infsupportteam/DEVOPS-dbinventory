from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CustomFieldDefinitionViewSet, DatabaseAssetViewSet, health

router = DefaultRouter()
router.register("assets", DatabaseAssetViewSet, basename="asset")
router.register("custom-fields", CustomFieldDefinitionViewSet, basename="custom-field")

urlpatterns = [
    path("health/", health),
    path("", include(router.urls)),
]
