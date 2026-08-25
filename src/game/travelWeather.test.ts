import { describe,expect,it } from "vitest";
import { composeEffectiveSpeedMultiplier,effectiveSpeedKmh,geographicVisualTheme,isDayAtCoordinates,isDayAtLongitude,localDateAtTimeZone,meteorologicalSeason,weatherCategoryForWmo } from "./travelWeather";

describe("segmented travel weather rules",()=>{
  it("normalizes every approved WMO family",()=>{
    expect([weatherCategoryForWmo(0),weatherCategoryForWmo(2),weatherCategoryForWmo(3),weatherCategoryForWmo(48),weatherCategoryForWmo(61),weatherCategoryForWmo(71),weatherCategoryForWmo(67),weatherCategoryForWmo(95)])
      .toEqual(["clear","partlyCloudy","cloudy","fogDrizzle","rain","snow","heavyFreezingRain","thunderstorm"]);
  });
  it("inverts meteorological seasons by hemisphere",()=>{
    expect(meteorologicalSeason(new Date("2026-01-15T00:00:00Z"),40)).toBe("winter");
    expect(meteorologicalSeason(new Date("2026-01-15T00:00:00Z"),-20)).toBe("summer");
  });
  it("derives local solar day and an idle geographic theme",()=>{
    const instant=new Date("2026-01-15T15:00:00Z");
    expect(isDayAtLongitude(instant,-45)).toBe(true);
    expect(isDayAtLongitude(instant,150)).toBe(false);
    expect(geographicVisualTheme(instant,{latitude:-20,longitude:-45})).toEqual({isNight:false,season:"summer"});
  });
  it("uses astronomical daylight at the mascot position rather than a fixed local-hour window",()=>{
    expect(isDayAtCoordinates(new Date("2026-08-24T14:14:00Z"),{latitude:-23.5505,longitude:-46.6333})).toBe(true);
    expect(isDayAtCoordinates(new Date("2026-08-24T02:14:00Z"),{latitude:-23.5505,longitude:-46.6333})).toBe(false);
    expect(isDayAtCoordinates(new Date("2026-12-21T12:00:00Z"),{latitude:78.2232,longitude:15.6469})).toBe(false);
  });
  it("uses IANA civil dates across daylight-saving offsets",()=>{
    expect(localDateAtTimeZone(new Date("2026-03-08T04:30:00Z"),"America/New_York")).toEqual({year:2026,month:3,day:7});
    expect(localDateAtTimeZone(new Date("2026-03-08T07:30:00Z"),"America/New_York")).toEqual({year:2026,month:3,day:8});
    expect(localDateAtTimeZone(new Date("2026-03-29T00:30:00Z"),"Europe/London")).toEqual({year:2026,month:3,day:29});
  });
  it("updates visual daylight from the current instant, independently from persisted weather snapshots",()=>{
    const coordinates={latitude:-23.5505,longitude:-46.6333};
    expect(geographicVisualTheme(new Date("2026-08-24T02:14:00Z"),coordinates,"America/Sao_Paulo").isNight).toBe(true);
    expect(geographicVisualTheme(new Date("2026-08-24T14:14:00Z"),coordinates,"America/Sao_Paulo").isNight).toBe(false);
  });
  it("clamps composed speed and keeps familiarity neutral by default",()=>{
    expect(composeEffectiveSpeedMultiplier({weather:"thunderstorm",windSpeedKmh:80,isDay:false,season:"winter",mascot:-.5})).toBe(.6);
    expect(composeEffectiveSpeedMultiplier({weather:"clear",windSpeedKmh:0,isDay:true,season:"summer",mascot:.5})).toBe(1.25);
    expect(composeEffectiveSpeedMultiplier({weather:"cloudy",windSpeedKmh:0,isDay:true,season:"spring"})).toBe(1);
  });
  it("converts the effective multiplier to the delivery speed in km/h",()=>{
    expect(effectiveSpeedKmh(80,.92)).toBeCloseTo(73.6);
    expect(effectiveSpeedKmh(80,1.25)).toBe(100);
  });
  it("applies sensitive thermal thresholds and only amplifies seasonal extremes",()=>{
    expect(composeEffectiveSpeedMultiplier({weather:"cloudy",windSpeedKmh:0,isDay:true,season:"winter",temperatureC:10})).toBe(1);
    expect(composeEffectiveSpeedMultiplier({weather:"cloudy",windSpeedKmh:0,isDay:true,season:"winter",temperatureC:9.9})).toBe(.97);
    expect(composeEffectiveSpeedMultiplier({weather:"cloudy",windSpeedKmh:0,isDay:true,season:"winter",temperatureC:2.9})).toBe(.95);
    expect(composeEffectiveSpeedMultiplier({weather:"clear",windSpeedKmh:0,isDay:true,season:"summer",temperatureC:27})).toBe(.98);
    expect(composeEffectiveSpeedMultiplier({weather:"cloudy",windSpeedKmh:0,isDay:true,season:"summer",temperatureC:34})).toBe(.95);
  });
});
