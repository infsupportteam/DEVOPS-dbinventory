"use client";

import { FormEvent, useMemo, useState } from "react";

import {
  CustomFieldDefinition,
  DatabaseAsset,
  deleteAsset,
  updateAsset,
} from "../lib/api";
import AssetFormFields, { AssetFormState } from "./AssetFormFields";

type Props = {
  asset: DatabaseAsset;
  customFields: CustomFieldDefinition[];
  environmentOptions: string[];
  statusOptions: string[];
  onSaved: (asset: DatabaseAsset) => void;
  onDeleted: () => void;
};

export default function EditAssetForm({
  asset,
  customFields,
  environmentOptions,
  statusOptions,
  onSaved,
  onDeleted,
}: Props) {
  const initialCustomValues = useMemo(
    () =>
      Object.fromEntries(
        (asset.custom_values || []).map((item) => [item.field_name, item.value])
      ),
    [asset.custom_values]
  );

  const [values, setValues] = useState<AssetFormState>({
    server_name: asset.server_name || "",
    fqdn: asset.fqdn || "",
    ip_address: asset.ip_address || "",
    asset_type: asset.asset_type || "other",
    dbms: asset.dbms || "",
    version: asset.version || "",
    environment: asset.environment || "",
    application: asset.application || "",
    status: asset.status || "In Use",
    os_version: asset.os_version || "",
    notes: asset.notes || "",
  });
  const [customValues, setCustomValues] =
    useState<Record<string, unknown>>(initialCustomValues);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updated = await updateAsset(asset.id, {
        ...values,
        ip_address: values.ip_address || null,
        custom_fields: customValues,
      });
      onSaved(updated);
      setMessage("Asset updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update asset.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete ${asset.server_name || "this asset"}? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteAsset(asset.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete asset.");
      setDeleting(false);
    }
  }

  return (
    <form className="editForm" onSubmit={handleSubmit}>
      {message && <div className="successBanner">{message}</div>}
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

      <div className="detailActions">
        <button
          type="button"
          className="dangerButton"
          onClick={handleDelete}
          disabled={deleting || saving}
        >
          {deleting ? "Deleting..." : "Delete Asset"}
        </button>

        <div className="toolbarSpacer" />

        <button type="submit" className="primaryButton" disabled={saving || deleting}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
