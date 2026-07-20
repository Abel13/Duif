import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  resolveAuthJourneyState,
  resolveSignUpResponse,
  sanitizeIntendedRoute,
  type AuthJourneyState,
  type AuthPublicResult,
} from "./authContracts";
import { getSupabaseClient } from "./client";
import { getSupabaseConfig } from "./config";
import type { AuthProfile } from "./profile";
import {
  advanceOnboarding as advanceOnboardingRequest,
  beginOrResumeOnboarding,
  provisionInitialMascot as provisionInitialMascotRequest,
  saveInitialMascotDraft as saveInitialMascotDraftRequest,
  type AccountOnboarding,
  type OnboardingStage,
} from "./onboarding";
import { acknowledgeInauguralPostcardHint as acknowledgeInauguralPostcardHintRequest, acknowledgeTutorialInstruction as acknowledgeTutorialInstructionRequest, collectTutorialDelivery as collectTutorialDeliveryRequest, startOrResumeTutorialDelivery as startOrResumeTutorialDeliveryRequest, type TutorialDeliveryState, type TutorialInstructionStep } from "./tutorial";
import { completeNestSetup as completeNestSetupRequest } from "./nest";
import type { NestCoordinate } from "../../game/nest";

const pendingEmailStorageKey = "duif.auth.pendingVerificationEmail";

