export type AuthJourneyState =
  | "loading"
  | "serviceUnavailable"
  | "anonymous"
  | "verificationPending"
  | "onboardingRequired"
  | "tutorialActive"
  | "nestSetupRequired"
  | "ready";

export type AuthPublicResult = { ok: true } | { ok: false; code: AuthPublicErrorCode };

export type AuthPublicErrorCode =
  | "invalidCredentials"
  | "invalidOrExpiredLink"
  | "serviceUnavailable";

export const passwordPolicy = {
  minimumLength: 8,
  requiresLetter: true,
  requiresNumber: true,
} as const;

export function meetsPasswordPolicy(password: string) {
  return password.length >= passwordPolicy.minimumLength && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function resolveAuthJourneyState({
  isConfigured,
  isLoading,
  isServiceAvailable,
  hasPendingVerification,
  hasProfile,
  hasSession,
}: {
  isConfigured: boolean;
  isLoading: boolean;
  isServiceAvailable: boolean;
  hasPendingVerification: boolean;
  hasProfile: boolean;
  hasSession: boolean;
}): AuthJourneyState {
  if (isLoading) return "loading";
  if (!isConfigured || !isServiceAvailable) return "serviceUnavailable";
  if (hasSession) return hasProfile ? "ready" : "onboardingRequired";
  if (hasPendingVerification) return "verificationPending";
  return "anonymous";
}

export function sanitizeIntendedRoute(candidate: string | null) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) return "/";
  try {
    const url = new URL(candidate, "https://duif.invalid");
    if (url.origin !== "https://duif.invalid" || url.pathname.startsWith("/auth")) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "••••";
  return `${localPart.slice(0, 2)}${"•".repeat(Math.max(2, localPart.length - 2))}@${domain}`;
}
