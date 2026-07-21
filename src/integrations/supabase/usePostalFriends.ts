import { useCallback, useEffect, useState } from "react";
import { getPostalFriendCode, listPostalConnections, type PostalConnections, type PostalFriendCode } from "./postalFriends";
import { useAuth } from "./AuthProvider";

const empty: PostalConnections = { accepted: [], incoming: [], outgoing: [] };
export function usePostalFriends(includeCode = true) {
  const { session, profile, isLoading: authLoading } = useAuth();
  const [connections, setConnections] = useState<PostalConnections>(empty);
  const [code, setCode] = useState<PostalFriendCode>();
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!session || !profile) { setConnections(empty); setCode(undefined); setIsLoading(false); return; }
    setIsLoading(true);
    try { const [nextCode, nextConnections] = await Promise.all([includeCode ? getPostalFriendCode() : Promise.resolve(undefined), listPostalConnections()]); setCode(nextCode); setConnections(nextConnections); }
    finally { setIsLoading(false); }
  }, [includeCode, profile, session]);
  useEffect(() => { if (!authLoading) void refresh(); }, [authLoading, refresh]);
  return { code, connections, isLoading: authLoading || isLoading, refresh, setCode };
}
