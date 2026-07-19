import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import { fetchAuthenticatedPostalTraffic } from "../integrations/supabase/authenticatedPostalTraffic";
import { isSupabaseCatalogEnabled } from "../integrations/supabase/config";
import {
  isPostalTrafficJourneyVisible,
  POSTAL_TRAFFIC_REFRESH_MS,
  type PostalTrafficPetSnapshot,
  type PostalTrafficQueryAnchor,
} from "./postalTraffic";

const fadeDurationMs = 400;

export function usePostalTraffic() {
  const { profile, session } = useAuth();
  const authenticated = isSupabaseCatalogEnabled() && Boolean(profile && session);
  const [traffic, setTraffic] = useState<PostalTrafficPetSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const anchorRef = useRef<PostalTrafficQueryAnchor>();
  const lastRefreshRef = useRef(0);
  const refreshingRef = useRef(false);
  const removalTimersRef = useRef<Map<string, number>>(new Map());
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    const anchor = anchorRef.current;
    if (!anchor || refreshingRef.current) return;
    refreshingRef.current = true;
    setIsLoading(true);
    try {
      const next = authenticated ? await fetchAuthenticatedPostalTraffic(anchor) : [];
      if (!mountedRef.current) return;
      lastRefreshRef.current = Date.now();
      const visibleTraffic = next.filter((pet) => isPostalTrafficJourneyVisible(pet));
      setTraffic((current) => reconcileTraffic(current, visibleTraffic, removalTimersRef.current, setTraffic));
    } catch {
      // Preserve the last known regional snapshot until the next polling cycle.
    } finally {
      refreshingRef.current = false;
      if (mountedRef.current) setIsLoading(false);
    }
  }, [authenticated]);

  const updateAnchor = useCallback((anchor: PostalTrafficQueryAnchor) => {
    anchorRef.current = anchor;
    if (lastRefreshRef.current === 0) void refresh();
  }, [refresh]);

  useEffect(() => {
    const interval = window.setInterval(() => void refresh(), POSTAL_TRAFFIC_REFRESH_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRefreshRef.current >= POSTAL_TRAFFIC_REFRESH_MS) {
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  useEffect(() => {
    lastRefreshRef.current = 0;
    if (anchorRef.current) void refresh();
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
