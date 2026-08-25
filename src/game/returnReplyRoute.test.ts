import { describe, expect, it } from "vitest";

import { getReturnReplyRoute } from "./returnReplyRoute";

describe("return reply route", () => {
  it("keeps the inverted return context when rendering the reply envelope", () => {
    const route = getReturnReplyRoute(
      "Londrina, Paraná • BR",
      "Manhuaçu, Minas Gerais • BR",
    );

    expect(route).toEqual({
      originLabel: "Londrina, Paraná • BR",
      destinationLabel: "Manhuaçu, Minas Gerais • BR",
    });
  });
});
