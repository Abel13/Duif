import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import {
  fetchAuthenticatedPostalTraffic,
  fetchEncounterClientSettings,
} from "../integrations/supabase/authenticatedPostalTraffic";
import { isSupabaseCatalogEnabled } from "../integrations/supabase/config";
import {
  isPostalTrafficJourneyVisible,
  POSTAL_TRAFFIC_REFRESH_MS,
  postalTrafficAnchorKey,
  type PostalTrafficPetSnapshot,
  type PostalTrafficQueryAnchor,
} from "./postalTraffic";

const fadeDurationMs = 400;

type AnchorCacheEntry = {
  fetchedAt: number;
  pets: PostalTrafficPetSnapshot[];
};

export function usePostalTraffic() {
  const { profile, session } = useAuth();
  const authenticated = isSupabaseCatalogEnabled() && Boolean(profile && session);
  const [traffic, setTraffic] = useState<PostalTrafficPetSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const anchorRef = useRef<PostalTrafficQueryAnchor>();
  const refreshMsRef = useRef(POSTAL_TRAFFIC_REFRESH_MS);
  const lastRefreshRef = useRef(0);
  const refreshingRef = useRef(false);
  const cacheRef = useRef<Map<string, AnchorCacheEntry>>(new Map());
  const removalTimersRef = useRef<Map<string, number>>(new Map());
  const mountedRef = useRef(true);

  const applyPets = useCallback((pets: PostalTrafficPetSnapshot[]) => {
    const visibleTraffic = pets.filter((pet) => isPostalTrafficJourneyVisible(pet));
    setTraffic((current) => reconcileTraffic(current, visibleTraffic, removalTimersRef.current, setTraffic));
  }, []);

  const refresh = useCallback(async (force = false) => {
    const anchor = anchorRef.current;
    if (!anchor || refreshingRef.current) return;

    const key = postalTrafficAnchorKey(anchor);
    const cached = cacheRef.current.get(key);
    const fresh =
      !force &&
      cached &&
      Date.now() - cached.fetchedAt < refreshMsRef.current;

    if (fresh && cached) {
      lastRefreshRef.current = cached.fetchedAt;
      applyPets(cached.pets);
      return;
    }

    refreshingRef.current = true;
    setIsLoading(true);
    try {
      if (authenticated) {
        const settings = await fetchEncounterClientSettings();
        refreshMsRef.current = Math.max(60_000, settings.refreshMinutes * 60_000);
      }
      const next = authenticated ? await fetchAuthenticatedPostalTraffic(anchor) : [];
      if (!mountedRef.current) return;
      const fetchedAt = Date.now();
      lastRefreshRef.current = fetchedAt;
      cacheRef.current.set(key, { fetchedAt, pets: next });
      applyPets(next);
    } catch {
      // Preserve the last known encounter snapshot until the next polling cycle.
    } finally {
      refreshingRef.current = false;
      if (mountedRef.current) setIsLoading(false);
    }
  }, [applyPets, authenticated]);

  const updateAnchor = useCallback((anchor: PostalTrafficQueryAnchor) => {
    const previous = anchorRef.current;
    const nextKey = postalTrafficAnchorKey(anchor);
    const previousKey = previous ? postalTrafficAnchorKey(previous) : null;
    anchorRef.current = anchor;
    if (previousKey !== nextKey || lastRefreshRef.current === 0) {
      void refresh();
    }
  }, [refresh]);

  useEffect(() => {
    const tick = () => {
      if (Date.now() - lastRefreshRef.current >= refreshMsRef.current) {
        void refresh(true);
      }
    };
    const interval = window.setInterval(tick, 30_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  useEffect(() => {
    lastRefreshRef.current = 0;
    cacheRef.current.clear();
    if (anchorRef.current) void refresh(true);
  }, [authenticated, refresh]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      removalTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return { isLoading, postalTraffic: traffic, updatePostalTrafficAnchor: updateAnchor };
}

function reconcileTraffic(
  current: PostalTrafficPetSnapshot[],
  incoming: PostalTrafficPetSnapshot[],
  timers: Map<string, number>,
  setTraffic: Dispatch<SetStateAction<PostalTrafficPetSnapshot[]>>,
) {
  const incomingIds = new Set(incoming.map((pet) => pet.id));
  const currentIds = new Set(current.map((pet) => pet.id));
  current.forEach((pet) => {
    if (incomingIds.has(pet.id)) return;
    window.clearTimeout(timers.get(pet.id));
    timers.set(pet.id, window.setTimeout(() => {
      setTraffic((items) => items.filter((item) => item.id !== pet.id));
      timers.delete(pet.id);
    }, fadeDurationMs));
  });
  const merged = [
    ...incoming.map((pet) => ({ ...pet, visualPhase: currentIds.has(pet.id) ? "visible" as const : "entering" as const })),
    ...current.filter((pet) => !incomingIds.has(pet.id)).map((pet) => ({ ...pet, visualPhase: "leaving" as const })),
  ];
  window.requestAnimationFrame(() => {
    setTraffic((items) => items.map((pet) => pet.visualPhase === "entering"
      ? { ...pet, visualPhase: "visible" }
      : pet));
  });
  return merged;
}
