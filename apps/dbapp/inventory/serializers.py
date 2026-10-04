from django.db import transaction
from rest_framework import serializers

from .models import AssetCustomValue, CustomFieldDefinition, DatabaseAsset, DatabaseRecord


class AssetCustomValueSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(source="field.name", read_only=True)
    field_label = serializers.CharField(source="field.label", read_only=True)
    field_type = serializers.CharField(source="field.field_type", read_only=True)

    class Meta:
        model = AssetCustomValue
        fields = ["field", "field_name", "field_label", "field_type", "value"]


class DatabaseRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseRecord
        fields = ["id", "database_name", "application", "status"]


class DatabaseAssetSerializer(serializers.ModelSerializer):
    custom_values = AssetCustomValueSerializer(many=True, read_only=True)
    custom_fields = serializers.DictField(
        child=serializers.JSONField(allow_null=True),
        write_only=True,
        required=False,
    )
    databases = DatabaseRecordSerializer(many=True, read_only=True)

    class Meta:
        model = DatabaseAsset
        fields = [
            "id",
            "server_name",
            "fqdn",
            "ip_address",
            "asset_type",
            "dbms",
            "version",
            "internal_version",
            "edition",
            "environment",
            "application",
            "status",
            "os_version",
            "architecture",
            "location",
            "network",
            "resource_type",
            "resource_group",
            "subscription",
            "notes",
            "created_at",
            "updated_at",
            "custom_values",
            "custom_fields",
            "databases",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_server_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Server name is required.")
        return value.strip()

    def validate_custom_fields(self, values):
        names = set(values.keys())
        known = set(
            CustomFieldDefinition.objects.filter(name__in=names).values_list("name", flat=True)
        )
        unknown = sorted(names - known)
        if unknown:
            raise serializers.ValidationError(
                f"Unknown custom field(s): {', '.join(unknown)}"
            )
        return values

    def _save_custom_fields(self, asset, values):
        if not values:
            return

        definitions = {
            field.name: field
            for field in CustomFieldDefinition.objects.filter(name__in=values.keys())
        }

        for name, value in values.items():
            field = definitions[name]

            if value is None or value == "":
                AssetCustomValue.objects.filter(asset=asset, field=field).delete()
                continue

            AssetCustomValue.objects.update_or_create(
                asset=asset,
                field=field,
                defaults={"value": value},
            )

    @transaction.atomic
    def create(self, validated_data):
        custom_fields = validated_data.pop("custom_fields", {})
        asset = super().create(validated_data)
        self._save_custom_fields(asset, custom_fields)
        return asset

    @transaction.atomic
    def update(self, instance, validated_data):
        custom_fields = validated_data.pop("custom_fields", {})
        asset = super().update(instance, validated_data)
        self._save_custom_fields(asset, custom_fields)
        return asset


class CustomFieldDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomFieldDefinition
        fields = "__all__"

    def validate_name(self, value):
        return value.strip().lower().replace(" ", "_")
