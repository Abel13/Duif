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

import { getSupabaseClient } from "./client";
import { getSupabaseConfig } from "./config";
import type { AuthProfile } from "./profile";

type AuthContextValue = {
  isConfigured: boolean;
  isLoading: boolean;
  profile: AuthProfile | null;
  session: Session | null;
  claimCurrentProfile: () => Promise<AuthProfile | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function claimProfile() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.rpc("claim_current_profile");

  if (error) {
    throw error;
  }

  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = getSupabaseConfig().isConfigured;
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const claimCurrentProfile = useCallback(async () => {
    const claimedProfile = await claimProfile();
    setProfile(claimedProfile);

    return claimedProfile;
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!isMounted) {
          return;
        }

        setSession(data.session);

        if (data.session) {
          try {
            await claimCurrentProfile();
          } catch {
            setProfile(null);
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession) {
        setProfile(null);
        return;
      }

      claimCurrentProfile().catch(() => {
        setProfile(null);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [claimCurrentProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setProfile(null);
    setSession(null);
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      claimCurrentProfile,
      isConfigured,
      isLoading,
      profile,
      session,
      signIn,
      signOut,
      signUp,
    }),
    [claimCurrentProfile, isConfigured, isLoading, profile, session, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contextValue = useContext(AuthContext);

  if (!contextValue) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return contextValue;
}
