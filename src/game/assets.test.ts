import { describe, expect, it } from "vitest";

import { assetPaths, hasAssetPath } from "./assets";

describe("asset helpers", () => {
  it("builds stable public asset paths", () => {
    expect(assetPaths.mascots.portrait("nuvem.webp")).toBe(
      "/assets/mascots/portraits/nuvem.webp",
    );
    expect(assetPaths.items.thumbnail("worn-route-stamp.webp")).toBe(
      "/assets/items/thumbnails/worn-route-stamp.webp",
    );
    expect(assetPaths.mapControls.icon("overview.webp")).toBe(
      "/assets/map/controls/overview.webp",
    );
  });

  it("detects usable asset paths", () => {
    expect(hasAssetPath("/assets/items/thumbnails/item.webp")).toBe(true);
    expect(hasAssetPath("")).toBe(false);
    expect(hasAssetPath("   ")).toBe(false);
    expect(hasAssetPath(undefined)).toBe(false);
  });
});
