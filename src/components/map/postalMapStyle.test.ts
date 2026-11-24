import { describe, expect, it } from "vitest";

import {
  DEFAULT_POSTAL_MAP_SEASON,
  POSTAL_MAP_NIGHT_EARTH,
  postalMapLayerIds,
  postalMapPalettes,
  resolvePostalMapPalette,
} from "./postalMapPalette";
import {
  createPostalMapStyle,
  getPostalMapGlyphsUrl,
  getPostalMapTilesUrl,
  postalMapStyle,
} from "./postalMapStyle";

describe("postalMapPalette", () => {
  it("keeps place label and route colors constant across seasons", () => {
    const seasons = Object.values(postalMapPalettes);
    expect(new Set(seasons.map((palette) => palette.placeLabel))).toEqual(new Set(["#2e2a24"]));
    expect(new Set(seasons.map((palette) => palette.route))).toEqual(new Set(["#a44a3f"]));
  });

  it("matches the spring reference swatches", () => {
    expect(postalMapPalettes.spring).toMatchObject({
      earth: "#f3ebd8",
      field: "#e9dec1",
      park: "#b9c4a0",
      water: "#a5bec9",
      shoreline: "#5a7e94",
      building: "#e8dcc8",
      street: "#d4c4a8",
      avenue: "#cab18e",
      roadEdge: "#8b7355",
      labelHalo: "#fff8e8",
      waterLabel: "#2a3a44",
    });
  });

  it("darkens the night earth override while preserving route accent", () => {
    const night = resolvePostalMapPalette("summer", true);
    expect(night.earth).toBe(POSTAL_MAP_NIGHT_EARTH);
    expect(night.route).toBe(postalMapPalettes.summer.route);
    expect(night.field).not.toBe(postalMapPalettes.summer.field);
  });
});

describe("postalMapStyle", () => {
  it("uses a reliable raster basemap when no vector tile host is configured", () => {
    const style = createPostalMapStyle({ season: "autumn" });
    const layerIds = style.layers?.map((layer) => layer.id) ?? [];

    expect(style.sources).toHaveProperty("osm");
    expect(style.sources).not.toHaveProperty("openmaptiles");
    expect(layerIds).toContain(postalMapLayerIds.paper);
    expect(layerIds).toContain("osm-raster");

    const paper = style.layers?.find((layer) => layer.id === postalMapLayerIds.paper);
    expect(backgroundColor(paper)).toBe(postalMapPalettes.autumn.earth);
  });

  it("exports a summer default preview style", () => {
    expect(DEFAULT_POSTAL_MAP_SEASON).toBe("summer");
    const paper = postalMapStyle.layers?.find((layer) => layer.id === postalMapLayerIds.paper);
    expect(backgroundColor(paper)).toBe(postalMapPalettes.summer.earth);
  });

  it("resolves optional vector tile and glyph URL overrides", () => {
    expect(getPostalMapTilesUrl("https://example.test/{z}/{x}/{y}.pbf")).toBe(
      "https://example.test/{z}/{x}/{y}.pbf",
    );
    expect(getPostalMapGlyphsUrl("https://example.test/fonts/{fontstack}/{range}.pbf")).toBe(
      "https://example.test/fonts/{fontstack}/{range}.pbf",
    );
    expect(getPostalMapTilesUrl()).toBeUndefined();
    expect(getPostalMapGlyphsUrl()).toContain("openfreemap.org");
  });

  it("uses a vector basemap only when one is explicitly configured", () => {
    const style = createPostalMapStyle({
      tilesUrl: "https://example.test/{z}/{x}/{y}.pbf",
    });

    expect(style.sources).toHaveProperty("openmaptiles");
    expect(style.sources).not.toHaveProperty("osm");
  });
});

function backgroundColor(layer: { paint?: object } | undefined): unknown {
  if (!layer?.paint || !("background-color" in layer.paint)) return undefined;
  return (layer.paint as { "background-color"?: unknown })["background-color"];
}
