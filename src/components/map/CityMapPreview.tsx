import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

import { postalMapStyle } from "./postalMapStyle";
import styles from "./CityMapPreview.module.css";

type CityMapPreviewProps = {
  cityLabel: string;
  latitude?: number;
  longitude?: number;
};

export function CityMapPreview({ cityLabel, latitude, longitude }: CityMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasMapError, setHasMapError] = useState(false);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  useEffect(() => {
    if (!containerRef.current || !hasCoordinates) return undefined;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        attributionControl: false,
        center: [longitude!, latitude!],
        container: containerRef.current,
        interactive: false,
        style: postalMapStyle,
        zoom: 8,
      });
      const marker = document.createElement("span");
      marker.className = styles.marker;
      marker.setAttribute("aria-hidden", "true");
      new maplibregl.Marker({ element: marker }).setLngLat([longitude!, latitude!]).addTo(map);
    } catch {
      setHasMapError(true);
      return undefined;
    }
    return () => map.remove();
  }, [hasCoordinates, latitude, longitude]);

  return <div aria-label={cityLabel} className={styles.preview} role="img">
    {hasCoordinates && !hasMapError ? <div className={styles.map} ref={containerRef} /> : <div className={styles.fallback} aria-hidden="true"><span /></div>}
    <strong>{cityLabel}</strong>
  </div>;
}
