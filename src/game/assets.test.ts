import { describe, expect, it } from "vitest";

import { assetKeys, parseOfficialAssetManifest, resolveOfficialAssetPath } from "./assets";

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
});
