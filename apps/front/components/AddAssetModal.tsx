"use client";

import { FormEvent, useEffect, useState } from "react";

import { createAsset, CustomFieldDefinition, DatabaseAsset } from "../lib/api";
import AssetFormFields, { AssetFormState } from "./AssetFormFields";

const EMPTY_FORM: AssetFormState = {
  server_name: "",
  fqdn: "",
  ip_address: "",
  asset_type: "sql_server",
  dbms: "",
  version: "",
  environment: "Production",
  application: "",
  status: "In Use",
  os_version: "",
  notes: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (asset: DatabaseAsset) => void | Promise<void>;
  customFields: CustomFieldDefinition[];
  environmentOptions: string[];
  statusOptions: string[];
};

export default function AddAssetModal({
  open,
  onClose,
  onCreated,
  customFields,
  environmentOptions,
  statusOptions,
}: Props) {
  const [values, setValues] = useState<AssetFormState>(EMPTY_FORM);
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setValues(EMPTY_FORM);
      setCustomValues({});
      setError("");
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const asset = await createAsset({
        ...values,
        ip_address: values.ip_address || null,
        custom_fields: customValues,
      });
      await onCreated(asset);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create asset.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div
        className="modalCard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-asset-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modalHeader">
          <div>
            <span className="eyebrow">DATABASE INVENTORY</span>
            <h2 id="add-asset-title">Add Asset</h2>
          </div>
          <button className="iconButton" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modalBody">
            {error && <div className="errorBanner">{error}</div>}

            <AssetFormFields
              values={values}
              onChange={(name, value) =>
                setValues((current) => ({ ...current, [name]: value }))
              }
              customFields={customFields}
              customValues={customValues}
              onCustomChange={(name, value) =>
                setCustomValues((current) => ({ ...current, [name]: value }))
              }
              environmentOptions={environmentOptions}
              statusOptions={statusOptions}
            />
          </div>

          <div className="modalFooter">
            <button type="button" className="secondaryButton" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primaryButton" disabled={saving}>
              {saving ? "Creating..." : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
