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
  isServiceAvailable: boolean;
  profile: AuthProfile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(authUserId: string) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = getSupabaseConfig().isConfigured;
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [isServiceAvailable, setIsServiceAvailable] = useState(isConfigured);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setIsServiceAvailable(false);
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          setIsServiceAvailable(false);
          return;
        }

        setIsServiceAvailable(true);

        setSession(data.session);

        if (data.session) {
          try {
            setProfile(await fetchProfile(data.session.user.id));
          } catch {
            setProfile(null);
            setIsServiceAvailable(false);
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

      fetchProfile(nextSession.user.id)
        .then(setProfile)
        .catch(() => {
          setProfile(null);
          setIsServiceAvailable(false);
        });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured]);

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
      isConfigured,
      isLoading,
      isServiceAvailable,
      profile,
      session,
      signIn,
      signOut,
    }),
    [isConfigured, isLoading, isServiceAvailable, profile, session, signIn, signOut],
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
