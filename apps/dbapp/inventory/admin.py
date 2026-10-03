from django.contrib import admin
from .models import AssetCustomValue, CustomFieldDefinition, DatabaseAsset, DatabaseRecord


@admin.register(DatabaseAsset)
class DatabaseAssetAdmin(admin.ModelAdmin):
    list_display = (
        "server_name",
        "asset_type",
        "dbms",
        "version",
        "environment",
        "status",
    )

    search_fields = (
        "server_name",
        "fqdn",
        "ip_address",
        "application",
    )

    list_filter = (
        "asset_type",
        "environment",
        "status",
    )


admin.site.register(CustomFieldDefinition)
admin.site.register(AssetCustomValue)
admin.site.register(DatabaseRecord)
