"use client";

import { FormEvent, useState } from "react";

import {
  createCustomField,
  CustomFieldDefinition,
  deleteCustomField,
} from "../lib/api";
import { CORE_COLUMNS } from "../lib/inventory";

type Props = {
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
  customFields: CustomFieldDefinition[];
  onCustomFieldsChanged: () => void | Promise<void>;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function ColumnSelector({
  visibleColumns,
  onVisibleColumnsChange,
  customFields,
  onCustomFieldsChanged,
}: Props) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] =
    useState<CustomFieldDefinition["field_type"]>("text");
  const [optionsText, setOptionsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggle(key: string) {
    if (visibleColumns.includes(key)) {
      onVisibleColumnsChange(visibleColumns.filter((item) => item !== key));
    } else {
      onVisibleColumnsChange([...visibleColumns, key]);
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const name = slugify(label);

    if (!name) {
      setError("Enter a column name.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const field = await createCustomField({
        name,
        label: label.trim(),
        field_type: fieldType,
        options:
          fieldType === "select"
            ? optionsText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        enabled: true,
        sort_order: 100,
      });

      onVisibleColumnsChange([...visibleColumns, `custom:${field.name}`]);
      setLabel("");
      setFieldType("text");
      setOptionsText("");
      await onCustomFieldsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create column.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(field: CustomFieldDefinition) {
    if (
      !window.confirm(
        `Delete custom column "${field.label}"? Existing values for this column will also be deleted.`
      )
    ) {
      return;
    }

    setError("");

    try {
      await deleteCustomField(field.id);
      onVisibleColumnsChange(
        visibleColumns.filter((item) => item !== `custom:${field.name}`)
      );
      await onCustomFieldsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete column.");
    }
  }

  return (
    <div className="columnControl">
      <button
        type="button"
        className="secondaryButton"
        onClick={() => setOpen((value) => !value)}
      >
        Columns
      </button>

      {open && (
        <div className="columnPopover">
          <div className="popoverHeader">
            <div>
              <strong>Manage Columns</strong>
              <span>Choose what appears in the inventory table.</span>
            </div>
            <button
              type="button"
              className="iconButton"
              onClick={() => setOpen(false)}
              aria-label="Close columns"
            >
              ×
            </button>
          </div>

          <div className="columnSection">
            <span className="columnSectionTitle">Core fields</span>
            <div className="checkboxGrid">
              {CORE_COLUMNS.map((column) => (
                <label className="checkboxRow" key={column.key}>
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.key)}
                    onChange={() => toggle(column.key)}
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="columnSection">
            <span className="columnSectionTitle">Custom fields</span>

            {customFields.length === 0 ? (
              <p className="mutedText">No custom columns yet.</p>
            ) : (
              customFields.map((field) => (
                <div className="customFieldRow" key={field.id}>
                  <label className="checkboxRow">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(`custom:${field.name}`)}
                      onChange={() => toggle(`custom:${field.name}`)}
                    />
                    <span>{field.label}</span>
                  </label>
                  <button
                    className="textDangerButton"
                    type="button"
                    onClick={() => handleDelete(field)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>

          <form className="newColumnForm" onSubmit={handleCreate}>
            <span className="columnSectionTitle">Add custom column</span>

            {error && <div className="errorText">{error}</div>}

            <input
              placeholder="Column name"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />

            <select
              value={fieldType}
              onChange={(event) =>
                setFieldType(
                  event.target.value as CustomFieldDefinition["field_type"]
                )
              }
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Yes / No</option>
              <option value="date">Date</option>
              <option value="select">Dropdown</option>
            </select>

            {fieldType === "select" && (
              <input
                placeholder="Options, comma separated"
                value={optionsText}
                onChange={(event) => setOptionsText(event.target.value)}
              />
            )}

            <button className="primaryButton" type="submit" disabled={saving}>
              {saving ? "Adding..." : "+ Add Custom Column"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
