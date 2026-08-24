const encoder = new TextEncoder();

async function sha256(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

export async function matchesCronSecret(provided: string | null, expected: string) {
  if (!provided || !expected) return false;
  const [providedHash, expectedHash] = await Promise.all([sha256(provided), sha256(expected)]);
  let difference = 0;
  for (let index = 0; index < expectedHash.length; index += 1) {
    difference |= providedHash[index] ^ expectedHash[index];
  }
  return difference === 0;
}

export type CronAuthorizationFailure = { error: "method_not_allowed" | "resolver_configuration_unavailable" | "unauthorized"; status: 405 | 500 | 401 };

export async function authorizeCronRequest(input: {
  method: string;
  providedSecret: string | null;
  expectedSecret: string;
  internalConfigurationReady: boolean;
}): Promise<CronAuthorizationFailure | null> {
  if (input.method !== "POST") return { error: "method_not_allowed", status: 405 };
  if (!input.internalConfigurationReady || !input.expectedSecret) return { error: "resolver_configuration_unavailable", status: 500 };
  if (!await matchesCronSecret(input.providedSecret, input.expectedSecret)) return { error: "unauthorized", status: 401 };
  return null;
}
