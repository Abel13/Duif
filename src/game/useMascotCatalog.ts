import { useEffect, useState } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import { fetchAuthenticatedMascots } from "../integrations/supabase/authenticatedMascots";
import type { Mascot } from "./types";

type MascotCatalogState = { isLoading: boolean; mascots: Mascot[] };

export function useMascotCatalog(): MascotCatalogState {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [state, setState] = useState<MascotCatalogState>({ isLoading: true, mascots: [] });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!session || !profile) {
      setState({ isLoading: false, mascots: [] });
      return;
    }
    let active = true;
    setState((current) => ({ ...current, isLoading: true }));
    fetchAuthenticatedMascots(profile.id)
      .then((mascots) => active && setState({ isLoading: false, mascots }))
      .catch(() => active && setState({ isLoading: false, mascots: [] }));
    return () => { active = false; };
  }, [isAuthLoading, profile, session]);

  return state;
}
