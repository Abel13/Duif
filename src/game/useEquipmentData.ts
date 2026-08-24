import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../integrations/supabase/AuthProvider";
import { fetchEquipmentData } from "../integrations/supabase/equipment";
import type { EquipmentData } from "./equipment";

const emptyData: EquipmentData = { catalog: [], instances: [], loadouts: [], seedBalance: 0 };

export function useEquipmentData() {
  const { profile, session, isLoading: authLoading } = useAuth();
  const [data, setData] = useState(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!profile || !session) { setData(emptyData); setIsLoading(false); return; }
    setIsLoading(true);
    try { setData(await fetchEquipmentData(profile.id) ?? emptyData); }
    finally { setIsLoading(false); }
  }, [profile, session]);
  useEffect(() => { if (!authLoading) void refresh(); }, [authLoading, refresh]);
  return { data, isLoading, refresh };
}
