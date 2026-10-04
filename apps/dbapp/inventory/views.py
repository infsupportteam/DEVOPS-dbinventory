from django.db.models import Count, Q
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import CustomFieldDefinition, DatabaseAsset
from .serializers import CustomFieldDefinitionSerializer, DatabaseAssetSerializer


@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "service": "dbinventory"})


def _count_by(queryset, field_name):
    rows = (
        queryset.values(field_name)
        .annotate(count=Count("id"))
        .order_by("-count", field_name)
    )
    result = {}
    for row in rows:
        key = row[field_name] or "Unspecified"
        result[key] = row["count"]
    return result


@api_view(["GET"])
def summary(request):
    queryset = DatabaseAsset.objects.all()

    production_filter = (
        Q(environment__iexact="production")
        | Q(environment__iexact="prod")
        | Q(environment__iexact="prd")
    )
    active_filter = Q(status__iexact="active") | Q(status__iexact="in use")

    total = queryset.count()
    production = queryset.filter(production_filter).count()
    unspecified_environment = queryset.filter(environment="").count()
    non_production = queryset.exclude(production_filter).exclude(environment="").count()
    active = queryset.filter(active_filter).count()

    return Response(
        {
            "total": total,
            "production": production,
            "non_production": non_production,
            "unspecified_environment": unspecified_environment,
            "active": active,
            "by_asset_type": _count_by(queryset, "asset_type"),
            "by_environment": _count_by(queryset, "environment"),
            "by_status": _count_by(queryset, "status"),
        }
    )


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
                | Q(version__icontains=search)
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
