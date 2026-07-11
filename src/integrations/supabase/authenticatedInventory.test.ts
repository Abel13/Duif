import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchAuthenticatedInventoryItems } from "./authenticatedInventory";
import { getSupabaseClient } from "./client";
import type { InventoryItemRow } from "./inventoryMappers";

vi.mock("./client", () => ({
  getSupabaseClient: vi.fn(),
}));

const getSupabaseClientMock = vi.mocked(getSupabaseClient);

const inventoryItemRow: InventoryItemRow = {
  category: "keepsakes",
  collected_at: "2026-07-10T15:05:00.000Z",
  created_at: "2026-07-10T15:05:00.000Z",
  description_key: "rewards.items.goldenCompassPin.description",
  equipped: false,
  id: "00000000-0000-4000-8000-000000000901",
  mock_key: "inventory-reward-delivery-nuvem-lisbon",
  name_key: "rewards.items.goldenCompassPin.name",
  owner_profile_id: "00000000-0000-4000-8000-000000000001",
  rarity: "rare",
  reward_item_id: "00000000-0000-4000-8000-000000000603",
  source_key: "inventory.sources.routeReward",
  thumbnail_asset_path: "/assets/items/thumbnails/golden-compass-pin.webp",
};

function createInventoryQueryResult({
  data,
  error = null,
}: {
  data: InventoryItemRow[];
  error?: Error | null;
}) {
  const order = vi.fn().mockResolvedValue({ data, error });
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return {
    client: { from },
    eq,
    from,
    order,
    select,
  };
}

describe("authenticated inventory reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined when Supabase is unavailable", async () => {
    getSupabaseClientMock.mockReturnValue(null);

    await expect(fetchAuthenticatedInventoryItems("profile-id")).resolves.toBeUndefined();
  });

  it("fetches and maps inventory rows for the current profile", async () => {
    const query = createInventoryQueryResult({ data: [inventoryItemRow] });
    getSupabaseClientMock.mockReturnValue(query.client as never);

    const items = await fetchAuthenticatedInventoryItems("profile-id");

    expect(query.from).toHaveBeenCalledWith("inventory_items");
    expect(query.eq).toHaveBeenCalledWith("owner_profile_id", "profile-id");
    expect(query.order).toHaveBeenCalledWith("collected_at", { ascending: false });
    expect(items).toEqual([
      expect.objectContaining({
        category: "keepsakes",
        id: "inventory-reward-delivery-nuvem-lisbon",
        sourceKey: "inventory.sources.routeReward",
      }),
    ]);
  });

  it("throws when the authenticated inventory query fails", async () => {
    const query = createInventoryQueryResult({
      data: [],
      error: new Error("RLS blocked inventory read"),
    });
    getSupabaseClientMock.mockReturnValue(query.client as never);

    await expect(fetchAuthenticatedInventoryItems("profile-id")).rejects.toThrow(
      "RLS blocked inventory read",
    );
  });
});
