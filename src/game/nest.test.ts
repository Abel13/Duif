import { describe, expect, it } from "vitest";
import { quantizeNestCoordinate } from "./nest";

describe("nest coordinate quantization",()=>{
  it("returns a deterministic approximate coordinate",()=>{const first=quantizeNestCoordinate({latitude:-23.55,longitude:-46.63});expect(first).toEqual(quantizeNestCoordinate({latitude:-23.55,longitude:-46.63}));expect(first?.latitude).not.toBe(-23.55);});
  it("rejects invalid points",()=>{expect(quantizeNestCoordinate({latitude:91,longitude:0})).toBeUndefined();});
});
