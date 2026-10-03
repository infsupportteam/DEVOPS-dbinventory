from rest_framework import serializers
from .models import AssetCustomValue, CustomFieldDefinition, DatabaseAsset, DatabaseRecord


class AssetCustomValueSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(source="field.name", read_only=True)
    field_label = serializers.CharField(source="field.label", read_only=True)

    class Meta:
        model = AssetCustomValue
        fields = ["field", "field_name", "field_label", "value"]


class DatabaseRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseRecord
        fields = ["id", "database_name", "application", "status"]


class DatabaseAssetSerializer(serializers.ModelSerializer):
    custom_values = AssetCustomValueSerializer(many=True, read_only=True)
    databases = DatabaseRecordSerializer(many=True, read_only=True)

    class Meta:
        model = DatabaseAsset
        fields = "__all__"


class CustomFieldDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomFieldDefinition
        fields = "__all__"
