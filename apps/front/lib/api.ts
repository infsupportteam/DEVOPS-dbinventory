export type DatabaseAsset = {
  id: number;
  server_name: string;
  fqdn: string;
  ip_address: string | null;
  asset_type: string;
  dbms: string;
  version: string;
  environment: string;
  application: string;
  status: string;
  os_version: string;
  updated_at: string;
};

export type AssetResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: DatabaseAsset[];
};

export async function getAssets(
  search = "",
  type = "",
  page = 1
): Promise<AssetResponse> {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (type) params.set("asset_type", type);

  params.set("page", String(page));

  const response = await fetch(`/api/v1/assets/?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load inventory");
  }

  return response.json();
}
