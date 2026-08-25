import { describe,expect,it } from "vitest";
import { mapSkillPreviewPayload } from "./skillPreview";

describe("skill preview mapper",()=>{
  it("accepts explicit v3 effects and drops malformed entries",()=>{
    expect(mapSkillPreviewPayload({weatherMayChange:true,skillEffects:[{skillId:"skill-trovao-crosswind",level:4,state:"active",reason:"snapshot",weatherDependent:true},{skillId:3}]})).toEqual({weatherMayChange:true,skillEffects:[{skillId:"skill-trovao-crosswind",level:4,state:"active",reason:"snapshot",weatherDependent:true}]});
  });
  it("rejects payloads without an effects array",()=>expect(mapSkillPreviewPayload({version:3})).toBeUndefined());
});
