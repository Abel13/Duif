import { describe, expect, it } from "vitest";

import { isPersistedDeliveryId } from "./travelVisualTimeZone";

describe("travel visual timezone delivery identity", () => {
  it("accepts persisted UUID delivery identities", () => {
    expect(isPersistedDeliveryId("6a029df3-d6df-4418-bb9e-9b609c698adb")).toBe(true);
  });

  it("rejects idle and malformed visual identities before the UUID RPC", () => {
    expect(isPersistedDeliveryId("idle-nest")).toBe(false);
    expect(isPersistedDeliveryId("6a029df3-d6df-4418")).toBe(false);
  });
});
