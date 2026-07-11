import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type {
  MapCoordinate,
  RouteRewardDiscovery,
} from "../../game/mapTravel";
import type { PostalTrafficPetSnapshot } from "../../game/postalTraffic";
import {
  createDeliveryRouteGeoJson,
  createMapPlaceLabelsGeoJson,
  createRouteRewardsGeoJson,
  toLngLat,
  type MapPlaceLabel,
} from "../../game/mapTravel";
import type { Delivery } from "../../game/types";
import styles from "./TravelMap.module.css";

const routeSourceId = "duif-route";
const rewardSourceId = "duif-route-rewards";
const placeLabelsSourceId = "duif-place-labels";

const postalMapStyle = {
  version: 8,
  name: "DUIF Postal Preview",
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "postal-paper",
      type: "background",
      paint: {
        "background-color": "#eadfca",
      },
    },
    {
      id: "osm-raster",
      type: "raster",
      source: "osm",
      paint: {
        "raster-opacity": 0.62,
        "raster-saturation": -0.72,
        "raster-contrast": -0.18,
        "raster-brightness-min": 0.12,
        "raster-brightness-max": 0.9,
      },
    },
  ],
} satisfies maplibregl.StyleSpecification;

export type TravelMapProps = {
  delivery: Delivery;
  destinationLabel: string;
  fallbackLabel: string;
  originLabel: string;
  petLabel: string;
  petPosition: MapCoordinate;
  placeLabels: MapPlaceLabel[];
  postalTraffic: PostalTrafficPetSnapshot[];
  rewards: RouteRewardDiscovery[];
};

export function TravelMap({
  delivery,
  destinationLabel,
  fallbackLabel,
  originLabel,
  petLabel,
  petPosition,
  placeLabels,
  postalTraffic,
  rewards,
}: TravelMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const petMarkerRef = useRef<maplibregl.Marker | null>(null);
  const trafficMarkerRefs = useRef<Map<string, maplibregl.Marker>>(new Map());
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
        cooperativeGestures: false,
        pitchWithRotate: false,
        style: postalMapStyle,
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
      addMapLayers(map, delivery, rewards, placeLabels);
      syncPostalTrafficMarkers(map, trafficMarkerRefs.current, postalTraffic);
      fitMapToDelivery(map, delivery);
    });

    return () => {
      petMarkerRef.current?.remove();
      removePostalTrafficMarkers(trafficMarkerRefs.current);
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
    const placeLabelsSource = map.getSource(placeLabelsSourceId) as GeoJSONSource | undefined;

    routeSource?.setData(createDeliveryRouteGeoJson(delivery));
    rewardSource?.setData(createRouteRewardsGeoJson(rewards));
    placeLabelsSource?.setData(createMapPlaceLabelsGeoJson(placeLabels));
    petMarkerRef.current?.setLngLat(toLngLat(petPosition));
    syncPostalTrafficMarkers(map, trafficMarkerRefs.current, postalTraffic);
  }, [delivery, petPosition, placeLabels, postalTraffic, rewards]);

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

function syncPostalTrafficMarkers(
  map: maplibregl.Map,
  markers: Map<string, maplibregl.Marker>,
  traffic: PostalTrafficPetSnapshot[],
) {
  const activeIds = new Set(traffic.map((pet) => pet.id));

  markers.forEach((marker, id) => {
    if (!activeIds.has(id)) {
      marker.remove();
      markers.delete(id);
    }
  });

  traffic.forEach((pet) => {
    const existingMarker = markers.get(pet.id);

    if (existingMarker) {
      existingMarker.setLngLat(toLngLat(pet.coordinates));
      return;
    }

    const markerElement = document.createElement("div");
    markerElement.className = [
      styles.trafficMarker,
      pet.visibility === "friend" ? styles.friendTrafficMarker : styles.anonymousTrafficMarker,
    ].join(" ");
    markerElement.setAttribute("aria-label", pet.label);
    markerElement.title = pet.label;

    const marker = new maplibregl.Marker({ element: markerElement })
      .setLngLat(toLngLat(pet.coordinates))
      .addTo(map);

    markers.set(pet.id, marker);
  });
}

function removePostalTrafficMarkers(markers: Map<string, maplibregl.Marker>) {
  markers.forEach((marker) => marker.remove());
  markers.clear();
}

function addMapLayers(
  map: maplibregl.Map,
  delivery: Delivery,
  rewards: RouteRewardDiscovery[],
  placeLabels: MapPlaceLabel[],
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

  if (!map.getSource(placeLabelsSourceId)) {
    map.addSource(placeLabelsSourceId, {
      data: createMapPlaceLabelsGeoJson(placeLabels),
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

  if (!map.getLayer("duif-place-labels")) {
    map.addLayer({
      id: "duif-place-labels",
      layout: {
        "text-allow-overlap": false,
        "text-anchor": [
          "case",
          ["==", ["get", "kind"], "origin"],
          "bottom-left",
          ["==", ["get", "kind"], "destination"],
          "top-right",
          "top",
        ],
        "text-field": ["get", "label"],
        "text-font": ["Open Sans Regular"],
        "text-offset": [
          "case",
          ["==", ["get", "kind"], "origin"],
          ["literal", [0.8, -0.8]],
          ["==", ["get", "kind"], "destination"],
          ["literal", [-0.8, 0.8]],
          ["literal", [0, 0.9]],
        ],
        "text-size": [
          "case",
          ["any", ["==", ["get", "kind"], "origin"], ["==", ["get", "kind"], "destination"]],
          14,
          12,
        ],
      },
      paint: {
        "text-color": "#2e2a24",
        "text-halo-blur": 0.5,
        "text-halo-color": "#fff8e8",
        "text-halo-width": 2,
      },
      source: placeLabelsSourceId,
      type: "symbol",
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
    padding: {
      bottom: 104,
      left: 44,
      right: 44,
      top: 96,
    },
  });
}
