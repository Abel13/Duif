import {describe,expect,it} from "vitest";
import {isLandmarkFullyVisible} from "./TravelMap";
import type {WorldLandmark} from "../../game";

const landmark:WorldLandmark={announcementPending:false,assetKey:"landmark.christTheRedeemer.artwork",catalogKey:"landmark.christ-the-redeemer",postcardCatalogKey:"postcard-landmark-christ-the-redeemer",category:"cultural",city:"Rio de Janeiro",coordinates:{latitude:-22.95192,longitude:-43.21049},countryCode:"BR",descriptionKey:"landmarks.christTheRedeemer.description",iconSizePx:56,minimumZoom:8,nameKey:"landmarks.christTheRedeemer.name",unlockedAt:"2026-08-25T12:00:00Z"};
describe("world landmark map visibility",()=>{it("requires zoom and the complete sticker inside the viewport",()=>{const map={getZoom:()=>8,project:()=>({x:100,y:100}),getContainer:()=>({clientWidth:200,clientHeight:200})};expect(isLandmarkFullyVisible(map as never,landmark)).toBe(true);expect(isLandmarkFullyVisible({...map,getZoom:()=>7.9} as never,landmark)).toBe(false);expect(isLandmarkFullyVisible({...map,project:()=>({x:10,y:100})} as never,landmark)).toBe(false);});});
