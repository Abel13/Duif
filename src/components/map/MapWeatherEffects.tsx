import type { CSSProperties } from "react";
import { assetKeys, type OfficialAssetKey } from "../../game/assets";
import type { MapMotionPreference } from "../../game/mapTravel";
import type { TravelSeason, TravelWeatherCategory } from "../../game/travelWeather";
import { useOfficialAssets } from "../../integrations/supabase/OfficialAssetProvider";
import styles from "./MapWeatherEffects.module.css";

type MapWeatherEffectsProps = {
  isNight: boolean;
  motionPreference: MapMotionPreference;
  season: TravelSeason;
  weatherCategory?: TravelWeatherCategory;
};

type OverlayWeather = Exclude<TravelWeatherCategory, "clear" | "partlyCloudy" | "cloudy">;
type ParticleMotion = "float" | "fall" | "drift" | "mist" | "storm";
type ParticleSpec = { assetKey: OfficialAssetKey; delay: number; left: number; motion: ParticleMotion; size: number; top: number };

const seasonParticles: Record<TravelSeason, OfficialAssetKey> = {
  summer: assetKeys.textures.mapWeatherParticles.seasons.summerMote,
  autumn: assetKeys.textures.mapWeatherParticles.seasons.autumnLeaf,
  winter: assetKeys.textures.mapWeatherParticles.seasons.winterCrystal,
  spring: assetKeys.textures.mapWeatherParticles.seasons.springPetal,
};

function isOverlayWeather(weather: TravelWeatherCategory | undefined): weather is OverlayWeather {
  return weather !== undefined && !["clear", "partlyCloudy", "cloudy"].includes(weather);
}

export function MapWeatherEffects({ isNight, motionPreference, season, weatherCategory }: MapWeatherEffectsProps) {
  const { resolve } = useOfficialAssets();
  const weather = isOverlayWeather(weatherCategory) ? weatherCategory : undefined;
  const seasonal = createSeasonParticles(season);
  const condition = weather ? createWeatherParticles(weather) : [];

  return <div aria-hidden="true" className={styles.effects} data-motion={motionPreference} data-night={isNight || undefined} data-season={season} data-weather={weather}>
    <ParticleGroup particles={seasonal} resolve={resolve} />
    {condition.length > 0 ? <ParticleGroup particles={condition} resolve={resolve} /> : null}
  </div>;
}

function ParticleGroup({ particles, resolve }: { particles: ParticleSpec[]; resolve: (key?: OfficialAssetKey) => string | undefined }) {
  return <>{particles.map((particle, index) => {
    const source = resolve(particle.assetKey);
    if (!source) return null;
    return <img
      alt=""
      className={styles.particle}
      data-particle-motion={particle.motion}
      decoding="async"
      draggable={false}
      key={`${particle.assetKey}-${index}`}
      onError={(event) => { event.currentTarget.hidden = true; }}
      src={source}
      style={particleStyle(particle)}
    />;
  })}</>;
}

function particleStyle({ delay, left, size, top }: ParticleSpec): CSSProperties {
  return {
    "--particle-delay": `${delay}s`,
    "--particle-size": `${size}rem`,
    left: `${left}%`,
    top: `${top}%`,
  } as CSSProperties;
}

function createSeasonParticles(season: TravelSeason): ParticleSpec[] {
  const assetKey = seasonParticles[season];
  const positions = [[6, 14], [26, 71], [48, 30], [72, 82], [88, 42]];
  const size = season === "winter" ? 2.5 : season === "summer" ? 2 : 2.8;
  const motion = season === "summer" ? "float" : "drift";
  return positions.map(([left, top], index) => ({ assetKey, delay: -index * 1.8, left, motion, size: size + (index % 2) * .35, top }));
}

function createWeatherParticles(weather: OverlayWeather): ParticleSpec[] {
  if (weather === "fogDrizzle") return [
    ...withPositions(assetKeys.textures.mapWeatherParticles.weather.fogWisp, "mist", 3, 10, 13),
    ...withPositions(assetKeys.textures.mapWeatherParticles.weather.drizzleDrop, "fall", 8, 3.4, 4),
  ];
  if (weather === "rain") return withPositions(assetKeys.textures.mapWeatherParticles.weather.rainStreak, "fall", 13, 3.8, 4.4);
  if (weather === "snow") return withPositions(assetKeys.textures.mapWeatherParticles.weather.snowflake, "drift", 10, 2.5, 3.2);
  if (weather === "heavyFreezingRain") return [
    ...withPositions(assetKeys.textures.mapWeatherParticles.weather.snowflake, "drift", 6, 2.15, 2.7),
    ...withPositions(assetKeys.textures.mapWeatherParticles.weather.icePellet, "fall", 8, 2.05, 3),
  ];
  return [
    ...withPositions(assetKeys.textures.mapWeatherParticles.weather.stormCloud, "storm", 3, 7.6, 15),
    ...withPositions(assetKeys.textures.mapWeatherParticles.weather.rainStreak, "fall", 12, 4.1, 3.8),
  ];
}

function withPositions(assetKey: OfficialAssetKey, motion: ParticleMotion, count: number, size: number, spacing: number): ParticleSpec[] {
  return Array.from({ length: count }, (_, index) => ({
    assetKey,
    delay: -(index * 1.17),
    left: (index * 17 + 4) % 100,
    motion,
    size: size + (index % 3) * .4,
    top: ((index * 29) % 105) - spacing,
  }));
}
