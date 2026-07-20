import type { Database } from "./database.types";
import type { AuthProfile } from "./profile";
import { getSupabaseClient } from "./client";

export type AccountOnboarding = Database["public"]["Tables"]["account_onboarding"]["Row"];
export type OnboardingStage = Database["public"]["Enums"]["onboarding_stage"];
export type InitialMascot = Database["public"]["Tables"]["player_mascots"]["Row"];
export type InitialMascotProvisioningResult = {
  onboarding: AccountOnboarding;
  profile: AuthProfile;
  mascot: InitialMascot;
};

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

export function limitPlayerNameInput(value: string, maximumLength = 24) {
  return Array.from(value).slice(0, maximumLength).join("");
}

export function isValidPlayerDisplayName(value: string) {
  const normalized = normalizePlayerDisplayName(value);
  const length = Array.from(normalized).length;
  return length >= 2 && length <= 24 && !/\p{Cc}/u.test(normalized);
}

export const normalizeMascotName = normalizePlayerDisplayName;
export const isValidMascotName = isValidPlayerDisplayName;

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

export async function saveInitialMascotDraft(templateId: string, mascotName: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.rpc("save_initial_mascot_draft", {
    template_id: templateId,
    requested_mascot_name: normalizeMascotName(mascotName),
  });
  if (error || !data) throw error ?? new Error("Mascot draft could not be saved");
  return data;
}

export async function provisionInitialMascot() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.rpc("provision_initial_mascot");
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    throw error ?? new Error("Initial mascot could not be provisioned");
  }
  const result = data as unknown as InitialMascotProvisioningResult;
  if (!result.onboarding || !result.profile || !result.mascot) {
    throw new Error("Invalid initial mascot provisioning response");
  }
  return result;
}
