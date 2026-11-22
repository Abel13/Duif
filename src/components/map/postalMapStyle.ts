import type maplibregl from "maplibre-gl";

import type { TravelSeason } from "../../game/travelWeather";
import {
  DEFAULT_POSTAL_MAP_SEASON,
  postalMapLayerIds,
  resolvePostalMapPalette,
  type PostalMapPalette,
} from "./postalMapPalette";

const DEFAULT_VECTOR_TILES_URL = "https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf";
const DEFAULT_GLYPHS_URL = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
const VECTOR_ATTRIBUTION = "© OpenStreetMap contributors · © OpenFreeMap";
const LABEL_FONT = ["Noto Sans Regular"] as [string];

const FIELD_FILTER: maplibregl.FilterSpecification = [
  "any",
  ["==", ["get", "class"], "grass"],
  ["==", ["get", "class"], "farmland"],
  ["==", ["get", "subclass"], "grass"],
  ["==", ["get", "subclass"], "meadow"],
  ["==", ["get", "subclass"], "farmland"],
];

const PARK_FILTER: maplibregl.FilterSpecification = [
  "any",
  ["==", ["get", "class"], "wood"],
  ["==", ["get", "class"], "park"],
  ["==", ["get", "class"], "forest"],
  ["==", ["get", "subclass"], "forest"],
  ["==", ["get", "subclass"], "park"],
];

const STREET_FILTER: maplibregl.FilterSpecification = [
  "all",
  ["==", ["geometry-type"], "LineString"],
  [
    "in",
    ["get", "class"],
    ["literal", ["minor", "service", "path", "track", "tertiary"]],
  ],
];

const AVENUE_FILTER: maplibregl.FilterSpecification = [
  "all",
  ["==", ["geometry-type"], "LineString"],
  ["in", ["get", "class"], ["literal", ["primary", "secondary", "trunk", "motorway"]]],
];

export type CreatePostalMapStyleOptions = {
  glyphsUrl?: string;
  isNight?: boolean;
  season?: TravelSeason;
  tilesUrl?: string;
};

export function getPostalMapTilesUrl(override?: string): string {
  return override ?? import.meta.env.VITE_MAP_VECTOR_TILES_URL ?? DEFAULT_VECTOR_TILES_URL;
}

export function getPostalMapGlyphsUrl(override?: string): string {
  return override ?? import.meta.env.VITE_MAP_GLYPHS_URL ?? DEFAULT_GLYPHS_URL;
}

export function createPostalMapStyle(
  options: CreatePostalMapStyleOptions = {},
): maplibregl.StyleSpecification {
  const season = options.season ?? DEFAULT_POSTAL_MAP_SEASON;
  const palette = resolvePostalMapPalette(season, options.isNight ?? false);
  const tilesUrl = getPostalMapTilesUrl(options.tilesUrl);
  const glyphsUrl = getPostalMapGlyphsUrl(options.glyphsUrl);

  return {
    version: 8,
    name: "DUIF Postal Vector",
    glyphs: glyphsUrl,
    sources: {
      openmaptiles: {
        type: "vector",
        tiles: [tilesUrl],
        maxzoom: 14,
        attribution: VECTOR_ATTRIBUTION,
      },
    },
    layers: [
      {
        id: postalMapLayerIds.paper,
        type: "background",
        paint: { "background-color": palette.earth },
      },
      {
        id: postalMapLayerIds.field,
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: FIELD_FILTER,
        paint: { "fill-color": palette.field, "fill-opacity": 0.92 },
      },
      {
        id: `${postalMapLayerIds.field}-landuse`,
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: FIELD_FILTER,
        paint: { "fill-color": palette.field, "fill-opacity": 0.88 },
      },
      {
        id: postalMapLayerIds.park,
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: PARK_FILTER,
        paint: { "fill-color": palette.park, "fill-opacity": 0.94 },
      },
      {
        id: `${postalMapLayerIds.park}-landuse`,
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: PARK_FILTER,
        paint: { "fill-color": palette.park, "fill-opacity": 0.9 },
      },
      {
        id: postalMapLayerIds.water,
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": palette.water },
      },
      {
        id: postalMapLayerIds.waterEdge,
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: {
          "line-color": palette.shoreline,
          "line-opacity": 0.75,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 14, 1.6],
        },
      },
      {
        id: postalMapLayerIds.building,
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 12,
        paint: { "fill-color": palette.building, "fill-opacity": 0.92 },
      },
      {
        id: postalMapLayerIds.roadStreetCasing,
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: STREET_FILTER,
        minzoom: 11,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": palette.roadEdge,
          "line-opacity": 0.55,
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2.2, 16, 7],
        },
      },
      {
        id: postalMapLayerIds.roadAvenueCasing,
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: AVENUE_FILTER,
        minzoom: 8,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": palette.roadEdge,
          "line-opacity": 0.62,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 2.4, 16, 10],
        },
      },
      {
        id: postalMapLayerIds.roadStreet,
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: STREET_FILTER,
        minzoom: 11,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": palette.street,
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1.2, 16, 4.5],
        },
      },
      {
        id: postalMapLayerIds.roadAvenue,
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: AVENUE_FILTER,
        minzoom: 8,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": palette.avenue,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1.4, 16, 6.5],
        },
      },
      {
        id: postalMapLayerIds.placeLabel,
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 3,
        layout: {
          "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
          "text-font": LABEL_FONT,
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            11,
            8,
            13,
            12,
            15,
          ],
          "text-max-width": 8,
          "text-padding": 2,
        },
        paint: {
          "text-color": palette.placeLabel,
          "text-halo-color": palette.labelHalo,
          "text-halo-width": 1.6,
          "text-halo-blur": 0.4,
        },
      },
      {
        id: postalMapLayerIds.waterLabel,
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water_name",
        minzoom: 5,
        layout: {
          "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
          "text-font": LABEL_FONT,
          "text-size": ["interpolate", ["linear"], ["zoom"], 5, 11, 12, 14],
          "text-max-width": 8,
        },
        paint: {
          "text-color": palette.waterLabel,
          "text-halo-color": palette.labelHalo,
          "text-halo-width": 1.4,
          "text-halo-blur": 0.4,
        },
      },
    ],
  };
}

