from django.db.models import Q
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import CustomFieldDefinition, DatabaseAsset
from .serializers import CustomFieldDefinitionSerializer, DatabaseAssetSerializer


@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "service": "dbinventory"})


class DatabaseAssetViewSet(viewsets.ModelViewSet):
    serializer_class = DatabaseAssetSerializer
    filter_backends = [filters.OrderingFilter]

    ordering_fields = [
        "server_name",
        "asset_type",
        "dbms",
        "version",
        "environment",
        "status",
        "updated_at",
    ]

    def get_queryset(self):
        queryset = DatabaseAsset.objects.all().prefetch_related(
            "custom_values__field",
            "databases",
        )

        search = self.request.query_params.get("search")
        asset_type = self.request.query_params.get("asset_type")
        environment = self.request.query_params.get("environment")
        status = self.request.query_params.get("status")

        if search:
            queryset = queryset.filter(
                Q(server_name__icontains=search)
                | Q(fqdn__icontains=search)
                | Q(ip_address__icontains=search)
                | Q(application__icontains=search)
                | Q(dbms__icontains=search)
            )

        if asset_type:
            queryset = queryset.filter(asset_type=asset_type)

        if environment:
            queryset = queryset.filter(environment__iexact=environment)

        if status:
            queryset = queryset.filter(status__iexact=status)

        return queryset


class CustomFieldDefinitionViewSet(viewsets.ModelViewSet):
    queryset = CustomFieldDefinition.objects.all()
    serializer_class = CustomFieldDefinitionSerializer
