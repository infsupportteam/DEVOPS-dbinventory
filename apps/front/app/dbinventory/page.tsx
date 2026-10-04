"use client";

import { useEffect, useMemo, useState } from "react";

import AddAssetModal from "../../components/AddAssetModal";
import ColumnSelector from "../../components/ColumnSelector";
import FilterBar from "../../components/FilterBar";
import InventoryTable from "../../components/InventoryTable";
import Sidebar from "../../components/Sidebar";
import ThemeToggle from "../../components/ThemeToggle";
import {
  AssetResponse,
  CustomFieldDefinition,
  getAssets,
  getCustomFields,
  getSummary,
  InventorySummary,
} from "../../lib/api";
import {
  assetTypeLabel,
  CORE_COLUMNS,
  ENVIRONMENT_DEFAULTS,
  mergeOptions,
  STATUS_DEFAULTS,
} from "../../lib/inventory";

const DEFAULT_VISIBLE_COLUMNS = CORE_COLUMNS.map((column) => column.key);
const CHART_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

function makeDonutGradient(items: [string, number][]) {
  const total = items.reduce((sum, [, count]) => sum + count, 0);
  if (!total) return "conic-gradient(var(--chartEmpty) 0 100%)";

  let cursor = 0;
  const pieces = items.map(([, count], index) => {
    const start = cursor;
    cursor += (count / total) * 100;
    return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${cursor}%`;
  });

  return `conic-gradient(${pieces.join(", ")})`;
}

export default function DatabaseInventoryPage() {
  const [data, setData] = useState<AssetResponse | null>(null);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [assetType, setAssetType] = useState("");
  const [environment, setEnvironment] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(DEFAULT_VISIBLE_COLUMNS);

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

  const environmentChart = useMemo(
    () =>
      Object.entries(summary?.by_environment || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7),
    [summary]
  );

  const platformChart = useMemo(
    () =>
      Object.entries(summary?.by_asset_type || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7),
    [summary]
  );

  async function loadAssets() {
    setLoading(true);
    setError("");

    try {
      const result = await getAssets({
        search,
        assetType,
        environment,
        status,
        page,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard() {
    setDashboardLoading(true);
    try {
      const [summaryResult, fieldsResult] = await Promise.all([
        getSummary(),
        getCustomFields(),
      ]);
      setSummary(summaryResult);
      setCustomFields(fieldsResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard data."
      );
    } finally {
      setDashboardLoading(false);
    }
  }

  async function reloadCustomFields() {
    const fields = await getCustomFields();
    setCustomFields(fields);
  }

  useEffect(() => {
    loadAssets();
  }, [search, assetType, environment, status, page]);

  useEffect(() => {
    loadDashboard();

    try {
      const saved = window.localStorage.getItem("dbinventory-visible-columns");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setVisibleColumns(parsed);
      }
    } catch {
      // Keep defaults when local storage is unavailable or invalid.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "dbinventory-visible-columns",
        JSON.stringify(visibleColumns)
      );
    } catch {
      // Column preferences are optional.
    }
  }, [visibleColumns]);

  function applySearch() {
    setPage(1);
    setSearch(searchDraft.trim());

    if (search === searchDraft.trim() && page === 1) {
      loadAssets();
    }
  }

  function clearFilters() {
    setSearchDraft("");
    setSearch("");
    setAssetType("");
    setEnvironment("");
    setStatus("");
    setPage(1);
  }

  async function handleCreated() {
    setPage(1);
    await Promise.all([loadAssets(), loadDashboard()]);
  }

  const maxPlatformCount = Math.max(
    1,
    ...platformChart.map(([, count]) => count)
  );

  return (
    <div className="appShell">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">DATABASE OPERATIONS</span>
            <h1>Database Inventory</h1>
            <p>Central inventory for database platforms and services</p>
          </div>

          <ThemeToggle />
        </header>

        {error && <div className="pageError">{error}</div>}

        <section className="summaryGrid summaryGridFour">
          <div className="summaryCard blueCard">
            <span>Total Assets</span>
            <strong>{dashboardLoading ? "—" : summary?.total ?? 0}</strong>
            <small>All managed database assets</small>
          </div>

          <div className="summaryCard greenCard">
            <span>Production</span>
            <strong>{dashboardLoading ? "—" : summary?.production ?? 0}</strong>
            <small>Production environment</small>
          </div>

          <div className="summaryCard orangeCard">
            <span>Non-Production</span>
            <strong>{dashboardLoading ? "—" : summary?.non_production ?? 0}</strong>
            <small>UAT, QA, Dev, DR and others</small>
          </div>

          <div className="summaryCard cyanCard">
            <span>Active / In Use</span>
            <strong>{dashboardLoading ? "—" : summary?.active ?? 0}</strong>
            <small>Operational status</small>
          </div>
        </section>

        <section className="analyticsGrid">
          <div className="chartCard">
            <div className="cardHeading">
              <div>
                <strong>Environment Mix</strong>
                <span>Where database assets are running</span>
              </div>
            </div>

            <div className="donutLayout">
              <div
                className="donutChart"
                style={{ background: makeDonutGradient(environmentChart) }}
              >
                <div className="donutCenter">
                  <strong>{summary?.total ?? 0}</strong>
                  <span>ASSETS</span>
                </div>
              </div>

              <div className="chartLegend">
                {environmentChart.length === 0 && (
                  <span className="mutedText">No environment data yet.</span>
                )}

                {environmentChart.map(([label, count], index) => (
                  <div className="legendRow" key={label}>
                    <span
                      className="legendDot"
                      style={{
                        background: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <span>{label}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chartCard">
            <div className="cardHeading">
              <div>
                <strong>Assets by Platform</strong>
                <span>SQL Server, Oracle, MySQL and other technologies</span>
              </div>
            </div>

            <div className="barChart">
              {platformChart.length === 0 && (
                <span className="mutedText">No platform data yet.</span>
              )}

              {platformChart.map(([platform, count], index) => (
                <div className="barRow" key={platform}>
                  <div className="barLabel">
                    <span>{assetTypeLabel(platform)}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="barTrack">
                    <div
                      className="barFill"
                      style={{
                        width: `${(count / maxPlatformCount) * 100}%`,
                        background: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="toolbar">
            <FilterBar
              searchDraft={searchDraft}
              assetType={assetType}
              environment={environment}
              status={status}
              environmentOptions={environmentOptions}
              statusOptions={statusOptions}
              onSearchDraftChange={setSearchDraft}
              onAssetTypeChange={(value) => {
                setAssetType(value);
                setPage(1);
              }}
              onEnvironmentChange={(value) => {
                setEnvironment(value);
                setPage(1);
              }}
              onStatusChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              onSearch={applySearch}
              onClear={clearFilters}
            />

            <div className="toolbarSpacer" />

            <ColumnSelector
              visibleColumns={visibleColumns}
              onVisibleColumnsChange={setVisibleColumns}
              customFields={customFields}
              onCustomFieldsChanged={reloadCustomFields}
            />

            <button className="primaryButton" onClick={() => setAddOpen(true)}>
              + Add Asset
            </button>
          </div>

          <div className="activeFilterLine">
            <span>
              {assetType ? `Platform: ${assetTypeLabel(assetType)}` : "All Platforms"}
            </span>
            <span>{environment || "All Environments"}</span>
            <span>{status || "All Statuses"}</span>
          </div>

          <InventoryTable
            assets={data?.results || []}
            loading={loading}
            visibleColumns={visibleColumns}
            customFields={customFields}
          />

          <div className="pagination">
            <span>
              {data ? `Showing ${data.results.length} of ${data.count}` : ""}
            </span>

            <div>
              <button
                disabled={!data?.previous}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </button>

              <span className="pageNumber">{page}</span>

              <button
                disabled={!data?.next}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <AddAssetModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={handleCreated}
          customFields={customFields}
          environmentOptions={environmentOptions}
          statusOptions={statusOptions}
        />
      </main>
    </div>
  );
}