/** Default style for previews without a live travel theme. */
export const postalMapStyle = createPostalMapStyle({ season: DEFAULT_POSTAL_MAP_SEASON });

export function applyPostalMapTheme(
  map: maplibregl.Map,
  theme?: { isNight: boolean; season: TravelSeason },
): void {
  const palette = resolvePostalMapPalette(theme?.season ?? DEFAULT_POSTAL_MAP_SEASON, theme?.isNight ?? false);
  setPaintIfPresent(map, postalMapLayerIds.paper, "background-color", palette.earth);
  setPaintIfPresent(map, postalMapLayerIds.field, "fill-color", palette.field);
  setPaintIfPresent(map, `${postalMapLayerIds.field}-landuse`, "fill-color", palette.field);
  setPaintIfPresent(map, postalMapLayerIds.park, "fill-color", palette.park);
  setPaintIfPresent(map, `${postalMapLayerIds.park}-landuse`, "fill-color", palette.park);
  setPaintIfPresent(map, postalMapLayerIds.water, "fill-color", palette.water);
  setPaintIfPresent(map, postalMapLayerIds.waterEdge, "line-color", palette.shoreline);
  setPaintIfPresent(map, postalMapLayerIds.building, "fill-color", palette.building);
  setPaintIfPresent(map, postalMapLayerIds.roadStreetCasing, "line-color", palette.roadEdge);
  setPaintIfPresent(map, postalMapLayerIds.roadAvenueCasing, "line-color", palette.roadEdge);
  setPaintIfPresent(map, postalMapLayerIds.roadStreet, "line-color", palette.street);
  setPaintIfPresent(map, postalMapLayerIds.roadAvenue, "line-color", palette.avenue);
  setPaintIfPresent(map, postalMapLayerIds.placeLabel, "text-color", palette.placeLabel);
  setPaintIfPresent(map, postalMapLayerIds.placeLabel, "text-halo-color", palette.labelHalo);
  setPaintIfPresent(map, postalMapLayerIds.waterLabel, "text-color", palette.waterLabel);
  setPaintIfPresent(map, postalMapLayerIds.waterLabel, "text-halo-color", palette.labelHalo);
  applyDuifOverlayPalette(map, palette);
}

function applyDuifOverlayPalette(map: maplibregl.Map, palette: PostalMapPalette): void {
  setPaintIfPresent(map, "duif-place-labels", "text-color", palette.placeLabel);
  setPaintIfPresent(map, "duif-place-labels", "text-halo-color", palette.labelHalo);
  setPaintIfPresent(map, "duif-route-line", "line-color", palette.route);
}

function setPaintIfPresent(
  map: maplibregl.Map,
  layerId: string,
  property: string,
  value: string,
): void {
  if (!map.getLayer(layerId)) return;
  map.setPaintProperty(layerId, property, value);
}
