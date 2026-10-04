"use client";

import { ASSET_TYPES } from "../lib/inventory";

type Props = {
  searchDraft: string;
  assetType: string;
  environment: string;
  status: string;
  environmentOptions: string[];
  statusOptions: string[];
  onSearchDraftChange: (value: string) => void;
  onAssetTypeChange: (value: string) => void;
  onEnvironmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export default function FilterBar({
  searchDraft,
  assetType,
  environment,
  status,
  environmentOptions,
  statusOptions,
  onSearchDraftChange,
  onAssetTypeChange,
  onEnvironmentChange,
  onStatusChange,
  onSearch,
  onClear,
}: Props) {
  const hasFilters = Boolean(searchDraft || assetType || environment || status);

  return (
    <div className="filterGroup">
      <select
        aria-label="Platform"
        value={assetType}
        onChange={(event) => onAssetTypeChange(event.target.value)}
      >
        {ASSET_TYPES.map((item) => (
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Environment"
        value={environment}
        onChange={(event) => onEnvironmentChange(event.target.value)}
      >
        <option value="">All Environments</option>
        {environmentOptions.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        aria-label="Status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        <option value="">All Statuses</option>
        {statusOptions.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>

      <input
        className="searchInput"
        placeholder="Search server, FQDN, IP, application..."
        value={searchDraft}
        onChange={(event) => onSearchDraftChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSearch();
        }}
      />

      <button type="button" className="secondaryButton" onClick={onSearch}>
        Search
      </button>

      {hasFilters && (
        <button type="button" className="ghostButton" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}
