import { CustomValue } from "./api";

export const ASSET_TYPES = [
  { value: "", label: "All Platforms" },
  { value: "sql_server", label: "SQL Server" },
  { value: "oracle", label: "Oracle" },
  { value: "mysql", label: "MySQL" },
  { value: "azure_sql", label: "Azure SQL" },
  { value: "weblogic", label: "Oracle WebLogic" },
  { value: "zen", label: "ZEN" },
  { value: "other", label: "Other" },
];

export const ENVIRONMENT_DEFAULTS = [
  "Production",
  "UAT",
  "QA/Test",
  "Development",
  "DR",
  "Other",
];

export const STATUS_DEFAULTS = [
  "In Use",
  "Active",
  "Maintenance",
  "Planned",
  "Decommissioned",
];

export const CORE_COLUMNS = [
  { key: "asset_type", label: "Platform" },
  { key: "server_name", label: "Server Name" },
  { key: "dbms", label: "DBMS / Technology" },
  { key: "version", label: "Version" },
  { key: "ip_address", label: "IP Address" },
  { key: "environment", label: "Environment" },
  { key: "application", label: "Application" },
  { key: "status", label: "Status" },
  { key: "updated_at", label: "Updated" },
] as const;

export type CoreColumnKey = (typeof CORE_COLUMNS)[number]["key"];

export function assetTypeLabel(value: string) {
  return ASSET_TYPES.find((item) => item.value === value)?.label || value || "Other";
}

export function getCustomValue(values: CustomValue[] | undefined, fieldName: string) {
  return values?.find((item) => item.field_name === fieldName)?.value;
}

export function environmentClassName(value: string) {
  const normalized = value.toLowerCase();
  if (["production", "prod", "prd"].includes(normalized)) return "environmentBadge production";
  if (normalized.includes("uat")) return "environmentBadge uat";
  if (normalized.includes("dev")) return "environmentBadge development";
  if (normalized.includes("qa") || normalized.includes("test")) return "environmentBadge qa";
  if (normalized === "dr" || normalized.includes("disaster")) return "environmentBadge dr";
  return "environmentBadge neutral";
}

export function statusClassName(value: string) {
  const normalized = value.toLowerCase();
  if (["active", "in use"].includes(normalized)) return "statusBadge healthy";
  if (normalized.includes("maint") || normalized.includes("plan")) return "statusBadge warning";
  if (normalized.includes("decommission") || normalized.includes("retired")) return "statusBadge danger";
  return "statusBadge neutral";
}

export function mergeOptions(defaults: string[], dynamic: string[]) {
  const seen = new Set<string>();
  return [...defaults, ...dynamic]
    .filter((value) => value && value !== "Unspecified")
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
