export function sanitizePushDeepLink(candidate: unknown, fallback = "/nest") {
  if (typeof candidate !== "string") return fallback;
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return fallback;
  if (candidate.startsWith("/auth")) return fallback;
  return candidate;
}
