"use client";

import { CustomFieldDefinition } from "../lib/api";
import {
  ASSET_TYPES,
  ENVIRONMENT_DEFAULTS,
  STATUS_DEFAULTS,
  mergeOptions,
} from "../lib/inventory";

export type AssetFormState = {
  server_name: string;
  fqdn: string;
  ip_address: string;
  asset_type: string;
  dbms: string;
  version: string;
  environment: string;
  application: string;
  status: string;
  os_version: string;
  notes: string;
};

type Props = {
  values: AssetFormState;
  onChange: (name: keyof AssetFormState, value: string) => void;
  customFields: CustomFieldDefinition[];
  customValues: Record<string, unknown>;
  onCustomChange: (name: string, value: unknown) => void;
  environmentOptions?: string[];
  statusOptions?: string[];
};

function renderCustomInput(
  field: CustomFieldDefinition,
  value: unknown,
  onChange: (value: unknown) => void
) {
  const displayValue = value === null || value === undefined ? "" : String(value);

  if (field.field_type === "boolean") {
    return (
      <select
        value={displayValue}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? null : raw === "true");
        }}
      >
        <option value="">Not set</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (field.field_type === "select") {
    return (
      <select value={displayValue} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select...</option>
        {(field.options || []).map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={
        field.field_type === "number"
          ? "number"
          : field.field_type === "date"
            ? "date"
            : "text"
      }
      value={displayValue}
      onChange={(event) => {
        if (field.field_type === "number") {
          onChange(event.target.value === "" ? null : Number(event.target.value));
        } else {
          onChange(event.target.value);
        }
      }}
    />
  );
}

export default function AssetFormFields({
  values,
  onChange,
  customFields,
  customValues,
  onCustomChange,
  environmentOptions = [],
  statusOptions = [],
}: Props) {
  const environments = mergeOptions(ENVIRONMENT_DEFAULTS, environmentOptions);
  const statuses = mergeOptions(STATUS_DEFAULTS, statusOptions);

  return (
    <>
      <div className="formSectionTitle">Core details</div>

      <div className="formGrid">
        <label>
          <span>Server Name *</span>
          <input
            value={values.server_name}
            onChange={(event) => onChange("server_name", event.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          <span>Platform *</span>
          <select
            value={values.asset_type}
            onChange={(event) => onChange("asset_type", event.target.value)}
          >
            {ASSET_TYPES.filter((item) => item.value).map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>FQDN</span>
          <input
            value={values.fqdn}
            onChange={(event) => onChange("fqdn", event.target.value)}
          />
        </label>

        <label>
          <span>IP Address</span>
          <input
            value={values.ip_address}
            placeholder="10.10.10.10"
            onChange={(event) => onChange("ip_address", event.target.value)}
          />
        </label>

        <label>
          <span>DBMS / Technology</span>
          <input
            value={values.dbms}
            placeholder="SQL Server, Oracle DB, WebLogic..."
            onChange={(event) => onChange("dbms", event.target.value)}
          />
        </label>

        <label>
          <span>Version</span>
          <input
            value={values.version}
            onChange={(event) => onChange("version", event.target.value)}
          />
        </label>

        <label>
          <span>Environment</span>
          <select
            value={values.environment}
            onChange={(event) => onChange("environment", event.target.value)}
          >
            <option value="">Not set</option>
            {values.environment &&
              !environments.some(
                (item) => item.toLowerCase() === values.environment.toLowerCase()
              ) && (
                <option value={values.environment}>{values.environment}</option>
              )}
            {environments.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Status</span>
          <select
            value={values.status}
            onChange={(event) => onChange("status", event.target.value)}
          >
            {values.status &&
              !statuses.some(
                (item) => item.toLowerCase() === values.status.toLowerCase()
              ) && <option value={values.status}>{values.status}</option>}
            {statuses.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="formSpan2">
          <span>Application</span>
          <input
            value={values.application}
            onChange={(event) => onChange("application", event.target.value)}
          />
        </label>

        <label className="formSpan2">
          <span>OS Version</span>
          <input
            value={values.os_version}
            onChange={(event) => onChange("os_version", event.target.value)}
          />
        </label>

        <label className="formSpan2">
          <span>Notes</span>
          <textarea
            rows={4}
            value={values.notes}
            onChange={(event) => onChange("notes", event.target.value)}
          />
        </label>
      </div>

      {customFields.filter((field) => field.enabled).length > 0 && (
        <>
          <div className="formSectionTitle">Custom fields</div>
          <div className="formGrid">
            {customFields
              .filter((field) => field.enabled)
              .map((field) => (
                <label key={field.id}>
                  <span>{field.label}</span>
                  {renderCustomInput(
                    field,
                    customValues[field.name],
                    (value) => onCustomChange(field.name, value)
                  )}
                </label>
              ))}
          </div>
        </>
      )}
    </>
  );
}
