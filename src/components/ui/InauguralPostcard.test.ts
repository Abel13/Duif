import { describe, expect, it } from "vitest";
import { formatInauguralPostmark } from "./InauguralPostcard";

describe("InauguralPostcard", () => {
  it("formats the authoritative return date in the active locale", () => {
    expect(formatInauguralPostmark("2026-07-20T12:00:00.000Z", "pt-BR")).toBe("20 de jul. de 2026");
    expect(formatInauguralPostmark("2026-07-20T12:00:00.000Z", "en-US")).toBe("Jul 20, 2026");
  });
  it("does not invent a completion date", () => { expect(formatInauguralPostmark(undefined, "pt-BR")).toBe("—"); });
});
