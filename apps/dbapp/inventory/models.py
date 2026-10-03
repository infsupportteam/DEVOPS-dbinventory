from django.db import models


class DatabaseAsset(models.Model):
    class AssetType(models.TextChoices):
        SQL_SERVER = "sql_server", "SQL Server"
        ORACLE = "oracle", "Oracle"
        MYSQL = "mysql", "MySQL"
        AZURE_SQL = "azure_sql", "Azure SQL"
        WEBLOGIC = "weblogic", "Oracle WebLogic"
        ZEN = "zen", "ZEN"
        OTHER = "other", "Other"

    server_name = models.CharField(max_length=255, blank=True)
    fqdn = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    asset_type = models.CharField(
        max_length=30,
        choices=AssetType.choices,
        default=AssetType.OTHER,
    )

    dbms = models.CharField(max_length=100, blank=True)
    version = models.CharField(max_length=100, blank=True)
    internal_version = models.CharField(max_length=100, blank=True)
    edition = models.CharField(max_length=100, blank=True)

    environment = models.CharField(max_length=100, blank=True)
    application = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=100, default="In Use")

    os_version = models.CharField(max_length=255, blank=True)
    architecture = models.CharField(max_length=50, blank=True)

    location = models.CharField(max_length=255, blank=True)
    network = models.CharField(max_length=255, blank=True)

    resource_type = models.CharField(max_length=255, blank=True)
    resource_group = models.CharField(max_length=255, blank=True)
    subscription = models.CharField(max_length=255, blank=True)

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["server_name", "id"]

    def __str__(self):
        return self.server_name or f"Asset {self.pk}"


class CustomFieldDefinition(models.Model):
    class FieldType(models.TextChoices):
        TEXT = "text", "Text"
        NUMBER = "number", "Number"
        BOOLEAN = "boolean", "Yes / No"
        DATE = "date", "Date"
        SELECT = "select", "Dropdown"

    name = models.SlugField(max_length=100, unique=True)
    label = models.CharField(max_length=150)

    field_type = models.CharField(
        max_length=20,
        choices=FieldType.choices,
        default=FieldType.TEXT,
    )

    options = models.JSONField(default=list, blank=True)
    enabled = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "label"]

    def __str__(self):
        return self.label


class AssetCustomValue(models.Model):
    asset = models.ForeignKey(
        DatabaseAsset,
        related_name="custom_values",
        on_delete=models.CASCADE,
    )

    field = models.ForeignKey(
        CustomFieldDefinition,
        related_name="values",
        on_delete=models.CASCADE,
    )

    value = models.JSONField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["asset", "field"],
                name="unique_asset_custom_field",
            )
        ]


class DatabaseRecord(models.Model):
    asset = models.ForeignKey(
        DatabaseAsset,
        related_name="databases",
        on_delete=models.CASCADE,
    )

    database_name = models.CharField(max_length=255)
    application = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.database_name
