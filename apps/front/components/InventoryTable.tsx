"use client";

import { useRouter } from "next/navigation";

import { CustomFieldDefinition, DatabaseAsset } from "../lib/api";
import {
  assetTypeLabel,
  CORE_COLUMNS,
  environmentClassName,
  getCustomValue,
  statusClassName,
} from "../lib/inventory";

type Props = {
  assets: DatabaseAsset[];
  loading: boolean;
  visibleColumns: string[];
  customFields: CustomFieldDefinition[];
};

function renderValue(asset: DatabaseAsset, key: string) {
  switch (key) {
    case "asset_type":
      return <span className="typeBadge">{assetTypeLabel(asset.asset_type)}</span>;
    case "server_name":
      return <span className="serverLink">{asset.server_name || "Unnamed Asset"}</span>;
    case "dbms":
      return asset.dbms || "—";
    case "version":
      return asset.version || "—";
    case "ip_address":
      return asset.ip_address || "—";
    case "environment":
      return asset.environment ? (
        <span className={environmentClassName(asset.environment)}>
          {asset.environment}
        </span>
      ) : (
        "—"
      );
    case "application":
      return asset.application || "—";
    case "status":
      return (
        <span className={statusClassName(asset.status || "")}>
          {asset.status || "—"}
        </span>
      );
    case "updated_at":
      return asset.updated_at
        ? new Date(asset.updated_at).toLocaleDateString()
        : "—";
    default:
      return "—";
  }
}

function displayCustomValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export default function InventoryTable({
  assets,
  loading,
  visibleColumns,
  customFields,
}: Props) {
  const router = useRouter();

  const coreColumns = CORE_COLUMNS.filter((column) =>
    visibleColumns.includes(column.key)
  );
  const shownCustomFields = customFields.filter((field) =>
    visibleColumns.includes(`custom:${field.name}`)
  );
  const colSpan = Math.max(1, coreColumns.length + shownCustomFields.length);

  return (
    <div className="tableWrapper">
      <table>
        <thead>
          <tr>
            {coreColumns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {shownCustomFields.map((field) => (
              <th key={`custom:${field.name}`}>{field.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={colSpan} className="emptyState">
                Loading inventory...
              </td>
            </tr>
          )}

          {!loading && assets.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="emptyState">
                No assets match the current filters.
              </td>
            </tr>
          )}

          {!loading &&
            assets.map((asset) => (
              <tr
                key={asset.id}
                className="clickableRow"
                tabIndex={0}
                onClick={() => router.push(`/dbinventory/${asset.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    router.push(`/dbinventory/${asset.id}`);
                  }
                }}
              >
                {coreColumns.map((column) => (
                  <td key={column.key}>{renderValue(asset, column.key)}</td>
                ))}

                {shownCustomFields.map((field) => (
                  <td key={`custom:${field.name}`}>
                    {displayCustomValue(
                      getCustomValue(asset.custom_values, field.name)
                    )}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
