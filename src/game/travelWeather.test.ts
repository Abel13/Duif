import { describe,expect,it } from "vitest";
import { composeEffectiveSpeedMultiplier,meteorologicalSeason,weatherCategoryForWmo } from "./travelWeather";

describe("segmented travel weather rules",()=>{
  it("normalizes every approved WMO family",()=>{
    expect([weatherCategoryForWmo(0),weatherCategoryForWmo(2),weatherCategoryForWmo(3),weatherCategoryForWmo(48),weatherCategoryForWmo(61),weatherCategoryForWmo(71),weatherCategoryForWmo(67),weatherCategoryForWmo(95)])
      .toEqual(["clear","partlyCloudy","cloudy","fogDrizzle","rain","snow","heavyFreezingRain","thunderstorm"]);
  });
  it("inverts meteorological seasons by hemisphere",()=>{
    expect(meteorologicalSeason(new Date("2026-01-15T00:00:00Z"),40)).toBe("winter");
    expect(meteorologicalSeason(new Date("2026-01-15T00:00:00Z"),-20)).toBe("summer");
  });
  it("clamps composed speed and keeps familiarity neutral by default",()=>{
    expect(composeEffectiveSpeedMultiplier({weather:"thunderstorm",windSpeedKmh:80,isDay:false,season:"winter",mascot:-.5})).toBe(.6);
    expect(composeEffectiveSpeedMultiplier({weather:"clear",windSpeedKmh:0,isDay:true,season:"summer",mascot:.5})).toBe(1.25);
    expect(composeEffectiveSpeedMultiplier({weather:"cloudy",windSpeedKmh:0,isDay:true,season:"spring"})).toBe(1);
  });
});
