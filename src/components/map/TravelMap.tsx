import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type {
  MapCoordinate,
  RouteRewardDiscovery,
} from "../../game/mapTravel";
import {
  createDeliveryRouteGeoJson,
  createRouteRewardsGeoJson,
  toLngLat,
} from "../../game/mapTravel";
import type { Delivery } from "../../game/types";
import styles from "./TravelMap.module.css";

const demoStyleUrl = "https://demotiles.maplibre.org/globe.json";
const routeSourceId = "duif-route";
const rewardSourceId = "duif-route-rewards";

export type TravelMapProps = {
  delivery: Delivery;
  destinationLabel: string;
  fallbackLabel: string;
  originLabel: string;
  petLabel: string;
  petPosition: MapCoordinate;
  rewards: RouteRewardDiscovery[];
};

export function TravelMap({
  delivery,
  destinationLabel,
  fallbackLabel,
  originLabel,
  petLabel,
  petPosition,
  rewards,
}: TravelMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const petMarkerRef = useRef<maplibregl.Marker | null>(null);
  const isLoadedRef = useRef(false);
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return undefined;
    }

    let map: maplibregl.Map;

    try {
      map = new maplibregl.Map({
        attributionControl: false,
        center: toLngLat(petPosition),
        container: containerRef.current,
        cooperativeGestures: true,
        pitchWithRotate: false,
        style: demoStyleUrl,
        zoom: 2,
      });
    } catch {
      setHasMapError(true);
      return undefined;
    }

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    const petElement = document.createElement("div");
    petElement.className = styles.petMarker;
    petElement.setAttribute("aria-label", petLabel);

    petMarkerRef.current = new maplibregl.Marker({ element: petElement })
      .setLngLat(toLngLat(petPosition))
      .addTo(map);

    map.on("load", () => {
      isLoadedRef.current = true;
      addMapLayers(map, delivery, rewards);
      fitMapToDelivery(map, delivery);
    });

    return () => {
      petMarkerRef.current?.remove();
      map.remove();
      petMarkerRef.current = null;
      mapRef.current = null;
      isLoadedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !isLoadedRef.current) {
      return;
    }

    const routeSource = map.getSource(routeSourceId) as GeoJSONSource | undefined;
    const rewardSource = map.getSource(rewardSourceId) as GeoJSONSource | undefined;

    routeSource?.setData(createDeliveryRouteGeoJson(delivery));
    rewardSource?.setData(createRouteRewardsGeoJson(rewards));
    petMarkerRef.current?.setLngLat(toLngLat(petPosition));
  }, [delivery, petPosition, rewards]);

  return (
    <div className={styles.mapFrame}>
      <div className={styles.map} ref={containerRef} />
      {hasMapError ? <div className={styles.mapFallback}>{fallbackLabel}</div> : null}
      <div className={styles.labels} aria-hidden="true">
        <span>{originLabel}</span>
        <span>{destinationLabel}</span>
      </div>
    </div>
  );
}

function addMapLayers(
  map: maplibregl.Map,
  delivery: Delivery,
  rewards: RouteRewardDiscovery[],
) {
  if (!map.getSource(routeSourceId)) {
    map.addSource(routeSourceId, {
      data: createDeliveryRouteGeoJson(delivery),
      type: "geojson",
    });
  }

  if (!map.getSource(rewardSourceId)) {
    map.addSource(rewardSourceId, {
      data: createRouteRewardsGeoJson(rewards),
      type: "geojson",
    });
  }

  if (!map.getLayer("duif-route-shadow")) {
    map.addLayer({
      id: "duif-route-shadow",
      paint: {
        "line-blur": 1.5,
        "line-color": "#f7f1e3",
        "line-opacity": 0.82,
        "line-width": 9,
      },
      source: routeSourceId,
      type: "line",
    });
  }

  if (!map.getLayer("duif-route-line")) {
    map.addLayer({
      id: "duif-route-line",
      paint: {
        "line-color": "#a44a3f",
        "line-dasharray": [1.4, 1],
        "line-opacity": 0.9,
        "line-width": 4,
      },
      source: routeSourceId,
      type: "line",
    });
  }

  if (!map.getLayer("duif-route-rewards")) {
    map.addLayer({
      id: "duif-route-rewards",
      paint: {
        "circle-color": [
          "case",
          ["==", ["get", "discovered"], true],
          "#c49a4a",
          "#fff8e8",
        ],
        "circle-radius": [
          "case",
          ["==", ["get", "discovered"], true],
          8,
          6,
        ],
        "circle-stroke-color": "#2e2a24",
        "circle-stroke-width": 2,
      },
      source: rewardSourceId,
      type: "circle",
    });
  }
}

function fitMapToDelivery(map: maplibregl.Map, delivery: Delivery) {
  const bounds: LngLatBoundsLike = [
    [
      Math.min(delivery.origin.longitude, delivery.destination.longitude) - 8,
      Math.min(delivery.origin.latitude, delivery.destination.latitude) - 8,
    ],
    [
      Math.max(delivery.origin.longitude, delivery.destination.longitude) + 8,
      Math.max(delivery.origin.latitude, delivery.destination.latitude) + 8,
    ],
  ];

  map.fitBounds(bounds, {
    duration: 0,
    padding: 52,
  });
}
