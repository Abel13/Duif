import { describe, expect, it } from "vitest";

import { assetKeys, parseOfficialAssetManifest, resolveOfficialAssetPath } from "./assets";
import { starterMascots } from "./mockData";

const row = {
  version: 1,
  source: "packaged",
  status: "active",
  packaged_path: "/assets/mascots/portraits/nuvem.webp",
  mime_type: "image/webp",
  width: 640,
  height: 640,
  byte_size: 60810,
  alt_text_key: "appearance.nuvemPortrait",
  is_decorative: false,
  official_assets: { asset_key: assetKeys.mascots.nuvem, asset_type: "mascotPortrait" },
};

describe("official asset manifest", () => {
  it("resolves an active packaged version by its stable key", () => {
    const manifest = parseOfficialAssetManifest([row]);
    expect(resolveOfficialAssetPath(manifest, assetKeys.mascots.nuvem))
      .toBe("/assets/mascots/portraits/nuvem.webp");
    expect(resolveOfficialAssetPath(manifest, assetKeys.mascots.trovao)).toBeUndefined();
  });

  it("rejects duplicate, inactive, and free-form records while accepting registered-format keys", () => {
    expect(() => parseOfficialAssetManifest([row, row])).toThrow(/Duplicate/);
    expect(() => parseOfficialAssetManifest([{ ...row, status: "draft" }])).toThrow(/Invalid/);
    expect(() => parseOfficialAssetManifest([{ ...row, packaged_path: "https://example.com/image.webp" }])).toThrow(/Invalid/);
    expect(parseOfficialAssetManifest([{ ...row, official_assets: { ...row.official_assets, asset_key: "studio.testAsset" } }]).has("studio.testAsset")).toBe(true);
    expect(() => parseOfficialAssetManifest([{ ...row, official_assets: { ...row.official_assets, asset_key: "free path" } }])).toThrow(/Invalid/);
  });
  it("resolves an active Storage version through its public URL", () => {
    const manifest=parseOfficialAssetManifest([{ ...row, source:"storage", packaged_path:null, resolved_path:"https://project.supabase.co/storage/v1/object/public/duif-assets/assets/studio/test.webp", official_assets:{asset_key:"studio.testAsset",asset_type:"shopArtwork"} }]);
    expect(resolveOfficialAssetPath(manifest,"studio.testAsset")).toContain("duif-assets");
  });

  it("accepts an empty manifest without inventing fallback paths", () => {
    expect(parseOfficialAssetManifest([]).size).toBe(0);
  });
  it("parses the registered inaugural postcard artwork", () => {
    const manifest=parseOfficialAssetManifest([{ ...row, width:1024,height:683,byte_size:154572,alt_text_key:"tutorial.rewards.inauguralPostcard.name",official_assets:{asset_key:assetKeys.postcards.inauguralFront,asset_type:"postcardArtwork"},packaged_path:"/assets/tutorial/postcards/inaugural-front.webp" }]);
    expect(resolveOfficialAssetPath(manifest,assetKeys.postcards.inauguralFront)).toContain("inaugural-front.webp");
  });

  it("parses each decorative Ninho hub artwork by its official key", () => {
    const artwork = [
      [assetKeys.nest.profileNook, "/assets/nest/profile-nook.webp", 51464],
      [assetKeys.nest.mascotRoost, "/assets/nest/mascot-roost.webp", 57304],
      [assetKeys.nest.mailbox, "/assets/nest/mailbox.webp", 45744],
    ] as const;
    const manifest = parseOfficialAssetManifest(artwork.map(([key, packaged_path, byte_size]) => ({
      ...row,
      packaged_path,
      width: 480,
      height: 640,
      byte_size,
      alt_text_key: null,
      is_decorative: true,
      official_assets: { asset_key: key, asset_type: "nestArtwork" },
    })));

    artwork.forEach(([key, path]) => {
      expect(resolveOfficialAssetPath(manifest, key)).toBe(path);
    });
  });

  it("resolves the official default profile silhouette", () => {
    const manifest = parseOfficialAssetManifest([{
      ...row,
      packaged_path: "/assets/profile/default-silhouette.webp",
      width: 256,
      height: 256,
      byte_size: 6546,
      alt_text_key: "nestHub.defaultAvatar",
      official_assets: { asset_key: assetKeys.profile.defaultSilhouette, asset_type: "nestArtwork" },
    }]);

    expect(resolveOfficialAssetPath(manifest, assetKeys.profile.defaultSilhouette))
      .toBe("/assets/profile/default-silhouette.webp");
  });

  it("resolves the three registered starter equipment icons", () => {
    const equipment = [
      [assetKeys.equipment.featherCharm, "/assets/equipment/icons/feather-charm.webp"],
      [assetKeys.equipment.smallSatchel, "/assets/equipment/icons/small-satchel.webp"],
      [assetKeys.equipment.travelCap, "/assets/equipment/icons/travel-cap.webp"],
    ] as const;
    const manifest = parseOfficialAssetManifest(equipment.map(([key, packaged_path]) => ({
      ...row,
      width: 192,
      height: 192,
      byte_size: 8192,
      alt_text_key: key === assetKeys.equipment.featherCharm
        ? "equipment.featherCharm.name"
        : key === assetKeys.equipment.smallSatchel
          ? "equipment.smallSatchel.name"
          : "equipment.travelCap.name",
      packaged_path,
      official_assets: { asset_key: key, asset_type: "equipmentIcon" },
    })));

    equipment.forEach(([key, path]) => {
      expect(resolveOfficialAssetPath(manifest, key)).toBe(path);
    });
  });

  it("keeps every starter equipment record connected to an official asset key", () => {
    const equipment = starterMascots.flatMap((mascot) => mascot.equipment);

    expect(equipment).toHaveLength(7);
    expect(equipment.every((item) => Boolean(item.iconAssetKey))).toBe(true);
  });
});
