import { describe, expect, it } from "vitest";
import { calculateLoadoutComparison, groupEquipmentInstances, type EquipmentInstance, type FunctionalEquipmentCatalogItem } from "./equipment";

const catalog: FunctionalEquipmentCatalogItem[] = [
  { id:"small",catalogKey:"backpack-small",nameKey:"functionalEquipment.smallBackpack.name",descriptionKey:"functionalEquipment.smallBackpack.description",kind:"backpack",seedPrice:150,slotBonus:1,speedMultiplier:.95,effects:[] },
  { id:"rain",catalogKey:"utility-raincoat",nameKey:"functionalEquipment.raincoat.name",descriptionKey:"functionalEquipment.raincoat.description",kind:"utility",seedPrice:200,maxUses:10,repairSeedPrice:80,slotBonus:0,speedMultiplier:1,effects:[{hazardKey:"wet",mitigationPoints:.03,sortOrder:1}] },
];
const instances: EquipmentInstance[] = [
  { id:"one",catalogId:"small",acquiredAt:"2026-08-25T00:00:00Z" },
  { id:"two",catalogId:"rain",usesRemaining:10,acquiredAt:"2026-08-25T00:00:00Z" },
  { id:"three",catalogId:"rain",usesRemaining:0,acquiredAt:"2026-08-25T00:00:00Z" },
];

describe("functional equipment", () => {
  it("groups physical copies without merging their durability", () => {
    const groups=groupEquipmentInstances(instances);
    expect(groups.get("rain")?.map(item=>item.usesRemaining)).toEqual([10,0]);
  });

  it("shows concrete rain mitigation and backpack tradeoffs", () => {
    expect(calculateLoadoutComparison(catalog,instances[0],instances[1],{category:"rain",isDay:true,windSpeedKmh:5})).toEqual({activeMitigations:[{hazardKey:"wet",mitigationPoints:.03}],mitigationPoints:.03,slotCapacity:4,speedMultiplier:.95});
  });

  it("does not claim protection outside the selected condition", () => {
    expect(calculateLoadoutComparison(catalog,instances[0],instances[1],{category:"snow",isDay:false,windSpeedKmh:55}).mitigationPoints).toBe(0);
  });
});
