import { useEffect, useState } from "react";

import { fetchAuthenticatedInventoryItems } from "../integrations/supabase/authenticatedInventory";
import { useAuth } from "../integrations/supabase/AuthProvider";
import { isSupabaseCatalogEnabled } from "../integrations/supabase/config";
import { mockInventoryItems } from "./inventory";
import { readMockRewardCollection } from "./mockRewardCollection";
import type { InventoryItem } from "./types";

type InventoryDataState = {
  isAuthenticatedSource: boolean;
  isLoading: boolean;
  items: InventoryItem[];
};

function createMockInventoryState(): InventoryDataState {
  return {
    isAuthenticatedSource: false,
    isLoading: false,
    items: [...mockInventoryItems, ...readMockRewardCollection().inventory],
  };
}

export function useInventoryData(): InventoryDataState {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [state, setState] = useState<InventoryDataState>(createMockInventoryState);

  useEffect(() => {
    if (!isSupabaseCatalogEnabled()) {
      setState(createMockInventoryState());
      return;
    }

    if (isAuthLoading) {
      setState((currentState) => ({ ...currentState, isLoading: true }));
      return;
    }

    if (!session || !profile) {
      setState(createMockInventoryState());
      return;
    }

    let isMounted = true;

    setState((currentState) => ({ ...currentState, isLoading: true }));

    fetchAuthenticatedInventoryItems(profile.id)
      .then((items) => {
        if (!isMounted) {
          return;
        }

        setState({
          isAuthenticatedSource: true,
          isLoading: false,
          items: items ?? mockInventoryItems,
        });
      })
      .catch(() => {
        if (isMounted) {
          setState(createMockInventoryState());
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, profile, session]);

  return state;
}
