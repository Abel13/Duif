import { assetKeys, type OfficialAssetKey } from "./assets";
import type { TravelSeason, TravelWeatherCategory } from "./travelWeather";

export type TravelConditionArtwork = {
  seasonAssetKey: OfficialAssetKey;
  weatherAssetKey?: OfficialAssetKey;
  weatherKind?: "drizzle" | "rain" | "snowIce" | "storm";
};

const weatherArtwork = {
  fogDrizzle: { key: assetKeys.textures.mapAtmosphere.weather.drizzle, kind: "drizzle" },
  rain: { key: assetKeys.textures.mapAtmosphere.weather.rain, kind: "rain" },
  snow: { key: assetKeys.textures.mapAtmosphere.weather.snowIce, kind: "snowIce" },
  heavyFreezingRain: { key: assetKeys.textures.mapAtmosphere.weather.snowIce, kind: "snowIce" },
  thunderstorm: { key: assetKeys.textures.mapAtmosphere.weather.storm, kind: "storm" },
} as const;

export function resolveTravelConditionArtwork(
  season: TravelSeason,
  weatherCategory?: TravelWeatherCategory,
): TravelConditionArtwork {
  const weather = weatherCategory ? weatherArtwork[weatherCategory as keyof typeof weatherArtwork] : undefined;
  return {
    seasonAssetKey: assetKeys.textures.mapAtmosphere.seasons[season],
    ...(weather ? { weatherAssetKey: weather.key, weatherKind: weather.kind } : {}),
  };
}
