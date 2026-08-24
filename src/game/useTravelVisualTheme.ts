import { useEffect, useState } from "react";

import { geographicVisualTheme } from "./travelWeather";
import { getBrowserTimeZone, resolveDeliveryVisualTimeZone } from "../integrations/supabase/travelVisualTimeZone";

export function useTravelVisualTheme(
  deliveryId: string,
  now: Date,
  coordinates: { latitude: number; longitude: number },
) {
  const [timeZone, setTimeZone] = useState(getBrowserTimeZone);

  useEffect(() => {
    let active = true;
    resolveDeliveryVisualTimeZone(deliveryId, coordinates.latitude, coordinates.longitude)
      .then((resolvedTimeZone) => { if (active) setTimeZone(resolvedTimeZone); });
    return () => { active = false; };
    // Daylight itself is calculated locally from the instant and exact map
    // position. The timezone lookup establishes the civil context once per
    // journey; it must not run for each visual clock tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId]);

  return geographicVisualTheme(now, coordinates, timeZone);
}
