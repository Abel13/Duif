import { describe,expect,it } from "vitest";
import { normalizeOpenMeteo,openMeteoUrl } from "./travel-weather";

describe("Open-Meteo adapter",()=>{
  it("normalizes only the nearest approved hourly fields",()=>{
    expect(normalizeOpenMeteo({hourly:{time:["2026-08-23T00:00","2026-08-23T03:00"],weather_code:[1,95],is_day:[0,1],wind_speed_10m:[12,40],wind_gusts_10m:[20,60]}},"2026-08-23T02:40:00Z"))
      .toEqual({weatherCode:95,isDay:true,windSpeedKmh:40,windGustKmh:60});
    expect(normalizeOpenMeteo({hourly:{time:[],weather_code:[]}},"2026-08-23T00:00:00Z")).toBeNull();
  });
  it("requests no provider fields beyond the approved set",()=>{
    const url=new URL(openMeteoUrl("https://api.open-meteo.com/v1/forecast",-20,30));
    expect(url.searchParams.get("hourly")).toBe("weather_code,is_day,wind_speed_10m,wind_gusts_10m");
  });
});
