import { useEffect, useState } from "react";

import { fetchStarterMascotCatalog } from "../integrations/supabase/catalog";
import { isSupabaseCatalogEnabled } from "../integrations/supabase/config";
import { starterMascots } from "./mockData";
import type { Mascot } from "./types";

type MascotCatalogState = {
  isLoading: boolean;
  mascots: Mascot[];
};

export function useMascotCatalog(): MascotCatalogState {
  const [state, setState] = useState<MascotCatalogState>({
    isLoading: isSupabaseCatalogEnabled(),
    mascots: starterMascots,
  });

  useEffect(() => {
    if (!isSupabaseCatalogEnabled()) {
      setState({ isLoading: false, mascots: starterMascots });
      return;
    }

    let isMounted = true;

    setState((currentState) => ({ ...currentState, isLoading: true }));

    fetchStarterMascotCatalog()
      .then((mascots) => {
        if (isMounted) {
          setState({ isLoading: false, mascots });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({ isLoading: false, mascots: starterMascots });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
