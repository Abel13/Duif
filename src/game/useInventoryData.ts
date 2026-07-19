import { useEffect, useState } from "react";

import { fetchAuthenticatedInventoryItems } from "../integrations/supabase/authenticatedInventory";
import { useAuth } from "../integrations/supabase/AuthProvider";
import type { InventoryItem } from "./types";

type InventoryDataState = { isAuthenticatedSource: true; isLoading: boolean; items: InventoryItem[] };

export function useInventoryData(): InventoryDataState {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [state, setState] = useState<InventoryDataState>({ isAuthenticatedSource: true, isLoading: true, items: [] });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!session || !profile) {
      setState({ isAuthenticatedSource: true, isLoading: false, items: [] });
      return;
    }
    let active = true;
    fetchAuthenticatedInventoryItems(profile.id)
      .then((items) => active && setState({ isAuthenticatedSource: true, isLoading: false, items: items ?? [] }))
      .catch(() => active && setState({ isAuthenticatedSource: true, isLoading: false, items: [] }));
    return () => { active = false; };
  }, [isAuthLoading, profile, session]);

  return state;
}
