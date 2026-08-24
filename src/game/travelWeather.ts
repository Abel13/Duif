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

export type GeographicVisualTheme = {
  isNight: boolean;
  season: TravelSeason;
};

/**
 * Returns the civil date at a location. The IANA identifier is deliberately an
 * input: deriving it from longitude is not valid around political boundaries
 * or daylight-saving transitions.
 */
export function localDateAtTimeZone(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

/**
 * Whether the sun is above the standard apparent sunrise/sunset altitude
 * (-0.833°). This handles seasons and polar day/night without a fixed clock
 * window. The result is independent of a device clock's configured timezone.
 */
export function isDayAtCoordinates(date: Date, coordinates: { latitude: number; longitude: number }): boolean {
  const utcDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((utcDay - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86_400_000);
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (minutes - 720) / 1440);
  const equationOfTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  const declination = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  const trueSolarMinutes = ((minutes + equationOfTime + 4 * coordinates.longitude) % 1440 + 1440) % 1440;
  const hourAngle = (trueSolarMinutes / 4 - 180) * Math.PI / 180;
  const latitude = coordinates.latitude * Math.PI / 180;
  const elevation = Math.asin(
    Math.sin(latitude) * Math.sin(declination) + Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle),
  ) * 180 / Math.PI;
  return elevation >= -0.833;
}

/** @deprecated Use isDayAtCoordinates with an IANA timezone resolved server-side. */
export function isDayAtLongitude(date: Date, longitude: number): boolean {
  return isDayAtCoordinates(date, { latitude: 0, longitude });
}

export function geographicVisualTheme(
  date: Date,
  coordinates: { latitude: number; longitude: number },
  timeZone = "UTC",
): GeographicVisualTheme {
  // Validate the supplied IANA zone even though the solar elevation is an
  // absolute physical value. This prevents callers silently falling back to a
  // longitude approximation and keeps civil-date behaviour explicit.
  try {
    localDateAtTimeZone(date, timeZone);
  } catch {
    // A stale catalog must not stop map rendering. The astronomical result
    // remains correct; UTC is only the safe civil-date fallback.
    localDateAtTimeZone(date, "UTC");
  }
  return {
    isNight: !isDayAtCoordinates(date, coordinates),
    season: meteorologicalSeason(date, coordinates.latitude),
  };
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
