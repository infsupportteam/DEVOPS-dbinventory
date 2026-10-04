"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import EditAssetForm from "../../../components/EditAssetForm";
import Sidebar from "../../../components/Sidebar";
import ThemeToggle from "../../../components/ThemeToggle";
import {
  CustomFieldDefinition,
  DatabaseAsset,
  getAsset,
  getCustomFields,
  getSummary,
  InventorySummary,
} from "../../../lib/api";
import {
  assetTypeLabel,
  ENVIRONMENT_DEFAULTS,
  mergeOptions,
  STATUS_DEFAULTS,
} from "../../../lib/inventory";

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [asset, setAsset] = useState<DatabaseAsset | null>(null);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const environmentOptions = useMemo(
    () =>
      mergeOptions(
        ENVIRONMENT_DEFAULTS,
        Object.keys(summary?.by_environment || {})
      ),
    [summary]
  );

  const statusOptions = useMemo(
    () =>
      mergeOptions(STATUS_DEFAULTS, Object.keys(summary?.by_status || {})),
    [summary]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const [assetResult, fieldsResult, summaryResult] = await Promise.all([
          getAsset(id),
          getCustomFields(),
          getSummary(),
        ]);
        setAsset(assetResult);
        setCustomFields(fieldsResult);
        setSummary(summaryResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load asset.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <div className="appShell">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <Link href="/dbinventory" className="backLink">
              ← Back to Inventory
            </Link>
            <h1>{asset?.server_name || "Asset Details"}</h1>
            <p>
              {asset
                ? `${assetTypeLabel(asset.asset_type)} · ${asset.environment || "Environment not set"}`
                : "View and edit database inventory details"}
            </p>
          </div>

          <ThemeToggle />
        </header>

        <section className="detailPage">
          {loading && <div className="detailCard">Loading asset...</div>}

          {error && <div className="errorBanner">{error}</div>}

          {!loading && asset && (
            <>
              <div className="detailSummary">
                <div>
                  <span>Asset ID</span>
                  <strong>#{asset.id}</strong>
                </div>
                <div>
                  <span>Platform</span>
                  <strong>{assetTypeLabel(asset.asset_type)}</strong>
                </div>
                <div>
                  <span>Environment</span>
                  <strong>{asset.environment || "—"}</strong>
                </div>
                <div>
                  <span>Last Updated</span>
                  <strong>
                    {asset.updated_at
                      ? new Date(asset.updated_at).toLocaleString()
                      : "—"}
                  </strong>
                </div>
              </div>

              <div className="detailCard">
                <div className="cardHeading">
                  <div>
                    <strong>Edit Asset</strong>
                    <span>
                      Update core fields and any custom inventory columns.
                    </span>
                  </div>
                </div>

                <EditAssetForm
                  key={asset.id}
                  asset={asset}
                  customFields={customFields}
                  environmentOptions={environmentOptions}
                  statusOptions={statusOptions}
                  onSaved={setAsset}
                  onDeleted={() => router.push("/dbinventory")}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
