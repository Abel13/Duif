import { describe, expect, it } from "vitest";

import {
  getNestMascotNeighbors,
  resolveNestMascotId,
  readStoredNestMascotId,
  writeStoredNestMascotId,
} from "./mascotNavigation";
import { starterMascots } from "./mockData";

describe("nest mascot navigation", () => {
  it("prioritizes a valid route mascot, then the saved mascot, then the first mascot", () => {
    expect(resolveNestMascotId(starterMascots, starterMascots[1]?.id, starterMascots[2]?.id)).toBe(starterMascots[1]?.id);
    expect(resolveNestMascotId(starterMascots, "missing", starterMascots[2]?.id)).toBe(starterMascots[2]?.id);
    expect(resolveNestMascotId(starterMascots, "missing", "stale")).toBe(starterMascots[0]?.id);
  });

  it("returns no mascot for an empty catalog", () => {
    expect(resolveNestMascotId([], "missing", "stale")).toBeUndefined();
  });

  it("does not wrap at the first or final mascot", () => {
    expect(getNestMascotNeighbors(starterMascots, starterMascots[0]?.id)).toMatchObject({
      next: starterMascots[1],
      previous: undefined,
    });
    expect(getNestMascotNeighbors(starterMascots, starterMascots[starterMascots.length - 1]?.id)).toMatchObject({
      next: undefined,
      previous: starterMascots[starterMascots.length - 2],
    });
  });

  it("reads, writes, and clears a device-local mascot preference", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    };
    writeStoredNestMascotId("mascot-a", storage);
    expect(readStoredNestMascotId(storage)).toBe("mascot-a");
    writeStoredNestMascotId(undefined, storage);
    expect(readStoredNestMascotId(storage)).toBeUndefined();
  });
});
