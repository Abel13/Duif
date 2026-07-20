import {describe,expect,it} from "vitest";
import type {Delivery} from "../../game";
import {getNextTutorialInstruction,getTutorialInstructionAvailableAt,isTutorialInstructionAvailable} from "./tutorial";

const delivery={outboundStartAt:"2026-07-19T12:01:00Z",outboundArrivalAt:"2026-07-19T12:08:00Z",returnStartAt:"2026-07-19T12:09:00Z",returnArrivalAt:"2026-07-19T12:16:00Z"} as Delivery;

describe("tutorial timeline",()=>{
  it("keeps instruction order linear",()=>{expect(getNextTutorialInstruction(null)).toBe("preparing");expect(getNextTutorialInstruction("outbound")).toBe("discovery");expect(getNextTutorialInstruction("collection")).toBeUndefined();});
  it("places discovery at the exact middle of outbound travel",()=>{expect(new Date(getTutorialInstructionAvailableAt("discovery",delivery)).toISOString()).toBe("2026-07-19T12:04:30.000Z");});
  it("unlocks a step exactly at its threshold",()=>{expect(isTutorialInstructionAvailable("destination",delivery,new Date("2026-07-19T12:07:59.999Z"))).toBe(false);expect(isTutorialInstructionAvailable("destination",delivery,new Date("2026-07-19T12:08:00Z"))).toBe(true);});
});
