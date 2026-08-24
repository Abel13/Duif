export type TravelWeatherCategory = "clear" | "partlyCloudy" | "cloudy" | "fogDrizzle" | "rain" | "snow" | "heavyFreezingRain" | "thunderstorm";
export type TravelWeatherSource = "openMeteo" | "virtual";
export type TravelSeason = "summer" | "autumn" | "winter" | "spring";

export type TravelWeatherSummary = {
  estimatedArrivalAt: string;
  currentSegmentIndex: number;
  segmentCount: number;
  currentWeather: { category: TravelWeatherCategory; source: TravelWeatherSource; observedAt: string };
  season: TravelSeason;
  effectiveSpeedMultiplier: number;
  conditionImpactMultiplier: number;
  isDay: boolean;
  rulesVersion: number;
};

const weatherMultipliers: Record<TravelWeatherCategory, number> = {
  clear: 1.02, partlyCloudy: 1.01, cloudy: 1, fogDrizzle: .98,
  rain: .96, snow: .95, heavyFreezingRain: .94, thunderstorm: .92,
};

export function weatherCategoryForWmo(code: number): TravelWeatherCategory {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partlyCloudy";
  if (code === 3) return "cloudy";
  if ([45, 48, 51, 53, 55].includes(code)) return "fogDrizzle";
  if ([56, 57, 65, 66, 67, 82].includes(code)) return "heavyFreezingRain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "thunderstorm";
  return "rain";
}

export function meteorologicalSeason(date: Date, latitude: number): TravelSeason {
  const northern = (["winter", "spring", "summer", "autumn"] as const)[Math.floor(date.getUTCMonth() / 3)];
  if (latitude >= 0) return northern;
  return ({ winter: "summer", spring: "autumn", summer: "winter", autumn: "spring" } as const)[northern];
}

export function composeEffectiveSpeedMultiplier(input: {
  weather: TravelWeatherCategory; windSpeedKmh: number; isDay: boolean; season: TravelSeason;
  mascot?: number; equipment?: number; backpack?: number; skills?: number; familiarity?: number;
}) {
  const wind = input.windSpeedKmh >= 50 ? -.04 : input.windSpeedKmh >= 30 ? -.02 : 0;
  const meteorological = Math.max(-.08, Math.min(.02, weatherMultipliers[input.weather] - 1 + wind));
  const night = input.isDay ? 0 : -.02;
  const seasonal = input.season === "summer" ? .01 : input.season === "winter" ? -.02 : 0;
  const composed = 1 + meteorological + night + seasonal
    + (input.mascot ?? 0) + (input.equipment ?? 0) + (input.backpack ?? 0)
    + (input.skills ?? 0) + (input.familiarity ?? 0);
  return Math.max(.6, Math.min(1.25, Number(composed.toFixed(4))));
}
