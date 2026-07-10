import { useEffect, useState } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import {
  collectAuthenticatedReward,
  fetchAuthenticatedRewardCollection,
  type AuthenticatedRewardCollection,
  type CollectedRewardResult,
} from "../integrations/supabase/authenticatedRewards";
import { isSupabaseCatalogEnabled } from "../integrations/supabase/config";
import type { TranslationKey } from "../i18n";
import { createMockRewardFromDelivery, initialMockInventory } from "./rewards";
import { getDeliveryById } from "./mockData";
import type { Delivery, DeliveryReward, InventoryItem } from "./types";

type RewardCollectionState = {
  delivery?: Delivery;
  error?: TranslationKey;
  inventoryCount: number;
  isAuthenticatedSource: boolean;
  isCollected: boolean;
  isLoading: boolean;
  isMutating: boolean;
  reward?: DeliveryReward;
};

type RewardCollectionActions = {
  collectReward: () => Promise<void>;
};

function createMockRewardCollectionState(deliveryId?: string): RewardCollectionState {
  const delivery = deliveryId ? getDeliveryById(deliveryId) : undefined;

  return {
    delivery,
    inventoryCount: initialMockInventory.length,
    isAuthenticatedSource: false,
    isCollected: false,
    isLoading: false,
    isMutating: false,
    reward: createMockRewardFromDelivery(delivery),
  };
}

function mapAuthenticatedState(
  data: AuthenticatedRewardCollection | undefined,
): RewardCollectionState | undefined {
  if (!data) {
    return undefined;
  }

  return {
    delivery: data.delivery,
    inventoryCount: data.inventoryCount,
    isAuthenticatedSource: true,
    isCollected: data.isCollected,
    isLoading: false,
    isMutating: false,
    reward: data.reward,
  };
}

export function useRewardCollectionData(
  deliveryId?: string,
): RewardCollectionState & RewardCollectionActions {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [mockInventory, setMockInventory] = useState<InventoryItem[]>(initialMockInventory);
  const [state, setState] = useState<RewardCollectionState>(() =>
    createMockRewardCollectionState(deliveryId),
  );

  useEffect(() => {
    if (!isSupabaseCatalogEnabled() || !deliveryId) {
      setState({
        ...createMockRewardCollectionState(deliveryId),
        inventoryCount: mockInventory.length,
      });
      return;
    }

    if (isAuthLoading) {
      setState((currentState) => ({ ...currentState, isLoading: true }));
      return;
    }

    if (!session || !profile) {
      setState({
        ...createMockRewardCollectionState(deliveryId),
        inventoryCount: mockInventory.length,
      });
      return;
    }

    let isMounted = true;

    setState((currentState) => ({ ...currentState, isLoading: true }));

    fetchAuthenticatedRewardCollection(deliveryId, profile.id)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setState(
          mapAuthenticatedState(data) ?? {
            ...createMockRewardCollectionState(deliveryId),
            inventoryCount: mockInventory.length,
          },
        );
      })
      .catch(() => {
        if (isMounted) {
          setState({
            ...createMockRewardCollectionState(deliveryId),
            inventoryCount: mockInventory.length,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [deliveryId, isAuthLoading, mockInventory.length, profile, session]);

  async function collectReward() {
    if (!state.delivery || !state.reward || state.isCollected) {
      return;
    }

    if (!state.isAuthenticatedSource) {
      const inventoryItem: InventoryItem = {
        ...state.reward.item,
        category: "keepsakes",
        collectedAt: new Date().toISOString(),
        equipped: false,
        sourceKey: "inventory.sources.routeReward",
      };

      setMockInventory((currentInventory) => [...currentInventory, inventoryItem]);
      setState((currentState) => ({
        ...currentState,
        inventoryCount: currentState.inventoryCount + 1,
        isCollected: true,
      }));
      return;
    }

    setState((currentState) => ({ ...currentState, error: undefined, isMutating: true }));

    try {
      const result: CollectedRewardResult | undefined = await collectAuthenticatedReward({
        deliveryId: state.delivery.id,
        mascotId: state.delivery.mascotId,
      });

      if (!result) {
        throw new Error("Reward was not collected.");
      }

      setState((currentState) => ({
        ...currentState,
        delivery: result.delivery,
        inventoryCount: currentState.inventoryCount + 1,
        isCollected: true,
        isMutating: false,
        reward: result.reward,
      }));
    } catch {
      setState((currentState) => ({
        ...currentState,
        error: "rewards.collectError",
        isMutating: false,
      }));
    }
  }

  return {
    ...state,
    collectReward,
  };
}
