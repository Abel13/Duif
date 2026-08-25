import { useEffect, useState } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import { fetchAuthenticatedMascots } from "../integrations/supabase/authenticatedMascots";
import type { Mascot } from "./types";

type MascotCatalogState = { isLoading: boolean; mascots: Mascot[]; reload:()=>void };

export function useMascotCatalog(): MascotCatalogState {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [state, setState] = useState<MascotCatalogState>({ isLoading: true, mascots: [], reload:()=>undefined });
  const [revision,setRevision]=useState(0);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!session || !profile) {
      setState((current)=>({ ...current,isLoading: false, mascots: [] }));
      return;
    }
    let active = true;
    setState((current) => ({ ...current, isLoading: true }));
    fetchAuthenticatedMascots(profile.id)
      .then((mascots) => active && setState((current)=>({ ...current,isLoading: false, mascots })))
      .catch(() => active && setState((current)=>({ ...current,isLoading: false, mascots: [] })));
    return () => { active = false; };
  }, [isAuthLoading, profile, revision, session]);

  return {...state,reload:()=>setRevision(value=>value+1)};
}
