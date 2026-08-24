export type NormalizedWeather = { weatherCode: number; isDay: boolean; windSpeedKmh: number; windGustKmh: number };

export function normalizeOpenMeteo(payload: unknown, blockStart: string): NormalizedWeather | null {
  if (!payload || typeof payload !== "object") return null;
  const hourly = (payload as { hourly?: unknown }).hourly;
  if (!hourly || typeof hourly !== "object") return null;
  const value = hourly as Record<string, unknown>;
  const times = value.time;
  if (!Array.isArray(times)) return null;
  const target = new Date(blockStart).getTime();
  let index = -1; let distance = Number.POSITIVE_INFINITY;
  times.forEach((time, candidate) => { const raw=String(time); const utcTime=/Z$|[+-]\d\d:\d\d$/.test(raw)?raw:`${raw}Z`; const difference = Math.abs(new Date(utcTime).getTime()-target); if (difference < distance) { distance=difference; index=candidate; } });
  const read = (key: string) => Array.isArray(value[key]) ? Number((value[key] as unknown[])[index]) : Number.NaN;
  const weatherCode=read("weather_code"), isDay=read("is_day"), windSpeedKmh=read("wind_speed_10m"), windGustKmh=read("wind_gusts_10m");
  if (index<0 || !Number.isInteger(weatherCode) || weatherCode<0 || weatherCode>99 || ![0,1].includes(isDay) || !Number.isFinite(windSpeedKmh) || windSpeedKmh<0 || !Number.isFinite(windGustKmh) || windGustKmh<0) return null;
  return { weatherCode, isDay:isDay===1, windSpeedKmh, windGustKmh };
}

export function openMeteoUrl(baseUrl: string, latitude: number, longitude: number, apiKey?: string) {
  const url=new URL(baseUrl); url.searchParams.set("latitude",String(latitude)); url.searchParams.set("longitude",String(longitude));
  url.searchParams.set("hourly","weather_code,is_day,wind_speed_10m,wind_gusts_10m"); url.searchParams.set("forecast_days","4"); url.searchParams.set("timezone","UTC"); url.searchParams.set("wind_speed_unit","kmh");
  if (apiKey) url.searchParams.set("apikey",apiKey); return url.toString();
}
