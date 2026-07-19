import { useEffect, useState } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import { fetchAuthenticatedSendFlowData, type AuthenticatedSendFlowData } from "../integrations/supabase/authenticatedSendFlow";

const emptyData: AuthenticatedSendFlowData = { correspondenceOptions: [], friends: [], mascots: [] };
type SendFlowDataState = { data: AuthenticatedSendFlowData; isAuthenticatedSource: true; isLoading: boolean };

export function useSendFlowData(): SendFlowDataState {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [state, setState] = useState<SendFlowDataState>({ data: emptyData, isAuthenticatedSource: true, isLoading: true });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!session || !profile) {
      setState({ data: emptyData, isAuthenticatedSource: true, isLoading: false });
      return;
    }
    let active = true;
    fetchAuthenticatedSendFlowData(profile.id)
      .then((data) => active && setState({ data: data ?? emptyData, isAuthenticatedSource: true, isLoading: false }))
      .catch(() => active && setState({ data: emptyData, isAuthenticatedSource: true, isLoading: false }));
    return () => { active = false; };
  }, [isAuthLoading, profile, session]);

  return state;
}
