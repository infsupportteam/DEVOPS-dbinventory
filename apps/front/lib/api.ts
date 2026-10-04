export type CustomValue = {
  field: number;
  field_name: string;
  field_label: string;
  field_type: string;
  value: unknown;
};

export type DatabaseRecord = {
  id: number;
  database_name: string;
  application: string;
  status: string;
};

export type DatabaseAsset = {
  id: number;
  server_name: string;
  fqdn: string;
  ip_address: string | null;
  asset_type: string;
  dbms: string;
  version: string;
  internal_version: string;
  edition: string;
  environment: string;
  application: string;
  status: string;
  os_version: string;
  architecture: string;
  location: string;
  network: string;
  resource_type: string;
  resource_group: string;
  subscription: string;
  notes: string;
  created_at: string;
  updated_at: string;
  custom_values: CustomValue[];
  databases: DatabaseRecord[];
};

export type AssetPayload = Partial<Omit<DatabaseAsset, "id" | "created_at" | "updated_at" | "custom_values" | "databases">> & {
  custom_fields?: Record<string, unknown>;
};

export type AssetResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: DatabaseAsset[];
};

export type InventorySummary = {
  total: number;
  production: number;
  non_production: number;
  unspecified_environment: number;
  active: number;
  by_asset_type: Record<string, number>;
  by_environment: Record<string, number>;
  by_status: Record<string, number>;
};

export type CustomFieldDefinition = {
  id: number;
  name: string;
  label: string;
  field_type: "text" | "number" | "boolean" | "date" | "select";
  options: string[];
  enabled: boolean;
  sort_order: number;
  created_at: string;
};

export type AssetQuery = {
  search?: string;
  assetType?: string;
  environment?: string;
  status?: string;
  page?: number;
};

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      detail =
        typeof body === "string"
          ? body
          : body.detail || JSON.stringify(body);
    } catch {
      // Keep the status-based message.
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getAssets(query: AssetQuery = {}): Promise<AssetResponse> {
  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search);
  if (query.assetType) params.set("asset_type", query.assetType);
  if (query.environment) params.set("environment", query.environment);
  if (query.status) params.set("status", query.status);
  params.set("page", String(query.page || 1));

  return apiFetch<AssetResponse>(`/api/v1/assets/?${params.toString()}`);
}

export async function getAsset(id: number | string): Promise<DatabaseAsset> {
  return apiFetch<DatabaseAsset>(`/api/v1/assets/${id}/`);
}

export async function createAsset(payload: AssetPayload): Promise<DatabaseAsset> {
  return apiFetch<DatabaseAsset>("/api/v1/assets/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAsset(
  id: number | string,
  payload: AssetPayload
): Promise<DatabaseAsset> {
  return apiFetch<DatabaseAsset>(`/api/v1/assets/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAsset(id: number | string): Promise<void> {
  return apiFetch<void>(`/api/v1/assets/${id}/`, {
    method: "DELETE",
  });
}

export async function getSummary(): Promise<InventorySummary> {
  return apiFetch<InventorySummary>("/api/v1/summary/");
}

export async function getCustomFields(): Promise<CustomFieldDefinition[]> {
  const response = await apiFetch<
    CustomFieldDefinition[] | { results: CustomFieldDefinition[] }
  >("/api/v1/custom-fields/");

  return Array.isArray(response) ? response : response.results;
}

export async function createCustomField(
  payload: Pick<
    CustomFieldDefinition,
    "name" | "label" | "field_type" | "options" | "enabled" | "sort_order"
  >
): Promise<CustomFieldDefinition> {
  return apiFetch<CustomFieldDefinition>("/api/v1/custom-fields/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteCustomField(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/custom-fields/${id}/`, {
    method: "DELETE",
  });
}
