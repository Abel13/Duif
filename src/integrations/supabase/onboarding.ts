import type { Database } from "./database.types";
import { getSupabaseClient } from "./client";

export type AccountOnboarding = Database["public"]["Tables"]["account_onboarding"]["Row"];
export type OnboardingStage = Database["public"]["Enums"]["onboarding_stage"];

export const onboardingIntroStages = [
  "welcome",
  "travel",
  "discoveries",
  "returnCollection",
  "displayName",
] as const satisfies readonly OnboardingStage[];

export function normalizePlayerDisplayName(value: string) {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}

export function isValidPlayerDisplayName(value: string) {
  const normalized = normalizePlayerDisplayName(value);
  const length = Array.from(normalized).length;
  return length >= 2 && length <= 24 && !/\p{Cc}/u.test(normalized);
}

export function onboardingIntroIndex(stage: OnboardingStage) {
  const index = onboardingIntroStages.indexOf(stage as typeof onboardingIntroStages[number]);
  return index < 0 ? onboardingIntroStages.length : index;
}

export async function beginOrResumeOnboarding() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.rpc("begin_or_resume_onboarding");
  if (error || !data) throw error ?? new Error("Onboarding could not be initialized");
  return data;
}

export async function advanceOnboarding(
  expectedStage: OnboardingStage,
  nextStage: OnboardingStage,
  displayName?: string,
) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.rpc("advance_account_onboarding", {
    expected_stage: expectedStage,
    next_stage: nextStage,
    requested_display_name: displayName === undefined ? undefined : normalizePlayerDisplayName(displayName),
  });
  if (error || !data) throw error ?? new Error("Onboarding could not be advanced");
  return data;
}
