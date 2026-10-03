"use client";

import { useEffect, useState } from "react";

import Sidebar from "../../components/Sidebar";
import ThemeToggle from "../../components/ThemeToggle";
import { AssetResponse, DatabaseAsset, getAssets } from "../../lib/api";

const assetTypes = [
  ["", "All Inventory"],
  ["sql_server", "SQL Server"],
  ["oracle", "Oracle"],
  ["mysql", "MySQL"],
  ["azure_sql", "Azure SQL"],
  ["weblogic", "Oracle WebLogic"],
  ["zen", "ZEN"],
];

export default function DatabaseInventoryPage() {
  const [data, setData] = useState<AssetResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [assetType, setAssetType] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);

    try {
      const result = await getAssets(search, assetType, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [assetType, page]);

  return (
    <div className="appShell">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Database Inventory</h1>
            <p>Central inventory for database platforms and services</p>
          </div>

          <ThemeToggle />
        </header>

        <section className="summaryGrid">
          <div className="summaryCard">
            <span>Total Assets</span>
            <strong>{data?.count ?? 0}</strong>
          </div>

          <div className="summaryCard">
            <span>Environment</span>
            <strong>All</strong>
          </div>

          <div className="summaryCard">
            <span>Status</span>
            <strong>Inventory</strong>
          </div>
        </section>

        <section className="panel">
          <div className="toolbar">
            <select
              value={assetType}
              onChange={(e) => {
                setAssetType(e.target.value);
                setPage(1);
              }}
            >
              {assetTypes.map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>

            <input
              placeholder="Search server, IP, application..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  load();
                }
              }}
            />

            <button
              className="secondaryButton"
              onClick={() => {
                setPage(1);
                load();
              }}
            >
              Search
            </button>

            <div className="toolbarSpacer" />

            <button className="secondaryButton">Columns</button>
            <button className="primaryButton">+ Add Asset</button>
          </div>

          <div className="tableWrapper">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Server Name</th>
                  <th>DBMS</th>
                  <th>Version</th>
                  <th>IP Address</th>
                  <th>Environment</th>
                  <th>Application</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="emptyState">
                      Loading inventory...
                    </td>
                  </tr>
                )}

                {!loading && data?.results.length === 0 && (
                  <tr>
                    <td colSpan={9} className="emptyState">
                      No database assets yet. The application is ready for the Excel import.
                    </td>
                  </tr>
                )}

                {!loading &&
                  data?.results.map((asset: DatabaseAsset) => (
                    <tr key={asset.id}>
                      <td><span className="typeBadge">{asset.asset_type}</span></td>
                      <td>{asset.server_name}</td>
                      <td>{asset.dbms || "—"}</td>
                      <td>{asset.version || "—"}</td>
                      <td>{asset.ip_address || "—"}</td>
                      <td>{asset.environment || "—"}</td>
                      <td>{asset.application || "—"}</td>
                      <td><span className="statusBadge">{asset.status}</span></td>
                      <td>
                        {asset.updated_at
                          ? new Date(asset.updated_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

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
      </main>
    </div>
  );
}
