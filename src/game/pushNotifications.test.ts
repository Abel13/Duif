import { describe, expect, it } from "vitest";

import { sanitizePushDeepLink } from "./pushNotifications";

describe("sanitizePushDeepLink", () => {
  it("keeps safe in-app paths", () => {
    expect(sanitizePushDeepLink("/mailbox")).toBe("/mailbox");
    expect(sanitizePushDeepLink("/nest")).toBe("/nest");
    expect(sanitizePushDeepLink("/map")).toBe("/map");
  });

  it("rejects auth and external-looking paths", () => {
    expect(sanitizePushDeepLink("/auth")).toBe("/nest");
    expect(sanitizePushDeepLink("//evil.example")).toBe("/nest");
    expect(sanitizePushDeepLink("https://evil.example")).toBe("/nest");
    expect(sanitizePushDeepLink(null)).toBe("/nest");
  });
});
