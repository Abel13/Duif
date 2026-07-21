import { useEffect, useState } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import {
  collectAuthenticatedReward,
  fetchAuthenticatedRewardCollection,
  type AuthenticatedRewardCollection,
  type CollectedRewardResult,
} from "../integrations/supabase/authenticatedRewards";
import type { TranslationKey } from "../i18n";
import type { RouteRewardDiscovery } from "./mapTravel";
import type { Delivery, DeliveryReward } from "./types";

type RewardCollectionState = {
  canCollect: boolean;
  delivery?: Delivery;
  error?: TranslationKey;
  inventoryCount: number;
  isAuthenticatedSource: true;
  isCollected: boolean;
  isLoading: boolean;
  isMutating: boolean;
  reward?: DeliveryReward;
  routeDiscoveries: RouteRewardDiscovery[];
};

const emptyState: RewardCollectionState = {
  canCollect: false,
  inventoryCount: 0,
  isAuthenticatedSource: true,
  isCollected: false,
  isLoading: true,
  isMutating: false,
  routeDiscoveries: [],
};

function mapState(data: AuthenticatedRewardCollection, profileId: string): RewardCollectionState {
  return {
    canCollect: data.delivery.senderId === profileId,
    delivery: data.delivery,
    inventoryCount: data.inventoryCount,
    isAuthenticatedSource: true,
    isCollected: data.isCollected,
    isLoading: false,
    isMutating: false,
    reward: data.reward,
    routeDiscoveries: data.routeDiscoveries,
  };
}

export function useRewardCollectionData(deliveryId?: string) {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [state, setState] = useState<RewardCollectionState>(emptyState);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!deliveryId || !session || !profile) {
      setState({ ...emptyState, isLoading: false });
      return;
    }
    let active = true;
    fetchAuthenticatedRewardCollection(deliveryId, profile.id)
      .then((data) => active && setState(data ? mapState(data, profile.id) : { ...emptyState, isLoading: false }))
      .catch(() => active && setState({ ...emptyState, isLoading: false, error: "rewards.collectError" }));
    return () => { active = false; };
  }, [deliveryId, isAuthLoading, profile, session]);

  async function collectReward() {
    if (!state.delivery || state.isCollected) return;
    setState((current) => ({ ...current, error: undefined, isMutating: true }));
    try {
      const result: CollectedRewardResult | undefined = await collectAuthenticatedReward({
        deliveryId: state.delivery.id,
        mascotId: state.delivery.mascotId,
      });
      if (!result) throw new Error("Reward was not collected.");
      setState((current) => ({
        ...current,
        delivery: result.delivery,
        inventoryCount: current.inventoryCount + 1 + result.routeInventoryItems.length,
        isCollected: true,
        isMutating: false,
        reward: result.reward,
      }));
    } catch {
      setState((current) => ({ ...current, error: "rewards.collectError", isMutating: false }));
    }
  }

  return { ...state, collectReward };
}