type AuthContextValue = {
  isConfigured: boolean;
  isLoading: boolean;
  isServiceAvailable: boolean;
  isPasswordRecovery: boolean;
  journeyState: AuthJourneyState;
  pendingVerificationEmail: string | null;
  onboarding: AccountOnboarding | null;
  profile: AuthProfile | null;
  session: Session | null;
  completePasswordReset: (password: string) => Promise<AuthPublicResult>;
  dismissVerification: () => void;
  exchangeAuthCode: (code: string, purpose?: "confirmation" | "recovery") => Promise<AuthPublicResult>;
  requestPasswordReset: (email: string) => Promise<AuthPublicResult>;
  resendConfirmation: (email: string) => Promise<AuthPublicResult>;
  signIn: (email: string, password: string) => Promise<AuthPublicResult>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, intendedRoute?: string | null) => Promise<AuthPublicResult>;
  advanceOnboarding: (
    expectedStage: OnboardingStage,
    nextStage: OnboardingStage,
    displayName?: string,
  ) => Promise<AccountOnboarding>;
  saveInitialMascotDraft: (templateId: string, mascotName: string) => Promise<AccountOnboarding>;
  provisionInitialMascot: () => Promise<void>;
  acknowledgeTutorialInstruction: (step: TutorialInstructionStep) => Promise<AccountOnboarding>;
  collectTutorialDelivery: () => Promise<void>;
  acknowledgeInauguralPostcardHint: () => Promise<void>;
  startOrResumeTutorialDelivery: () => Promise<TutorialDeliveryState>;
  completeNestSetup: (selection: NestCoordinate, cityId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(authUserId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("auth_user_id", authUserId).maybeSingle();
  if (error) throw error;
  return data;
}

function authRedirect(path: string) {
  return typeof window === "undefined" ? undefined : `${window.location.origin}${path}`;
}

function reportAuthFailure(operation: string, error: unknown) {
  const details = typeof error === "object" && error !== null
    ? error as { code?: unknown; status?: unknown }
    : {};
  console.error(`[auth] ${operation} failed`, {
    code: typeof details.code === "string" ? details.code : "unknown",
    status: typeof details.status === "number" ? details.status : undefined,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = getSupabaseConfig().isConfigured;
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [isServiceAvailable, setIsServiceAvailable] = useState(isConfigured);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [onboarding, setOnboarding] = useState<AccountOnboarding | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.sessionStorage.getItem(pendingEmailStorageKey),
  );

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsServiceAvailable(false);
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;
    async function applySession(nextSession: Session | null) {
      if (!isMounted) return;
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setOnboarding(null);
        return;
      }
      setPendingVerificationEmail(null);
      window.sessionStorage.removeItem(pendingEmailStorageKey);
      const [nextProfile, nextOnboarding] = await Promise.all([
        fetchProfile(nextSession.user.id),
        beginOrResumeOnboarding(),
      ]);
      setProfile(nextProfile);
      setOnboarding(nextOnboarding);
    }

    supabase.auth.getSession()
      .then(async ({ data, error }) => {
        if (error) throw error;
        setIsServiceAvailable(true);
        await applySession(data.session);
      })
      .catch(() => {
        if (isMounted) setIsServiceAvailable(false);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setIsPasswordRecovery(true);
      void applySession(nextSession).catch(() => {
        if (isMounted) setIsServiceAvailable(false);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthPublicResult> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, code: "serviceUnavailable" };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { ok: false, code: "invalidCredentials" } : { ok: true };
  }, []);

  const dismissVerification = useCallback(() => {
    setPendingVerificationEmail(null);
    window.sessionStorage.removeItem(pendingEmailStorageKey);
  }, []);

  const signUp = useCallback(async (email: string, password: string, intendedRoute?: string | null): Promise<AuthPublicResult> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, code: "serviceUnavailable" };
    const normalizedEmail = email.trim();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: authRedirect(`/auth/callback?next=${encodeURIComponent(sanitizeIntendedRoute(intendedRoute ?? null))}`),
        },
      });
      const result = resolveSignUpResponse({ error, hasUser: Boolean(data.user) });

      if (!result.ok) {
        reportAuthFailure("signUp", error ?? { code: "missing_user" });
        return result;
      }

      if (!data.session) {
        setPendingVerificationEmail(normalizedEmail);
        window.sessionStorage.setItem(pendingEmailStorageKey, normalizedEmail);
      }
      return result;
    } catch (error) {
      reportAuthFailure("signUp", error);
      return { ok: false, code: "requestFailed" };
    }
  }, []);

  const resendConfirmation = useCallback(async (email: string): Promise<AuthPublicResult> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, code: "serviceUnavailable" };
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: authRedirect("/auth/callback") },
      });
      if (error) {
        reportAuthFailure("resendConfirmation", error);
        return { ok: false, code: "requestFailed" };
      }
      return { ok: true };
    } catch (error) {
      reportAuthFailure("resendConfirmation", error);
      return { ok: false, code: "requestFailed" };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthPublicResult> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, code: "serviceUnavailable" };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: authRedirect("/auth/reset-password"),
      });
      if (error) {
        reportAuthFailure("requestPasswordReset", error);
        return { ok: false, code: "requestFailed" };
      }
      return { ok: true };
    } catch (error) {
      reportAuthFailure("requestPasswordReset", error);
      return { ok: false, code: "requestFailed" };
    }
  }, []);

  const exchangeAuthCode = useCallback(async (code: string, purpose: "confirmation" | "recovery" = "confirmation"): Promise<AuthPublicResult> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, code: "serviceUnavailable" };
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, code: "invalidOrExpiredLink" };
    setIsPasswordRecovery(purpose === "recovery");
    return { ok: true };
  }, []);

  const completePasswordReset = useCallback(async (password: string): Promise<AuthPublicResult> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, code: "serviceUnavailable" };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, code: "invalidOrExpiredLink" };
    await supabase.auth.signOut({ scope: "global" });
    setProfile(null);
    setSession(null);
    setIsPasswordRecovery(false);
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setProfile(null);
    setOnboarding(null);
    setSession(null);
    setIsPasswordRecovery(false);
    setPendingVerificationEmail(null);
    window.sessionStorage.removeItem(pendingEmailStorageKey);
  }, []);

  const advanceOnboarding = useCallback(async (
    expectedStage: OnboardingStage,
    nextStage: OnboardingStage,
    displayName?: string,
  ) => {
    const nextOnboarding = await advanceOnboardingRequest(expectedStage, nextStage, displayName);
    setOnboarding(nextOnboarding);
    return nextOnboarding;
  }, []);

  const saveInitialMascotDraft = useCallback(async (templateId: string, mascotName: string) => {
    const nextOnboarding = await saveInitialMascotDraftRequest(templateId, mascotName);
    setOnboarding(nextOnboarding);
    return nextOnboarding;
  }, []);

  const provisionInitialMascot = useCallback(async () => {
    const result = await provisionInitialMascotRequest();
    setOnboarding(result.onboarding);
    setProfile(result.profile);
  }, []);
  const acknowledgeTutorialInstruction = useCallback(async (step: TutorialInstructionStep) => {
    const result=await acknowledgeTutorialInstructionRequest(step); setOnboarding(result); return result;
  }, []);
  const collectTutorialDelivery = useCallback(async () => {
    const result=await collectTutorialDeliveryRequest(); setOnboarding(result.onboarding);
  }, []);
  const acknowledgeInauguralPostcardHint = useCallback(async () => { const result=await acknowledgeInauguralPostcardHintRequest(); setOnboarding(result); }, []);
  const startOrResumeTutorialDelivery = useCallback(async () => {
    const result=await startOrResumeTutorialDeliveryRequest(); setOnboarding(result.onboarding); return result;
  }, []);
  const completeNestSetup = useCallback(async (selection: NestCoordinate, cityId: string) => {
    const result=await completeNestSetupRequest(selection, cityId); setProfile(result.profile); setOnboarding(result.onboarding);
  }, []);

  const journeyState = resolveAuthJourneyState({
    hasPendingVerification: Boolean(pendingVerificationEmail),
    hasProfile: Boolean(profile),
    hasSession: Boolean(session),
    onboardingStage: onboarding?.stage ?? null,
    isConfigured,
    isLoading,
    isServiceAvailable,
  });

  const contextValue = useMemo<AuthContextValue>(() => ({
    acknowledgeTutorialInstruction,
    acknowledgeInauguralPostcardHint,
    advanceOnboarding,
    completePasswordReset,
    collectTutorialDelivery,
    completeNestSetup,
    dismissVerification,
    exchangeAuthCode,
    isConfigured,
    isLoading,
    isPasswordRecovery,
    isServiceAvailable,
    journeyState,
    pendingVerificationEmail,
    onboarding,
    provisionInitialMascot,
    profile,
    requestPasswordReset,
    resendConfirmation,
    session,
    signIn,
    signOut,
    signUp,
    saveInitialMascotDraft,
    startOrResumeTutorialDelivery,
  }), [acknowledgeTutorialInstruction, acknowledgeInauguralPostcardHint, advanceOnboarding, completePasswordReset, collectTutorialDelivery, completeNestSetup, dismissVerification, exchangeAuthCode, isConfigured, isLoading, isPasswordRecovery, isServiceAvailable,
    journeyState, onboarding, pendingVerificationEmail, profile, requestPasswordReset, resendConfirmation,
    provisionInitialMascot, saveInitialMascotDraft, session, signIn, signOut, signUp, startOrResumeTutorialDelivery]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contextValue = useContext(AuthContext);
  if (!contextValue) throw new Error("useAuth must be used inside AuthProvider.");
  return contextValue;
}
