import type { TravelSeason } from "../../game/travelWeather";

export type PostalMapPalette = {
  earth: string;
  field: string;
  park: string;
  water: string;
  shoreline: string;
  building: string;
  street: string;
  avenue: string;
  roadEdge: string;
  placeLabel: string;
  labelHalo: string;
  waterLabel: string;
  route: string;
};

export const DEFAULT_POSTAL_MAP_SEASON: TravelSeason = "summer";

export const POSTAL_MAP_NIGHT_EARTH = "#171d24";

/** Stable MapLibre layer ids painted from the seasonal palette. */
export const postalMapLayerIds = {
  paper: "postal-paper",
  field: "postal-field",
  park: "postal-park",
  water: "postal-water",
  waterEdge: "postal-water-edge",
  building: "postal-building",
  roadStreetCasing: "postal-road-street-casing",
  roadAvenueCasing: "postal-road-avenue-casing",
  roadStreet: "postal-road-street",
  roadAvenue: "postal-road-avenue",
  placeLabel: "postal-place-label",
  waterLabel: "postal-water-label",
} as const;

export const postalMapPalettes: Record<TravelSeason, PostalMapPalette> = {
  spring: {
    earth: "#f3ebd8",
    field: "#e9dec1",
    park: "#b9c4a0",
    water: "#a5bec9",
    shoreline: "#5a7e94",
    building: "#e8dcc8",
    street: "#d4c4a8",
    avenue: "#cab18e",
    roadEdge: "#8b7355",
    placeLabel: "#2e2a24",
    labelHalo: "#fff8e8",
    waterLabel: "#2a3a44",
    route: "#a44a3f",
  },
  summer: {
    earth: "#f2e7cf",
    field: "#ede1bf",
    park: "#cbd2b0",
    water: "#b7c9cd",
    shoreline: "#4f738a",
    building: "#e6d4b4",
    street: "#d2be96",
    avenue: "#dec7a3",
    roadEdge: "#8b6b3c",
    placeLabel: "#2e2a24",
    labelHalo: "#fff8e8",
    waterLabel: "#243640",
    route: "#a44a3f",
  },
  autumn: {
    earth: "#efe0ce",
    field: "#e9d6bb",
    park: "#d8bea0",
    water: "#adbbc0",
    shoreline: "#4e6a7c",
    building: "#e2d0b8",
    street: "#d0b898",
    avenue: "#d7b995",
    roadEdge: "#7a5538",
    placeLabel: "#2e2a24",
    labelHalo: "#fff8e8",
    waterLabel: "#1a2830",
    route: "#a44a3f",
  },
  winter: {
    earth: "#e8e6df",
    field: "#d8d6cc",
    park: "#7a8f78",
    water: "#7a9aad",
    shoreline: "#4a6a7c",
    building: "#dcd8d0",
    street: "#c8c0b4",
    avenue: "#b0a898",
    roadEdge: "#6a6458",
    placeLabel: "#2e2a24",
    labelHalo: "#f4f4ec",
    waterLabel: "#1a2830",
    route: "#a44a3f",
  },
};

export function resolvePostalMapPalette(
  season: TravelSeason = DEFAULT_POSTAL_MAP_SEASON,
  isNight = false,
): PostalMapPalette {
  const day = postalMapPalettes[season];
  if (!isNight) return day;

  return {
    earth: POSTAL_MAP_NIGHT_EARTH,
    field: darkenHex(day.field, 0.55),
    park: darkenHex(day.park, 0.5),
    water: darkenHex(day.water, 0.45),
    shoreline: darkenHex(day.shoreline, 0.25),
    building: darkenHex(day.building, 0.5),
    street: darkenHex(day.street, 0.45),
    avenue: darkenHex(day.avenue, 0.4),
    roadEdge: darkenHex(day.roadEdge, 0.3),
    placeLabel: "#e8e2d6",
    labelHalo: "#12161c",
    waterLabel: "#b7c9d4",
    route: day.route,
  };
}

function darkenHex(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const factor = Math.max(0, Math.min(1, 1 - amount));
  const next = (channel: number) => Math.round(channel * factor);
  return `#${[next(r), next(g), next(b)].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
