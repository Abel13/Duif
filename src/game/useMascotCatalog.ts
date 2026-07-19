import { useEffect, useState } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import { fetchAuthenticatedMascots } from "../integrations/supabase/authenticatedMascots";
import { fetchStarterMascotCatalog } from "../integrations/supabase/catalog";
import { isSupabaseCatalogEnabled } from "../integrations/supabase/config";
import { starterMascots } from "./mockData";
import { archiveCollectedMockDeliveries } from "./mockRewardCollection";
import type { Mascot } from "./types";

type MascotCatalogState = {
  isLoading: boolean;
  mascots: Mascot[];
};

export function useMascotCatalog(): MascotCatalogState {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [state, setState] = useState<MascotCatalogState>({
    isLoading: isSupabaseCatalogEnabled(),
    mascots: starterMascots,
  });

  useEffect(() => {
    if (!isSupabaseCatalogEnabled()) {
      setState({ isLoading: false, mascots: archiveCollectedMockDeliveries(starterMascots) });
      return;
    }

    if (isAuthLoading) {
      setState((currentState) => ({ ...currentState, isLoading: true }));
      return;
    }

    let isMounted = true;

    setState((currentState) => ({ ...currentState, isLoading: true }));

    const mascotSource =
      session && profile
        ? fetchAuthenticatedMascots(profile.id).then((authenticatedMascots) =>
            authenticatedMascots.length > 0 ? authenticatedMascots : fetchStarterMascotCatalog(),
          )
        : fetchStarterMascotCatalog();

    mascotSource
      .then((mascots) => {
        if (isMounted) {
          setState({ isLoading: false, mascots });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({ isLoading: false, mascots: archiveCollectedMockDeliveries(starterMascots) });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, profile, session]);

  return state;
}
