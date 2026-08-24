import { describe,expect,it } from "vitest";
import { composeEffectiveSpeedMultiplier,geographicVisualTheme,isDayAtLongitude,meteorologicalSeason,weatherCategoryForWmo } from "./travelWeather";

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
  it("clamps composed speed and keeps familiarity neutral by default",()=>{
    expect(composeEffectiveSpeedMultiplier({weather:"thunderstorm",windSpeedKmh:80,isDay:false,season:"winter",mascot:-.5})).toBe(.6);
    expect(composeEffectiveSpeedMultiplier({weather:"clear",windSpeedKmh:0,isDay:true,season:"summer",mascot:.5})).toBe(1.25);
    expect(composeEffectiveSpeedMultiplier({weather:"cloudy",windSpeedKmh:0,isDay:true,season:"spring"})).toBe(1);
  });
});
