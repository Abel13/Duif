import type { TranslationKey } from "../i18n";
import type { OfficialAssetKey } from "./assets";
import type { MapCoordinate } from "./mapTravel";

export type WorldLandmarkCategory = "cultural" | "architectural" | "natural";

export type WorldLandmark = {
  announcementPending: boolean;
  assetKey: OfficialAssetKey;
  catalogKey: string;
  category: WorldLandmarkCategory;
  city: string;
  coordinates: MapCoordinate;
  countryCode: string;
  descriptionKey: TranslationKey;
  iconSizePx: number;
  minimumZoom: number;
  nameKey: TranslationKey;
  postcardCatalogKey: string;
  region?: string;
  unlockedAt: string;
};

export function parseWorldLandmarksPayload(value: unknown): WorldLandmark[] {
  if (!value || typeof value !== "object") return [];
  const landmarks = (value as { landmarks?: unknown }).landmarks;
  if (!Array.isArray(landmarks)) return [];
  return landmarks.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    if (typeof item.catalogKey !== "string" || typeof item.nameKey !== "string"
      || typeof item.descriptionKey !== "string" || typeof item.assetKey !== "string"
      || typeof item.latitude !== "number" || typeof item.longitude !== "number"
      || typeof item.minimumZoom !== "number" || typeof item.iconSizePx !== "number"
      || typeof item.city !== "string" || typeof item.countryCode !== "string"
      || typeof item.postcardCatalogKey !== "string"
      || typeof item.unlockedAt !== "string"
      || !["cultural", "architectural", "natural"].includes(String(item.category))) return [];
    return [{
      announcementPending: item.announcementPending === true,
      assetKey: item.assetKey,
      catalogKey: item.catalogKey,
      category: item.category as WorldLandmarkCategory,
      city: item.city,
      coordinates: { latitude: item.latitude, longitude: item.longitude },
      countryCode: item.countryCode,
      descriptionKey: item.descriptionKey as TranslationKey,
      iconSizePx: item.iconSizePx,
      minimumZoom: item.minimumZoom,
      nameKey: item.nameKey as TranslationKey,
      postcardCatalogKey: item.postcardCatalogKey,
      region: typeof item.region === "string" ? item.region : undefined,
      unlockedAt: item.unlockedAt,
    }];
  });
}
