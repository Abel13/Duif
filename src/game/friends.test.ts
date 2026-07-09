import { describe, expect, it } from "vitest";

import { getFriendById, getFriendCorrespondence, getFriendMascots } from "./friends";

describe("friend helpers", () => {
  it("finds a friend by id", () => {
    expect(getFriendById("friend-lisbon")?.name).toBe("Lia");
  });

  it("returns friend mascot previews", () => {
    const mascots = getFriendMascots("friend-toronto");

    expect(mascots).toHaveLength(2);
    expect(mascots.map((mascot) => mascot.name)).toEqual(["Atlas", "Luma"]);
  });

  it("returns received correspondence previews", () => {
    const correspondence = getFriendCorrespondence("friend-curitiba");

    expect(correspondence).toHaveLength(1);
    expect(correspondence[0]?.type).toBe("letter");
  });

  it("returns empty values for an invalid friend id", () => {
    expect(getFriendById("friend-missing")).toBeUndefined();
    expect(getFriendMascots("friend-missing")).toEqual([]);
    expect(getFriendCorrespondence("friend-missing")).toEqual([]);
  });
});
