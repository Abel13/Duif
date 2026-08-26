import { describe,expect,it } from "vitest";
import { parseWorldLandmarksPayload } from "./worldLandmarks";

describe("world landmarks payload",()=>{
  it("maps only complete authoritative unlocks",()=>{
    const result=parseWorldLandmarksPayload({landmarks:[{catalogKey:"landmark.christ-the-redeemer",nameKey:"landmarks.christTheRedeemer.name",descriptionKey:"landmarks.christTheRedeemer.description",assetKey:"landmark.christTheRedeemer.artwork",postcardCatalogKey:"postcard-landmark-christ-the-redeemer",category:"cultural",city:"Rio de Janeiro",region:"Rio de Janeiro",countryCode:"BR",latitude:-22.95192,longitude:-43.21049,minimumZoom:8,iconSizePx:56,unlockedAt:"2026-08-25T12:00:00Z",announcementPending:true},{catalogKey:"incomplete"}]});
    expect(result).toHaveLength(1);expect(result[0]).toMatchObject({catalogKey:"landmark.christ-the-redeemer",announcementPending:true,coordinates:{latitude:-22.95192,longitude:-43.21049}});
  });
  it("uses an empty safe fallback for unavailable data",()=>{expect(parseWorldLandmarksPayload(null)).toEqual([]);expect(parseWorldLandmarksPayload({landmarks:"invalid"})).toEqual([]);});
});
