import { describe, expect, it } from "vitest";
import { assetKeys } from "../../game/assets";

import { mapTrafficRow } from "./authenticatedPostalTraffic";

const row = {
  current_latitude: -23.375, current_longitude: -51.5,
  destination_latitude: -23.5, destination_longitude: -52,
  destination_region: "PR, Brasil", distance_km: 12,
  friend_id: null, friend_name: null, mascot_name: "Aurora",
  origin_latitude: -23.25, origin_longitude: -51, origin_region: "PR, Brasil",
  outbound_arrival_at: "2026-07-18T23:00:00.000Z",
  outbound_start_at: "2026-07-18T21:00:00.000Z",
  portrait_asset_key: assetKeys.mascots.aurora,
  return_arrival_at: "2026-07-19T02:00:00.000Z",
  return_start_at: "2026-07-19T00:00:00.000Z",
  species_key: "species.mailDuck", traffic_id: "traffic-1", visibility: "public",
};

describe("authenticated postal traffic mapper", () => {
  it("keeps public owner identity out of the browser snapshot", () => {
    const snapshot = mapTrafficRow(row, new Date("2026-07-18T22:00:00.000Z"));
    expect(snapshot.visibility).toBe("public");
    expect("friendId" in snapshot).toBe(false);
    expect("friendName" in snapshot).toBe(false);
    expect(snapshot.coordinates).toEqual({ latitude: -23.375, longitude: -51.5 });
    expect(snapshot.route.origin).toEqual({ latitude: -23.25, longitude: -51 });
  });

  it("adds an already-authorized friend CTA identity", () => {
    const snapshot = mapTrafficRow({ ...row, friend_id: "friend-lia", friend_name: "Lia", visibility: "friend" });
    expect(snapshot).toMatchObject({ visibility: "friend", friendId: "friend-lia", friendName: "Lia" });
  });
});
