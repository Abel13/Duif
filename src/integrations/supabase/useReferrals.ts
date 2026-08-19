import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getReferralProgress, type ReferralProgress } from "./referrals";

const empty: ReferralProgress = { hasInvitation: false, qualifiedCount: 0, targetCount: 5, owlStatus: "locked", owlMascotId: null };
export function useReferrals() {
  const { session, profile, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState<ReferralProgress>(empty);
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!session || !profile) { setProgress(empty); setIsLoading(false); return; }
    setIsLoading(true); try { setProgress(await getReferralProgress()); } finally { setIsLoading(false); }
  }, [profile, session]);
  useEffect(() => { if (!authLoading) void refresh(); }, [authLoading, refresh]);
  return { progress, isLoading: authLoading || isLoading, refresh, setProgress };
}
