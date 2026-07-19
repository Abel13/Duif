import { useEffect, useRef, useState, type ReactNode } from "react";
import maplibregl, {
  type GeoJSONSource,
  type LngLatBoundsLike,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type {
  MapCoordinate,
  MapFocusTarget,
  MapMotionPreference,
  MapSelection,
  RouteDiscoveryEventOrigin,
  RouteDiscoveryVisualState,
  RouteRewardDiscovery,
} from "../../game/mapTravel";
import {
  getPostalTrafficSnapshotPosition,
  type PostalTrafficQueryAnchor,
  type PostalTrafficPetSnapshot,
} from "../../game/postalTraffic";
import {
  createDeliveryRouteGeoJson,
  createInterpolatedRouteCoordinates,
  createMapPlaceLabelsGeoJson,
  createTravelProgressGeoJson,
  getCrossedRouteRewardIds,
  getMapFocusCoordinate,
  getPetMapPosition,
  toLngLat,
  type MapPlaceLabel,
} from "../../game/mapTravel";
import type { Delivery } from "../../game/types";
import { assetPaths } from "../../game/assets";
import styles from "./TravelMap.module.css";
import {
  getMapFocusZoom,
  getNormalizedRouteBounds,
  getRouteFitPadding,
  MIN_REWARD_VISIBILITY_ZOOM,
  shouldShowMapRewards,
} from "./travelMapCamera";

const routeSourceId = "duif-route";
const outboundProgressSourceId = "duif-outbound-progress";
const returnProgressSourceId = "duif-return-progress";
const placeLabelsSourceId = "duif-place-labels";
const postalTrafficRoutesSourceId = "duif-postal-traffic-routes";

const postalMapStyle = {
  version: 8,
  name: "DUIF Postal Preview",
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
  deliveryCompleted: boolean;
  centerControl?: ReactNode;
  destinationLabel: string;
  destinationTitle: string;
  fallbackLabel: string;
  focusTarget: MapFocusTarget;
  followMascot: boolean;
  motionPreference: MapMotionPreference;
  originLabel: string;
  originTitle: string;
  petLabel: string;
  petPortraitAssetPath?: string;
  petPosition: MapCoordinate;
  placeLabels: MapPlaceLabel[];
  postalTraffic: PostalTrafficPetSnapshot[];
  rewardLabels: Record<string, string>;
  rewardStates: Record<string, RouteDiscoveryVisualState>;
  rewards: RouteRewardDiscovery[];
  selection: MapSelection;
  onFollowChange: (follow: boolean) => void;
  onRewardDiscoveries: (
    rewardIds: string[],
    origin: RouteDiscoveryEventOrigin,
  ) => void;
  onRewardSelect: (rewardId: string) => void;
  onPetSelect: () => void;
  onTrafficSelect: (trafficId: string) => void;
  onViewportChange: (anchor: PostalTrafficQueryAnchor) => void;
};

export function TravelMap({
  centerControl,
  delivery,
  deliveryCompleted,
  destinationLabel,
  destinationTitle,
  fallbackLabel,
  focusTarget,
  followMascot,
  motionPreference,
  originLabel,
  originTitle,
  petLabel,
  petPortraitAssetPath,
  petPosition,
  placeLabels,
  postalTraffic,
  rewardLabels,
  rewardStates,
  rewards,
  selection,
  onFollowChange,
  onRewardDiscoveries,
  onRewardSelect,
  onPetSelect,
  onTrafficSelect,
  onViewportChange,
}: TravelMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const petMarkerRef = useRef<maplibregl.Marker | null>(null);
  const routeEndpointMarkerRefs = useRef<Map<string, maplibregl.Marker>>(new Map());
  const rewardMarkerRefs = useRef<Map<string, maplibregl.Marker>>(new Map());
  const trafficMarkerRefs = useRef<Map<string, maplibregl.Marker>>(new Map());
  const isLoadedRef = useRef(false);
  const focusTargetRef = useRef(focusTarget);
  const followMascotRef = useRef(followMascot);
  const onFollowChangeRef = useRef(onFollowChange);
  const selectionRef = useRef(selection);
  const rewardsRef = useRef(rewards);
  const postalTrafficRef = useRef(postalTraffic);
  const onViewportChangeRef = useRef(onViewportChange);
  const onTrafficSelectRef = useRef(onTrafficSelect);
  const onRewardDiscoveriesRef = useRef(onRewardDiscoveries);
  const onPetSelectRef = useRef(onPetSelect);
  const discoveryRef = useRef(createDiscoveryTracker(delivery, rewards));
  const [hasMapError, setHasMapError] = useState(false);

  focusTargetRef.current = focusTarget;
  followMascotRef.current = followMascot;
  onFollowChangeRef.current = onFollowChange;
  selectionRef.current = selection;
  rewardsRef.current = rewards;
  postalTrafficRef.current = postalTraffic;
  onViewportChangeRef.current = onViewportChange;
  onTrafficSelectRef.current = onTrafficSelect;
  onRewardDiscoveriesRef.current = onRewardDiscoveries;
  onPetSelectRef.current = onPetSelect;

  useEffect(() => {
    discoveryRef.current = createDiscoveryTracker(delivery, rewards);
  }, [delivery.id]);

  function detectDiscoveries(
    position: ReturnType<typeof getPetMapPosition>,
    origin: RouteDiscoveryEventOrigin,
  ) {
    const tracker = discoveryRef.current;
    const crossedIds = getCrossedRouteRewardIds(
      rewardsRef.current,
      tracker.lastProgress,
      position.outboundProgress,
      tracker.knownIds,
    );
    tracker.lastProgress = Math.max(
      tracker.lastProgress,
      position.outboundProgress,
    );
    crossedIds.forEach((id) => tracker.knownIds.add(id));

    if (
      crossedIds.length > 0 &&
      position.leg !== "returned" &&
      position.leg !== "completed"
    ) {
      onRewardDiscoveriesRef.current(crossedIds, origin);
    }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return undefined;
    }

    let map: maplibregl.Map;

    try {
      map = new maplibregl.Map({
        attributionControl: false,
        bearing: 0,
        center: toLngLat(petPosition),
        container: containerRef.current,
        cooperativeGestures: false,
        dragRotate: false,
        pitchWithRotate: false,
        style: postalMapStyle,
        touchPitch: false,
        zoom: 2,
      });
    } catch {
      setHasMapError(true);
      return undefined;
    }

    mapRef.current = map;
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right",
    );

    if (!deliveryCompleted) {
      petMarkerRef.current = createPetMarker(
        map,
        delivery,
        petLabel,
        petPortraitAssetPath,
        petPosition,
        () => onPetSelectRef.current(),
      );
    }

    map.on("load", () => {
      isLoadedRef.current = true;
      addMapLayers(
        map,
        delivery,
        placeLabels,
        getPetMapPosition(delivery, new Date()),
      );
      syncRewardMarkers(
        map,
        rewardMarkerRefs.current,
        rewards,
        rewardLabels,
        rewardStates,
        selectionRef.current,
        onRewardSelect,
      );
      syncRouteEndpointMarkers(
        map,
        routeEndpointMarkerRefs.current,
        delivery,
        originLabel,
        destinationLabel,
        !deliveryCompleted,
      );
      syncRewardMarkerVisibility(map, rewardMarkerRefs.current);
      syncPostalTrafficMarkers(
        map,
        trafficMarkerRefs.current,
        postalTraffic,
        selectionRef.current,
        (trafficId) => onTrafficSelectRef.current(trafficId),
      );
      syncPostalTrafficRoutes(map, postalTraffic, selectionRef.current);
      syncCompletedDeliveryMap(map, deliveryCompleted, rewardMarkerRefs.current);
      focusMap(map, focusTargetRef.current, delivery, petPosition, rewards, postalTraffic);
      if (!map.isMoving()) emitViewport(map, onViewportChangeRef.current);
    });

    const stopFollowing = () => {
      if (followMascotRef.current) {
        onFollowChangeRef.current(false);
      }
    };
    map.on("dragstart", stopFollowing);
    map.on("zoomstart", (event) => {
      if (event.originalEvent) stopFollowing();
    });
    map.on("zoom", () => {
      syncRewardMarkerVisibility(map, rewardMarkerRefs.current);
    });
    map.on("moveend", () => emitViewport(map, onViewportChangeRef.current));

    return () => {
      petMarkerRef.current?.remove();
      removeMarkers(routeEndpointMarkerRefs.current);
      removeMarkers(rewardMarkerRefs.current);
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

    const routeSource = map.getSource(routeSourceId) as
      | GeoJSONSource
      | undefined;
    const placeLabelsSource = map.getSource(placeLabelsSourceId) as
      | GeoJSONSource
      | undefined;

    routeSource?.setData(createDeliveryRouteGeoJson(delivery));
    placeLabelsSource?.setData(createMapPlaceLabelsGeoJson(placeLabels));
    if (!deliveryCompleted && !petMarkerRef.current) {
      petMarkerRef.current = createPetMarker(
        map,
        delivery,
        petLabel,
        petPortraitAssetPath,
        petPosition,
        () => onPetSelectRef.current(),
      );
    }
    petMarkerRef.current?.setLngLat(toLngLat(petPosition));
    syncRouteEndpointMarkers(
      map,
      routeEndpointMarkerRefs.current,
      delivery,
      originLabel,
      destinationLabel,
      !deliveryCompleted,
    );
    if (deliveryCompleted) {
      petMarkerRef.current?.remove();
      petMarkerRef.current = null;
    }
    const petElement = petMarkerRef.current?.getElement();
    if (petElement) {
      petElement.setAttribute("aria-label", petLabel);
      syncPetPortrait(petElement, petPortraitAssetPath);
    }
    updateMapProgress(map, delivery, getPetMapPosition(delivery, new Date()));
    if (document.visibilityState === "visible") {
      detectDiscoveries(getPetMapPosition(delivery, new Date()), "visible");
    }
    updatePetDirection(
      petMarkerRef.current?.getElement(),
      getPetMapPosition(delivery, new Date()).leg,
      delivery,
    );
    if (followMascotRef.current && motionPreference === "reduced") {
      map.setCenter(toLngLat(petPosition));
    }
    syncRewardMarkers(
      map,
      rewardMarkerRefs.current,
      rewards,
      rewardLabels,
      rewardStates,
      selection,
      onRewardSelect,
    );
    syncRewardMarkerVisibility(map, rewardMarkerRefs.current);
    syncPostalTrafficMarkers(
      map,
      trafficMarkerRefs.current,
      postalTraffic,
      selection,
      (trafficId) => onTrafficSelectRef.current(trafficId),
    );
    syncPostalTrafficRoutes(map, postalTraffic, selection);
    syncCompletedDeliveryMap(map, deliveryCompleted, rewardMarkerRefs.current);
  }, [
    delivery,
    deliveryCompleted,
    motionPreference,
    onRewardSelect,
    petLabel,
    petPortraitAssetPath,
    petPosition,
    originLabel,
    destinationLabel,
    placeLabels,
    postalTraffic,
    rewardLabels,
    rewardStates,
    rewards,
    selection,
  ]);

  useEffect(() => {
    if (motionPreference === "reduced") {
      return undefined;
    }

    let animationFrame = 0;
    let resumedFromHidden = false;

    const updateFrame = () => {
      const map = mapRef.current;

      if (document.visibilityState !== "visible") {
        return;
      }

      if (map && isLoadedRef.current) {
        const position = getPetMapPosition(delivery, new Date());
        detectDiscoveries(position, resumedFromHidden ? "resume" : "visible");
        resumedFromHidden = false;
        petMarkerRef.current?.setLngLat(toLngLat(position.coordinates));
        updatePetDirection(
          petMarkerRef.current?.getElement(),
          position.leg,
          delivery,
        );
        updateMapProgress(map, delivery, position);

        postalTrafficRef.current.forEach((trafficPet) => {
          trafficMarkerRefs.current
            .get(trafficPet.id)
            ?.setLngLat(toLngLat(getPostalTrafficSnapshotPosition(trafficPet, new Date()).coordinates));
        });

        if (followMascotRef.current && !map.isEasing()) {
          map.setCenter(toLngLat(position.coordinates));
        }
      }

      animationFrame = window.requestAnimationFrame(updateFrame);
    };

    const handleVisibilityChange = () => {
      window.cancelAnimationFrame(animationFrame);
      if (document.visibilityState === "visible") {
        updateFrame();
      } else {
        resumedFromHidden = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [delivery, motionPreference]);

  useEffect(() => {
    if (motionPreference !== "reduced") return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        detectDiscoveries(getPetMapPosition(delivery, new Date()), "resume");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [delivery, motionPreference]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !isLoadedRef.current) {
      return;
    }

    focusMap(map, focusTarget, delivery, petPosition, rewards, postalTraffic);
  }, [delivery.id, focusTarget]);

  return (
    <div className={styles.mapFrame}>
      <div className={styles.map} ref={containerRef} />
      {hasMapError ? (
        <div className={styles.mapFallback}>{fallbackLabel}</div>
      ) : null}
      <div className={styles.labels}>
        <span>
          <small>{originTitle}</small>
          <strong>{originLabel}</strong>
        </span>
        {centerControl ? <div className={styles.centerControl}>{centerControl}</div> : null}
        {!deliveryCompleted ? (
          <span>
            <small>{destinationTitle}</small>
            <strong>{destinationLabel}</strong>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function createDiscoveryTracker(
  delivery: Delivery,
  rewards: RouteRewardDiscovery[],
) {
  const position = getPetMapPosition(delivery, new Date());
  return {
    knownIds: new Set(
      rewards
        .filter((reward) => reward.routeProgress <= position.outboundProgress)
        .map((reward) => reward.id),
    ),
    lastProgress: position.outboundProgress,
  };
}

function syncPostalTrafficMarkers(
  map: maplibregl.Map,
  markers: Map<string, maplibregl.Marker>,
  traffic: PostalTrafficPetSnapshot[],
  selection: MapSelection,
  onSelect: (trafficId: string) => void,
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
    const selected = selection?.kind === "traffic" && selection.trafficId === pet.id;

    if (existingMarker) {
      existingMarker.setLngLat(toLngLat(pet.coordinates));
      updateTrafficMarker(existingMarker.getElement(), pet, selected);
      return;
    }

    const markerElement = document.createElement("button");
    markerElement.type = "button";
    markerElement.addEventListener("click", () => onSelect(pet.id));
    updateTrafficMarker(markerElement, pet, selected);

    const marker = new maplibregl.Marker({ element: markerElement })
      .setLngLat(toLngLat(pet.coordinates))
      .addTo(map);

    markers.set(pet.id, marker);
  });
}

function syncPostalTrafficRoutes(
  map: maplibregl.Map,
  traffic: PostalTrafficPetSnapshot[],
  selection: MapSelection,
) {
  const source = map.getSource(postalTrafficRoutesSourceId) as GeoJSONSource | undefined;
  const selectedTrafficId = selection?.kind === "traffic" ? selection.trafficId : undefined;
  const visibleRoutes = selectedTrafficId
    ? traffic.filter((pet) => pet.id === selectedTrafficId)
    : traffic;
  source?.setData({
    type: "FeatureCollection",
    features: visibleRoutes.map((pet) => ({
      type: "Feature",
      properties: {
        id: pet.id,
        opacity: pet.visualPhase === "visible" ? 1 : 0,
        selected: selectedTrafficId === pet.id,
      },
      geometry: {
        type: "LineString",
        coordinates: createInterpolatedRouteCoordinates(
          pet.route.origin,
          pet.route.destination,
        ).map(toLngLat),
      },
    })),
  });
}

function emitViewport(
  map: maplibregl.Map,
  onChange: (anchor: PostalTrafficQueryAnchor) => void,
) {
  const center = map.getCenter();
  const bounds = map.getBounds();
  onChange({
    center: { latitude: center.lat, longitude: center.lng },
    viewport: {
      north: bounds.getNorth(),
      east: bounds.getEast(),
      south: bounds.getSouth(),
      west: bounds.getWest(),
    },
  });
}

function updateTrafficMarker(
  markerElement: HTMLElement,
  pet: PostalTrafficPetSnapshot,
  selected: boolean,
) {
  markerElement.className = [
    styles.trafficMarker,
    pet.visibility === "friend" ? styles.friendTrafficMarker : styles.publicTrafficMarker,
    selected ? styles.selectedTrafficMarker : "",
    pet.visualPhase === "entering" ? styles.enteringTrafficMarker : "",
    pet.visualPhase === "leaving" ? styles.leavingTrafficMarker : "",
  ].filter(Boolean).join(" ");
  markerElement.setAttribute("aria-label", pet.label);
  markerElement.setAttribute("aria-pressed", String(selected));
  (markerElement as HTMLButtonElement).disabled = pet.visualPhase === "leaving";
  markerElement.title = pet.label;

  let portrait = markerElement.querySelector("img");
  if (markerElement.dataset.portraitError === pet.portraitAssetPath) return;
  if (!portrait) {
    portrait = document.createElement("img");
    portrait.alt = "";
    portrait.draggable = false;
    portrait.setAttribute("aria-hidden", "true");
    portrait.addEventListener("error", () => {
      markerElement.dataset.portraitError = pet.portraitAssetPath;
      portrait?.remove();
    });
    markerElement.append(portrait);
  }
  if (portrait.getAttribute("src") !== pet.portraitAssetPath) {
    delete markerElement.dataset.portraitError;
    portrait.setAttribute("src", pet.portraitAssetPath);
  }
}

function removePostalTrafficMarkers(markers: Map<string, maplibregl.Marker>) {
  markers.forEach((marker) => marker.remove());
  markers.clear();
}

function syncRewardMarkers(
  map: maplibregl.Map,
  markers: Map<string, maplibregl.Marker>,
  rewards: RouteRewardDiscovery[],
  rewardLabels: Record<string, string>,
  rewardStates: Record<string, RouteDiscoveryVisualState>,
  selection: MapSelection,
  onSelect: (rewardId: string) => void,
) {
  const activeIds = new Set(rewards.map((reward) => reward.id));

  markers.forEach((marker, id) => {
    if (!activeIds.has(id)) {
      marker.remove();
      markers.delete(id);
    }
  });

  rewards.forEach((reward) => {
    const selected =
      selection?.kind === "reward" && selection.rewardId === reward.id;
    const existingMarker = markers.get(reward.id);

    if (existingMarker) {
      existingMarker.setLngLat(toLngLat(reward.coordinates));
      updateRewardMarker(
        existingMarker.getElement(),
        reward,
        rewardLabels[reward.id],
        rewardStates[reward.id],
        selected,
      );
      return;
    }

    const markerElement = document.createElement("button");
    markerElement.type = "button";
    markerElement.addEventListener("click", () => onSelect(reward.id));
    updateRewardMarker(
      markerElement,
      reward,
      rewardLabels[reward.id],
      rewardStates[reward.id],
      selected,
    );

    markers.set(
      reward.id,
      new maplibregl.Marker({ element: markerElement })
        .setLngLat(toLngLat(reward.coordinates))
        .addTo(map),
    );
  });
}

function updateRewardMarker(
  element: HTMLElement,
  reward: RouteRewardDiscovery,
  label: string | undefined,
  visualState: RouteDiscoveryVisualState,
  selected: boolean,
) {
  element.className = [
    styles.rewardMarker,
    visualState === "new"
      ? styles.newRewardMarker
      : visualState === "carried"
        ? styles.carriedRewardMarker
        : styles.futureRewardMarker,
    selected ? styles.selectedRewardMarker : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  element.setAttribute("aria-label", label ?? reward.regionLabel);
  element.setAttribute("aria-pressed", String(selected));
  element.title = label ?? reward.regionLabel;
}

function syncRouteEndpointMarkers(
  map: maplibregl.Map,
  markers: Map<string, maplibregl.Marker>,
  delivery: Delivery,
  originLabel: string,
  destinationLabel: string,
  includeDestination = true,
) {
  const endpoints = [
    {
      coordinates: delivery.origin,
      id: "origin",
      imagePath: assetPaths.mapPins.image("nest.webp"),
      label: originLabel,
    },
    ...(includeDestination ? [{
      coordinates: delivery.destination,
      id: "destination",
      imagePath: assetPaths.mapPins.image("destination.webp"),
      label: destinationLabel,
    }] : []),
  ];
  const activeIds = new Set(endpoints.map((endpoint) => endpoint.id));
  markers.forEach((marker, id) => {
    if (!activeIds.has(id)) {
      marker.remove();
      markers.delete(id);
    }
  });

  endpoints.forEach((endpoint) => {
    const existingMarker = markers.get(endpoint.id);

    if (existingMarker) {
      existingMarker.setLngLat(toLngLat(endpoint.coordinates));
      existingMarker.getElement().setAttribute("aria-label", endpoint.label);
      return;
    }

    const element = document.createElement("div");
    element.className = styles.routeEndpointPin;
    element.dataset.kind = endpoint.id;
    element.setAttribute("aria-label", endpoint.label);
    element.setAttribute("role", "img");
    element.style.zIndex = "1";

    const image = document.createElement("img");
    image.alt = "";
    image.draggable = false;
    image.src = endpoint.imagePath;
    image.addEventListener("error", () => {
      element.dataset.imageError = "true";
      image.remove();
    });
    element.append(image);

    markers.set(
      endpoint.id,
      new maplibregl.Marker({ anchor: "bottom", element, offset: [0, 2] })
        .setLngLat(toLngLat(endpoint.coordinates))
        .addTo(map),
    );
  });
}

function syncCompletedDeliveryMap(
  map: maplibregl.Map,
  completed: boolean,
  rewardMarkers: Map<string, maplibregl.Marker>,
) {
  const visibility = completed ? "none" : "visible";
  [
    "duif-route-shadow",
    "duif-route-line",
    "duif-outbound-progress",
    "duif-return-progress",
  ].forEach((layerId) => {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", visibility);
  });

  if (!completed) return;
  removeMarkers(rewardMarkers);
}

function removeMarkers(markers: Map<string, maplibregl.Marker>) {
  markers.forEach((marker) => marker.remove());
  markers.clear();
}

function syncRewardMarkerVisibility(
  map: maplibregl.Map,
  markers: Map<string, maplibregl.Marker>,
) {
  const visible = shouldShowMapRewards(map.getZoom());

  markers.forEach((marker) => {
    const element = marker.getElement();
    element.toggleAttribute("hidden", !visible);
    element.setAttribute("aria-hidden", String(!visible));
    element.tabIndex = visible ? 0 : -1;
  });
}

function addMapLayers(
  map: maplibregl.Map,
  delivery: Delivery,
  placeLabels: MapPlaceLabel[],
  petPosition: ReturnType<typeof getPetMapPosition>,
) {
  if (!map.getSource(routeSourceId)) {
    map.addSource(routeSourceId, {
      data: createDeliveryRouteGeoJson(delivery),
      tolerance: 0,
      type: "geojson",
    });
  }

  if (!map.getSource(placeLabelsSourceId)) {
    map.addSource(placeLabelsSourceId, {
      data: createMapPlaceLabelsGeoJson(placeLabels),
      type: "geojson",
    });
  }

  if (!map.getSource(postalTrafficRoutesSourceId)) {
    map.addSource(postalTrafficRoutesSourceId, {
      data: { type: "FeatureCollection", features: [] },
      tolerance: 0,
      type: "geojson",
    });
  }

  const progress = createTravelProgressGeoJson(delivery, petPosition);

  if (!map.getSource(outboundProgressSourceId)) {
    map.addSource(outboundProgressSourceId, {
      data: progress.outbound,
      tolerance: 0,
      type: "geojson",
    });
  }

  if (!map.getSource(returnProgressSourceId)) {
    map.addSource(returnProgressSourceId, {
      data: progress.returning,
      tolerance: 0,
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

  if (!map.getLayer("duif-outbound-progress")) {
    map.addLayer({
      id: "duif-outbound-progress",
      paint: {
        "line-color": "#c49a4a",
        "line-opacity": 0.94,
        "line-width": 6,
      },
      source: outboundProgressSourceId,
      type: "line",
    });
  }

  if (!map.getLayer("duif-return-progress")) {
    map.addLayer({
      id: "duif-return-progress",
      paint: {
        "line-color": "#6f91a8",
        "line-opacity": 0.98,
        "line-width": 6,
      },
      source: returnProgressSourceId,
      type: "line",
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
        "text-field": [
          "step",
          ["zoom"],
          [
            "case",
            ["==", ["get", "kind"], "reward"],
            "",
            ["get", "label"],
          ],
          MIN_REWARD_VISIBILITY_ZOOM,
          ["get", "label"],
        ],
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
          [
            "any",
            ["==", ["get", "kind"], "origin"],
            ["==", ["get", "kind"], "destination"],
          ],
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

  if (!map.getLayer("duif-postal-traffic-routes")) {
    map.addLayer({
      id: "duif-postal-traffic-routes",
      type: "line",
      source: postalTrafficRoutesSourceId,
      paint: {
        "line-color": ["case", ["boolean", ["get", "selected"], false], "#6f91a8", "#7a8f68"],
        "line-dasharray": [1.4, 1.8],
        "line-opacity": ["*", ["number", ["get", "opacity"], 1], ["case", ["boolean", ["get", "selected"], false], 0.5, 0.22]],
        "line-width": ["case", ["boolean", ["get", "selected"], false], 2.5, 1.25],
        "line-opacity-transition": { duration: 400 },
      },
    }, "duif-route-shadow");
  }
}

function updateMapProgress(
  map: maplibregl.Map,
  delivery: Delivery,
  position: ReturnType<typeof getPetMapPosition>,
) {
  const progress = createTravelProgressGeoJson(delivery, position);
  const outboundSource = map.getSource(outboundProgressSourceId) as
    | GeoJSONSource
    | undefined;
  const returnSource = map.getSource(returnProgressSourceId) as
    | GeoJSONSource
    | undefined;
  outboundSource?.setData(progress.outbound);
  returnSource?.setData(progress.returning);
}

function updatePetDirection(
  element: HTMLElement | undefined,
  leg: ReturnType<typeof getPetMapPosition>["leg"],
  delivery: Delivery,
) {
  if (!element) return;
  element.dataset.direction =
    leg === "outbound"
      ? "outbound"
      : leg === "returning"
        ? "returning"
        : "stationary";
  const longitudeDelta =
    delivery.destination.longitude - delivery.origin.longitude;
  const latitudeDelta =
    delivery.destination.latitude - delivery.origin.latitude;
  const outboundAngle =
    Math.atan2(-latitudeDelta, longitudeDelta) * (180 / Math.PI);
  const directionAngle =
    leg === "returning" ? outboundAngle + 180 : outboundAngle;
  element.style.setProperty("--pet-direction-angle", `${directionAngle}deg`);
}

function syncPetPortrait(element: HTMLElement, portraitAssetPath?: string) {
  const currentImage = element.querySelector<HTMLImageElement>("img");

  if (!portraitAssetPath) {
    currentImage?.remove();
    element.removeAttribute("data-has-portrait");
    return;
  }

  if (currentImage?.getAttribute("src") === portraitAssetPath) {
    return;
  }

  currentImage?.remove();
  const image = document.createElement("img");
  image.alt = "";
  image.className = styles.petPortrait;
  image.draggable = false;
  image.src = portraitAssetPath;
  image.addEventListener("load", () =>
    element.setAttribute("data-has-portrait", "true"),
  );
  image.addEventListener("error", () => {
    element.removeAttribute("data-has-portrait");
    image.remove();
  });
  element.append(image);
}

function createPetMarker(
  map: maplibregl.Map,
  delivery: Delivery,
  label: string,
  portraitAssetPath: string | undefined,
  position: MapCoordinate,
  onSelect: () => void,
) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = styles.petMarker;
  element.style.zIndex = "3";
  element.setAttribute("aria-label", label);
  element.addEventListener("click", onSelect);
  syncPetPortrait(element, portraitAssetPath);
  updatePetDirection(element, getPetMapPosition(delivery, new Date()).leg, delivery);
  return new maplibregl.Marker({ element })
    .setLngLat(toLngLat(position))
    .addTo(map);
}

function focusMap(
  map: maplibregl.Map,
  target: MapFocusTarget,
  delivery: Delivery,
  petPosition: MapCoordinate,
  rewards: RouteRewardDiscovery[],
  traffic: PostalTrafficPetSnapshot[],
) {
  const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 500;

  if (target.kind === "overview") {
    fitMapToDelivery(map, delivery, duration);
    return;
  }

  const coordinates = getMapFocusCoordinate(
    target,
    delivery,
    petPosition,
    rewards,
    traffic,
  );

  if (!coordinates) {
    return;
  }

  map.easeTo({
    center: toLngLat(coordinates),
    duration,
    zoom: getMapFocusZoom(map.getZoom(), target.kind),
  });
}

function fitMapToDelivery(
  map: maplibregl.Map,
  delivery: Delivery,
  duration = 0,
) {
  const bounds: LngLatBoundsLike = getNormalizedRouteBounds(
    delivery.origin,
    delivery.destination,
  );
  const container = map.getContainer();
  const padding = getRouteFitPadding(container.clientWidth, container.clientHeight);

  map.fitBounds(bounds, {
    duration,
    maxZoom: 10.5,
    padding,
  });
}
