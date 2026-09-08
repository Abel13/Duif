import { useEffect, useState } from "react";

import { useAuth } from "../integrations/supabase/AuthProvider";
import { fetchProfileProgression, type ProfileProgression } from "../integrations/supabase/profileProgression";

type ProfileProgressionState = {
  isLoading: boolean;
  level: number;
  xp: number;
  nextLevelXp: number;
  seeds: number;
};

export function useProfileProgression(): ProfileProgressionState {
  const { isLoading: isAuthLoading, profile, session } = useAuth();
  const [state, setState] = useState<ProfileProgressionState>({
    isLoading: true,
    level: 1,
    xp: 0,
    nextLevelXp: 150,
    seeds: 0,
  });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!session || !profile) {
      setState({
        isLoading: false,
        level: 1,
        xp: 0,
        nextLevelXp: 150,
        seeds: 0,
      });
      return;
    }

    let active = true;
    fetchProfileProgression(profile.id)
      .then((data) => {
        if (active && data) {
          setState({
            isLoading: false,
            level: data.level,
            xp: data.xp,
            nextLevelXp: data.nextLevelXp,
            seeds: data.seeds,
          });
        }
      })
      .catch(() => {
        if (active) {
          setState({
            isLoading: false,
            level: 1,
            xp: 0,
            nextLevelXp: 150,
            seeds: 0,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, profile, session]);

  return state;
}
