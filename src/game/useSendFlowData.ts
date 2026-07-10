import { useEffect, useState } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import {
  fetchAuthenticatedSendFlowData,
  mockSendFlowData,
  type AuthenticatedSendFlowData,
} from "../integrations/supabase/authenticatedSendFlow";
import { isSupabaseCatalogEnabled } from "../integrations/supabase/config";

type SendFlowDataState = {
  data: AuthenticatedSendFlowData;
  isAuthenticatedSource: boolean;
  isLoading: boolean;
};

export function useSendFlowData(): SendFlowDataState {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [state, setState] = useState<SendFlowDataState>({
    data: mockSendFlowData,
    isAuthenticatedSource: false,
    isLoading: isSupabaseCatalogEnabled(),
  });

  useEffect(() => {
    if (!isSupabaseCatalogEnabled()) {
      setState({
        data: mockSendFlowData,
        isAuthenticatedSource: false,
        isLoading: false,
      });
      return;
    }

    if (isAuthLoading) {
      setState((currentState) => ({ ...currentState, isLoading: true }));
      return;
    }

    if (!session || !profile) {
      setState({
        data: mockSendFlowData,
        isAuthenticatedSource: false,
        isLoading: false,
      });
      return;
    }

    let isMounted = true;

    setState((currentState) => ({ ...currentState, isLoading: true }));

    fetchAuthenticatedSendFlowData(profile.id)
      .then((data) => {
        if (isMounted) {
          setState({
            data: data ?? mockSendFlowData,
            isAuthenticatedSource: Boolean(data),
            isLoading: false,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            data: mockSendFlowData,
            isAuthenticatedSource: false,
            isLoading: false,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, profile, session]);

  return state;
}
