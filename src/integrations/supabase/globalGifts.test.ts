import { describe, expect, it } from "vitest";

import { mapGlobalGiftClaim } from "./globalGifts";

describe("global gift claims", () => {
  it("maps the authoritative seed quantity returned after a claim", () => {
    expect(mapGlobalGiftClaim({ seedQuantity: 100 })).toEqual({ seedQuantity: 100 });
  });

  it.each([undefined, null, {}, { seedQuantity: 0 }, { seedQuantity: 1.5 }, { seedQuantity: "100" }])(
    "rejects an invalid claim result: %j",
    (result) => {
      expect(() => mapGlobalGiftClaim(result)).toThrow("Invalid global gift claim");
    },
  );
});
