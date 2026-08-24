import { describe, expect, it } from "vitest";
import { authorizeCronRequest, matchesCronSecret } from "./cron-auth";

describe("dedicated cron authentication", () => {
  const secret = "f".repeat(64);

  it("accepts only the exact configured secret", async () => {
    await expect(matchesCronSecret(secret, secret)).resolves.toBe(true);
    await expect(matchesCronSecret(`${secret}x`, secret)).resolves.toBe(false);
    await expect(matchesCronSecret("wrong", secret)).resolves.toBe(false);
  });

  it("rejects missing configuration and missing headers", async () => {
    await expect(matchesCronSecret(null, secret)).resolves.toBe(false);
    await expect(matchesCronSecret(secret, "")).resolves.toBe(false);
  });

  it("maps every request authentication state to a safe response", async () => {
    await expect(authorizeCronRequest({ method: "GET", providedSecret: secret, expectedSecret: secret, internalConfigurationReady: true }))
      .resolves.toEqual({ error: "method_not_allowed", status: 405 });
    await expect(authorizeCronRequest({ method: "POST", providedSecret: secret, expectedSecret: "", internalConfigurationReady: false }))
      .resolves.toEqual({ error: "resolver_configuration_unavailable", status: 500 });
    await expect(authorizeCronRequest({ method: "POST", providedSecret: "wrong", expectedSecret: secret, internalConfigurationReady: true }))
      .resolves.toEqual({ error: "unauthorized", status: 401 });
    await expect(authorizeCronRequest({ method: "POST", providedSecret: secret, expectedSecret: secret, internalConfigurationReady: true }))
      .resolves.toBeNull();
  });
});
