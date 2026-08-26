import { useMemo, useState, useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AirTrafficControl, Binoculars, Clock, CloudSun, Compass, Gauge, MapPin, Package, Signpost, X } from "@phosphor-icons/react";

import { AppBottomNav } from "../../components/layout";
import { TravelMap } from "../../components/map/TravelMap";
import { MascotPrestigeMedallion } from "../../components/mascot/MascotPrestigeMedallion";
import { AssetImage, ItemCard, SketchPanel, TravelStatusLabel, TravelWeatherBadge } from "../../components/ui";
import {
  assetKeys,
  effectiveSpeedKmh,
  formatRemainingTime,
  getDeliveryStatus,
  getMapJourneyPhase,
  getPostalTrafficDisplayPosition,
  isPostalTrafficJourneyVisible,
  getRouteDiscoveryVisualState,
  getPetMapPosition,
  getRouteRewardDiscoveries,
  getTravelProgress,
  resolveDeliveryPlaceLabel,
  hasActiveMascotDelivery,
  resolveRequestedTravelMascotId,
  resolvePostalTrafficSelection,
  resolveActiveOfficialAssetPath,
  type Delivery,
  type DeliveryReward,
  type DeliveryStatus,
  type MapFocusTarget,
  type MapMotionPreference,
  type MapJourneyPhase,
  type MapPlaceLabel,
  type MapSelection,
  type Mascot,
  type PostalTrafficPetSnapshot,
  type PostalTrafficRangeState,
  type RouteRewardDiscovery,
  type RouteDiscoveryEventOrigin,
  type RouteDiscoveryVisualState,
  type TravelLeg,
  type WorldLandmark,
} from "../../game";
import { useTravelVisualTheme } from "../../game/useTravelVisualTheme";
import { usePostalTraffic } from "../../game/usePostalTraffic";
import { useRewardCollectionData } from "../../game/useRewardCollectionData";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { usePostalFriends } from "../../integrations/supabase/usePostalFriends";
import { fetchActivePostalVisitors, getPostalVisitorMinutes, type ActivePostalVisitor } from "../../integrations/supabase/mailbox";
import { acknowledgeWorldLandmark, reconcileWorldLandmarks } from "../../integrations/supabase/worldLandmarks";
import { type TranslationKey, useTranslation } from "../../i18n";
import styles from "./TravelMapPage.module.css";
import { isMapCameraTargetDisabled } from "../../components/map/travelMapCamera";

const defaultMascotId = "mascot-nuvem";
const liveTickMs = 30 * 1000;
const trafficTickMs = 1000;
const discoveryHighlightMs = 4 * 1000;
const visitorRefreshMs = 30 * 1000;

export function TravelMapPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { connections, isLoading: isPostalFriendsLoading } = usePostalFriends(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoading, mascots } = useMascotCatalog();
  const [now, setNow] = useState(() => new Date());
  const [trafficNow, setTrafficNow] = useState(() => new Date());
  const [focusTarget, setFocusTarget] = useState<MapFocusTarget>({ kind: "overview" });
  const [followMascot, setFollowMascot] = useState(false);
  const [selection, setSelection] = useState<MapSelection>(null);
  const [runtimeDiscoveryIds, setRuntimeDiscoveryIds] = useState<Set<string>>(() => new Set());
  const [newDiscoveryIds, setNewDiscoveryIds] = useState<Set<string>>(() => new Set());
  const [discoveryToast, setDiscoveryToast] = useState<string[] | null>(null);
  const [returnSummaryOpen, setReturnSummaryOpen] = useState(false);
  const [selectedTrafficSnapshot, setSelectedTrafficSnapshot] = useState<PostalTrafficPetSnapshot>();
  const [selectedMascotId, setSelectedMascotId] = useState(defaultMascotId);
  const [tripStatusOpen, setTripStatusOpen] = useState(false);
  const [trafficDialogOpen, setTrafficDialogOpen] = useState(false);
  const [discoveryDialogOpen, setDiscoveryDialogOpen] = useState(false);
  const [postalVisitors, setPostalVisitors] = useState<ActivePostalVisitor[]>([]);
  const [landmarks,setLandmarks]=useState<WorldLandmark[]>([]);
  const [selectedLandmark,setSelectedLandmark]=useState<WorldLandmark>();
  const [landmarkDialogOpen,setLandmarkDialogOpen]=useState(false);
  const [newVisitorIds, setNewVisitorIds] = useState<Set<string>>(() => new Set());
  const tripStatusTriggerRef = useRef<HTMLElement | null>(null);
  const highlightTimersRef = useRef<Map<string, number>>(new Map());
  const visitorHighlightTimersRef = useRef<Map<string, number>>(new Map());
  const knownVisitorIdsRef = useRef<Set<string>>(new Set());
  const toastTimerRef = useRef<number>();
  const handledMascotQueryRef = useRef<string | null>(null);
  const motionPreference = useMotionPreference();
  const {
    isLoading: isTrafficLoading,
    postalTraffic: trafficSnapshots,
    updatePostalTrafficAnchor,
  } = usePostalTraffic();
  const activeMascot = useMemo(() => {
    const selectedMascot = mascots.find((mascot) => mascot.id === selectedMascotId);
    return selectedMascot && hasActiveMascotDelivery(selectedMascot, now)
      ? selectedMascot
      : selectMapMascot(mascots, now);
  }, [mascots, now, selectedMascotId]);
  const activeDeliveryCandidate = activeMascot?.currentDelivery;
  const activeDelivery = activeDeliveryCandidate
    && getDeliveryStatus(activeDeliveryCandidate, now) !== "returned"
    && getDeliveryStatus(activeDeliveryCandidate, now) !== "completed"
    ? activeDeliveryCandidate
    : undefined;
  const finishedDeliveries = useMemo(
    () => mascots
      .map((mascot) => ({ mascot, delivery: mascot.currentDelivery }))
      .filter(({ delivery: candidate }) => candidate && getDeliveryStatus(candidate, now) === "returned")
      .map(({ mascot, delivery: candidate }) => ({ mascot, delivery: candidate! })),
    [mascots, now],
  );
  const requestedDeliveryId = searchParams.get("deliveryId")
    ?? activeDelivery?.id;
  const collectionState = useRewardCollectionData(requestedDeliveryId);
  const collectionDelivery = collectionState.delivery?.id === requestedDeliveryId
    ? collectionState.delivery
    : undefined;
  const delivery = collectionDelivery
    ?? activeDelivery
    ?? createIdleNestDelivery(profile, activeMascot);
  const originLabel = resolveDeliveryPlaceLabel(delivery, "origin", t);
  const destinationLabel = resolveDeliveryPlaceLabel(delivery, "destination", t);
  const displayMascot = mascots.find((mascot) => mascot.id === delivery.mascotId) ?? activeMascot;
  const petPosition = useMemo(() => getPetMapPosition(delivery, now), [delivery, now]);
  const baseRewards = useMemo(
    () => delivery.routeDiscoveryVersion
      ? collectionState.routeDiscoveries.map((reward) => ({
          ...reward,
          discovered: petPosition.outboundProgress >= reward.routeProgress,
        }))
      : getRouteRewardDiscoveries(delivery, now),
    [collectionState.routeDiscoveries, delivery, now, petPosition.outboundProgress],
  );
  const rewards = useMemo(
    () => baseRewards.map((reward) => runtimeDiscoveryIds.has(reward.id)
      ? { ...reward, discovered: true }
      : reward),
    [baseRewards, runtimeDiscoveryIds],
  );
  const activePostalVisitors = useMemo(
    () => postalVisitors
      .filter((visitor) => getPostalVisitorMinutes(visitor.departsAt, now.getTime()) > 0)
      .slice(0, 3),
    [now, postalVisitors],
  );
  const activeVisitorIds = useMemo(
    () => new Set(activePostalVisitors.map((visitor) => visitor.deliveryId)),
    [activePostalVisitors],
  );
  const rewardStates = useMemo<Record<string, RouteDiscoveryVisualState>>(
    () => Object.fromEntries(rewards.map((reward) => [
      reward.id,
      getRouteDiscoveryVisualState(reward, newDiscoveryIds),
    ])),
    [newDiscoveryIds, rewards],
  );
  const postalTraffic = useMemo(
    () => trafficSnapshots
      .filter((pet) => isPostalTrafficJourneyVisible(pet, trafficNow))
      .map((pet) => {
        const position = getPostalTrafficDisplayPosition(
          pet,
          activeVisitorIds,
          profile ? { latitude: profile.home_latitude, longitude: profile.home_longitude } : undefined,
          trafficNow,
        );
        return {
          ...pet,
          coordinates: position.coordinates,
          leg: position.leg,
          progress: Math.round(position.progress * 100),
        };
      }),
    [activeVisitorIds, profile, trafficSnapshots, trafficNow],
  );
  const visiblePostalTraffic = useMemo(
    () => postalTraffic.filter((pet) => pet.visualPhase !== "leaving"),
    [postalTraffic],
  );
  const placeLabels = useMemo(
    () => createMapPlaceLabels(delivery, rewards, t, originLabel, destinationLabel),
    [delivery, destinationLabel, originLabel, rewards, t],
  );
  const discoveredCount = rewards.filter((reward) => reward.discovered).length;
  const status = getDeliveryStatus(delivery, now);
  const isCollected = collectionState.delivery?.id === delivery.id && collectionState.isCollected;
  const journeyPhase = getMapJourneyPhase(status, isCollected);
  const visualCoordinates = journeyPhase === "traveling" ? petPosition.coordinates : delivery.origin;
  const visualTheme = useTravelVisualTheme(delivery.id, now, visualCoordinates);
  const completedMap = journeyPhase === "completed";
  const progressPercent = Math.round(getTravelProgress(delivery, now) * 100);
  const displayedPlaceLabels = journeyPhase === "traveling" ? placeLabels : [];
  const selectedReward = selection?.kind === "reward"
    ? rewards.find((reward) => reward.id === selection.rewardId)
    : undefined;
  const trafficSelection = resolvePostalTrafficSelection(
    visiblePostalTraffic,
    selection?.kind === "traffic" ? selection.trafficId : undefined,
    selectedTrafficSnapshot,
  );
  const selectedTraffic = trafficSelection.pet;
  const selectedTrafficRange: PostalTrafficRangeState = trafficSelection.rangeState ?? "visible";
  const rewardLabels = useMemo(
    () => Object.fromEntries(rewards.map((reward) => [
      reward.id,
      reward.discovered
        ? t(reward.titleKey)
        : `${t("map.futureReward")}: ${t(reward.regionLabel as TranslationKey)}`,
    ])),
    [rewards, t],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, liveTickMs);

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  useEffect(()=>{
    let stale=false;
    const refresh=async()=>{try{const next=await reconcileWorldLandmarks();if(!stale)setLandmarks(next);}catch{/* Keep the map usable while reconciliation retries. */}};
    void refresh();
    const interval=window.setInterval(refresh,liveTickMs);
    const visible=()=>{if(document.visibilityState==="visible")void refresh();};
    document.addEventListener("visibilitychange",visible);
    window.addEventListener("focus",refresh);
    return()=>{stale=true;window.clearInterval(interval);document.removeEventListener("visibilitychange",visible);window.removeEventListener("focus",refresh);};
  },[profile?.id]);

  useEffect(() => {
    const updateTrafficClock = () => {
      if (document.visibilityState === "visible") setTrafficNow(new Date());
    };
    const intervalId = window.setInterval(
      updateTrafficClock,
      motionPreference === "reduced" ? liveTickMs : trafficTickMs,
    );
    document.addEventListener("visibilitychange", updateTrafficClock);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", updateTrafficClock);
    };
  }, [motionPreference]);

  useEffect(() => {
    let active=true;
    async function refreshVisitors() {
      if (document.visibilityState!=="visible") return;
      try {
        const visitors=(await fetchActivePostalVisitors()).filter((visitor)=>getPostalVisitorMinutes(visitor.departsAt)>0).slice(0,3);
        if (!active) return;
        const nextIds=new Set(visitors.map((visitor)=>visitor.deliveryId));
        const detected=visitors.filter((visitor)=>!knownVisitorIdsRef.current.has(visitor.deliveryId));
        knownVisitorIdsRef.current=nextIds;
        setPostalVisitors(visitors);
        detected.forEach((visitor)=>{
          setNewVisitorIds((current)=>new Set([...current,visitor.deliveryId]));
          const existing=visitorHighlightTimersRef.current.get(visitor.deliveryId);
          if(existing)window.clearTimeout(existing);
          const timer=window.setTimeout(()=>{
            setNewVisitorIds((current)=>{const next=new Set(current);next.delete(visitor.deliveryId);return next});
            visitorHighlightTimersRef.current.delete(visitor.deliveryId);
          },discoveryHighlightMs);
          visitorHighlightTimersRef.current.set(visitor.deliveryId,timer);
        });
      } catch {
        // Keep the last authoritative snapshot until a later retry succeeds.
      }
    }
    const onVisibility=()=>{if(document.visibilityState==="visible")void refreshVisitors()};
    const onFocus=()=>void refreshVisitors();
    void refreshVisitors();
    const interval=window.setInterval(()=>void refreshVisitors(),visitorRefreshMs);
    document.addEventListener("visibilitychange",onVisibility);
    window.addEventListener("focus",onFocus);
    return()=>{active=false;window.clearInterval(interval);document.removeEventListener("visibilitychange",onVisibility);window.removeEventListener("focus",onFocus)};
  },[]);

  useEffect(() => {
    if (isLoading) return;
    const requestedMascotId = searchParams.get("mascotId");
    if (handledMascotQueryRef.current === requestedMascotId) return;
    handledMascotQueryRef.current = requestedMascotId;

    const mascotId = resolveRequestedTravelMascotId(mascots, requestedMascotId, now);
    if (!mascotId) return;

    setSelectedMascotId(mascotId);
    setFollowMascot(true);
    setSelection(null);
    setSelectedTrafficSnapshot(undefined);
    setFocusTarget({ kind: "mascot" });
  }, [isLoading, mascots, now, searchParams]);

  useEffect(() => {
    if (mascots.some((mascot) => mascot.id === selectedMascotId)) return;
    const fallbackMascot = selectMapMascot(mascots, now);
    if (fallbackMascot) setSelectedMascotId(fallbackMascot.id);
  }, [mascots, now, selectedMascotId]);

  useEffect(() => {
    const selectedMascot = mascots.find((mascot) => mascot.id === selectedMascotId);
    if (selectedMascot && hasActiveMascotDelivery(selectedMascot, now)) return;
    if (resolveRequestedTravelMascotId(mascots, searchParams.get("mascotId"), now)) return;
    const travelingMascot = selectMapMascot(mascots, now);
    if (travelingMascot) {
      setSelectedMascotId(travelingMascot.id);
      setFocusTarget({ kind: "overview" });
    }
  }, [mascots, now, searchParams, selectedMascotId]);

  useEffect(() => {
    if (trafficSelection.rangeState === "visible" && trafficSelection.pet) {
      setSelectedTrafficSnapshot(trafficSelection.pet);
    }
  }, [trafficSelection.pet, trafficSelection.rangeState]);

  useEffect(() => () => {
    highlightTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    visitorHighlightTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    highlightTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    highlightTimersRef.current.clear();
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setRuntimeDiscoveryIds(new Set());
    setNewDiscoveryIds(new Set());
    setDiscoveryToast(null);
  }, [delivery.id]);

  useEffect(() => {
    if (journeyPhase === "traveling") return;
    setFollowMascot(false);
    setSelection(null);
    setSelectedTrafficSnapshot(undefined);

    if (journeyPhase === "completed") {
      setReturnSummaryOpen(false);
      setFocusTarget({ kind: "origin" });
      return;
    }

    const mobileQuery = window.matchMedia("(max-width: 819px)");
    const openOnceOnMobile = () => {
      if (!mobileQuery.matches) return;
      const key = `duif-map-summary-opened:${delivery.id}:${journeyPhase}`;
      try {
        if (!window.sessionStorage.getItem(key)) {
          setReturnSummaryOpen(true);
          window.sessionStorage.setItem(key, "true");
        }
      } catch {
        setReturnSummaryOpen(true);
      }
    };

    openOnceOnMobile();
    mobileQuery.addEventListener("change", openOnceOnMobile);
    return () => mobileQuery.removeEventListener("change", openOnceOnMobile);
  }, [delivery.id, journeyPhase]);

  function handleRewardDiscoveries(rewardIds: string[], _origin: RouteDiscoveryEventOrigin) {
    if (rewardIds.length === 0) return;
    setRuntimeDiscoveryIds((current) => new Set([...current, ...rewardIds]));
    setNewDiscoveryIds((current) => new Set([...current, ...rewardIds]));
    setDiscoveryToast(rewardIds);

    rewardIds.forEach((rewardId) => {
      const existingTimer = highlightTimersRef.current.get(rewardId);
      if (existingTimer) window.clearTimeout(existingTimer);
      const timer = window.setTimeout(() => {
        setNewDiscoveryIds((current) => {
          const next = new Set(current);
          next.delete(rewardId);
          return next;
        });
        highlightTimersRef.current.delete(rewardId);
      }, discoveryHighlightMs);
      highlightTimersRef.current.set(rewardId, timer);
    });

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setDiscoveryToast(null), discoveryHighlightMs);
  }

  function selectReward(rewardId: string) {
    setFollowMascot(false);
    setSelectedTrafficSnapshot(undefined);
    setSelection({ kind: "reward", rewardId });
    setFocusTarget({ kind: "reward", rewardId });
    setDiscoveryDialogOpen(true);
  }

  function selectTraffic(trafficId: string) {
    const trafficPet = visiblePostalTraffic.find((pet) => pet.id === trafficId);
    if (!trafficPet) return;
    setFollowMascot(false);
    setSelectedTrafficSnapshot(trafficPet);
    setSelection({ kind: "traffic", trafficId });
    setFocusTarget({ kind: "traffic", trafficId });
    setTrafficDialogOpen(true);
  }

  function selectLandmark(catalogKey:string){
    const landmark=landmarks.find((item)=>item.catalogKey===catalogKey); if(!landmark)return;
    setFollowMascot(false);setSelection({kind:"landmark",landmarkKey:catalogKey});
    setFocusTarget({kind:"landmark",landmarkKey:catalogKey});setSelectedLandmark(landmark);setLandmarkDialogOpen(true);
  }

  async function acknowledgeLandmark(landmark:WorldLandmark){
    setLandmarks((items)=>items.map((item)=>item.catalogKey===landmark.catalogKey?{...item,announcementPending:false}:item));
    try{await acknowledgeWorldLandmark(landmark.catalogKey);}catch{/* Durable state is reconciled on the next refresh. */}
  }

  function closeRewardDetails() {
    setFollowMascot(false);
    setSelection(null);
    setFocusTarget({ kind: "mascot" });
  }

  function closeTrafficDetails() {
    setSelection(null);
    setSelectedTrafficSnapshot(undefined);
  }

  function selectOwnMascot(mascotId: string) {
    const mascot = mascots.find((candidate) => candidate.id === mascotId);
    if (!mascot) return;
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("deliveryId");
    nextSearchParams.set("mascotId", mascotId);
    setSearchParams(nextSearchParams, { replace: true });
    setSelectedMascotId(mascotId);
    setFollowMascot(true);
    setSelection(null);
    setSelectedTrafficSnapshot(undefined);
    setFocusTarget({ kind: "mascot" });
  }

  function openTripStatus(trigger?: HTMLElement) {
    tripStatusTriggerRef.current = trigger
      ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setTripStatusOpen(true);
  }

  function closeTripStatus() {
    setTripStatusOpen(false);
    window.requestAnimationFrame(() => tripStatusTriggerRef.current?.focus());
  }

  return (
    <main className={styles.page}>
      <section className={styles.stage} aria-busy={isLoading || collectionState.isLoading || isTrafficLoading}>
        <div className={styles.mapLayer}>
          <TravelMap
            centerControl={
              <MascotMapSelector
                mascots={mascots}
                onInspect={openTripStatus}
                onSelect={selectOwnMascot}
                selectedMascotId={displayMascot?.id}
              />
            }
            delivery={delivery}
            deliveryCompleted={journeyPhase === "completed"}
            destinationLabel={destinationLabel}
            destinationTitle={t("mascot.destination")}
            fallbackLabel={t("map.unavailable")}
            focusTarget={focusTarget}
            followMascot={followMascot}
            motionPreference={motionPreference}
            onFollowChange={setFollowMascot}
            onPetSelect={() => openTripStatus()}
            onRewardDiscoveries={handleRewardDiscoveries}
            onRewardSelect={selectReward}
            onLandmarkSelect={selectLandmark}
            onTrafficSelect={selectTraffic}
            onViewportChange={updatePostalTrafficAnchor}
            originLabel={originLabel}
            originTitle={t("mascot.origin")}
            petLabel={displayMascot?.name ?? t("common.unavailable")}
            petPortraitAssetKey={displayMascot?.appearance.portraitAssetKey}
            petPrestigeAssetKey={displayMascot?.flightState?.borders.find((border)=>border.selected)?.assetKey}
            placeLabels={displayedPlaceLabels}
            petPosition={petPosition.coordinates}
            postalTraffic={postalTraffic}
            rewardLabels={rewardLabels}
            rewardStates={rewardStates}
            rewards={completedMap ? [] : rewards}
            landmarks={landmarks}
            landmarkLabels={Object.fromEntries(landmarks.map((item)=>[item.catalogKey,t(item.nameKey)]))}
            selection={selection}
            showRouteLabels={journeyPhase === "traveling"}
            visualTheme={visualTheme}
          />
        </div>

        {journeyPhase === "traveling" && displayMascot ? (
          <div className={styles.mapTravelStatus}><TravelStatusLabel mascotName={displayMascot.name} statusLabel={t(`delivery.status.${status}`)}/></div>
        ) : null}

        {(activePostalVisitors.length > 0 || (journeyPhase === "traveling" && displayMascot && (landmarks.length > 0 || delivery.segmentedTravel || visiblePostalTraffic.length > 0 || rewards.length > 0))) ? (
          <nav aria-label={t("map.activeMapTools")} className={styles.activeMapTools}>
            {activePostalVisitors.map((visitor) => (
              <Link
                aria-label={`${t("mailbox.visitingMascot")}: ${visitor.mascotName}, ${getPostalVisitorMinutes(visitor.departsAt, now.getTime())} ${t("mailbox.minutesRemaining")}`}
                className={`${styles.activeToolButton} ${styles.visitorToolButton}`}
                data-new={newVisitorIds.has(visitor.deliveryId) || undefined}
                key={visitor.deliveryId}
                title={t("mailbox.openVisitorLetter")}
                to={`/mailbox?deliveryId=${visitor.deliveryId}`}
              >
                <MascotPrestigeMedallion alt={visitor.mascotName} borderAssetKey={visitor.prestigeAssetKey} className={styles.visitorPortrait} portraitAssetKey={visitor.portraitAssetKey} size="small" />
                <span>{getPostalVisitorMinutes(visitor.departsAt, now.getTime())} min</span>
              </Link>
            ))}
            {journeyPhase === "traveling" && displayMascot && delivery.segmentedTravel ? <TravelWeatherBadge baseSpeedKmh={delivery.animalSpeedKmh} isDay={!visualTheme.isNight} mascotName={displayMascot.name} summary={delivery.segmentedTravel} /> : null}
            {journeyPhase === "traveling" && visiblePostalTraffic.length > 0 ? <button aria-label={t("postalTraffic.title")} className={styles.activeToolButton} onClick={() => setTrafficDialogOpen(true)} title={t("postalTraffic.title")} type="button"><AirTrafficControl aria-hidden="true" weight="duotone" /><span>{visiblePostalTraffic.length}</span></button> : null}
            {journeyPhase === "traveling" && rewards.length > 0 ? <button aria-label={t("map.discoveries")} className={styles.activeToolButton} data-new={newDiscoveryIds.size > 0 || undefined} onClick={() => { closeRewardDetails(); setDiscoveryDialogOpen(true); }} title={t("map.discoveries")} type="button"><Binoculars aria-hidden="true" weight="duotone" /><span>{discoveredCount}/{rewards.length}</span></button> : null}
            {journeyPhase==="traveling"&&landmarks.length>0?<button aria-label={t("map.landmarks.title")} className={styles.activeToolButton} data-new={landmarks.some((item)=>item.announcementPending)||undefined} onClick={()=>{setSelectedLandmark(landmarks[0]);setLandmarkDialogOpen(true);}} title={t("map.landmarks.title")} type="button"><MapPin aria-hidden="true" weight="duotone"/><span>{landmarks.length}</span></button>:null}
          </nav>
        ) : null}

        {discoveryToast ? (
          <div className={styles.discoveryToast} role="status">
            <strong>{discoveryToast.length === 1 ? t("map.discoveryToastSingle") : t("map.discoveryToastMultiple")}</strong>
            <span>{discoveryToast.length === 1
              ? t(rewards.find((reward) => reward.id === discoveryToast[0])?.titleKey ?? "map.discovered")
              : `${discoveryToast.length} ${t("map.discoveries")}`}</span>
          </div>
        ) : null}

        {landmarks.find((item)=>item.announcementPending) ? <LandmarkBanner landmark={landmarks.find((item)=>item.announcementPending)!} onDismiss={acknowledgeLandmark} onOpen={(landmark)=>{void acknowledgeLandmark(landmark);selectLandmark(landmark.catalogKey);}}/>:null}

        {finishedDeliveries.length > 0 ? (
          <div className={styles.finishedDeliveryAlert} role="status">
            <AssetImage
              alt=""
              className={styles.finishedDeliveryMark}
              assetKey={finishedDeliveries[0]!.mascot.appearance.portraitAssetKey}
            >
              <span className={styles.finishedDeliveryMarkFallback} aria-hidden="true" />
            </AssetImage>
            <div>
              <strong>{t("map.deliveryFinished")}</strong>
              <span>{finishedDeliveries.length === 1
                ? finishedDeliveries[0]!.mascot.name
                : `${finishedDeliveries.length} ${t("map.finishedDeliveries")}`}</span>
            </div>
            <Link to={`/rewards/${finishedDeliveries[0]!.delivery.id}`}>
              {t("map.collectFinishedDelivery")}
            </Link>
          </div>
        ) : null}

        {journeyPhase !== "traveling" && !isPostalFriendsLoading && connections.accepted.length === 0 ? (
          <div className={styles.friendPrompt}>
            <div><strong>{t("friends.emptyTitle")}</strong><span>{t("friends.emptyDescription")}</span></div>
            <Link to="/friends">{t("friends.findFriend")}</Link>
          </div>
        ) : null}

        <MapCameraControls
          deliveryCompleted={journeyPhase === "completed"}
          followMascot={followMascot}
          onFollowChange={setFollowMascot}
          onFocus={setFocusTarget}
        />

        <aside className={styles.overlayPanel}>
          {journeyPhase === "returned" ? (
            <>
              <details
                className={styles.mobileDrawer}
                onToggle={(event) => setReturnSummaryOpen(event.currentTarget.open)}
                open={returnSummaryOpen}
              >
                <summary>
                  <span>{t("map.cargoFound")}</span>
                  <strong>{discoveredCount}</strong>
                </summary>
                <div className={styles.drawerContent}>
                  <CargoSummary
                    delivery={delivery}
                    canCollect={collectionState.canCollect}
                    journeyPhase="returned"
                    primaryReward={collectionState.reward}
                    rewards={rewards.filter((reward) => reward.discovered)}
                  />
                </div>
              </details>
              <div className={styles.desktopCards}>
                <SketchPanel
                  title={t("map.cargoFound")}
                  variant="map"
                >
                  <CargoSummary
                    delivery={delivery}
                    canCollect={collectionState.canCollect}
                    journeyPhase="returned"
                    primaryReward={collectionState.reward}
                    rewards={rewards.filter((reward) => reward.discovered)}
                  />
                </SketchPanel>
              </div>
            </>
          ) : null}
        </aside>

        {trafficDialogOpen?<PostalTrafficDialog onClose={()=>setTrafficDialogOpen(false)} onSelect={selectTraffic} onShowList={closeTrafficDetails} postalTraffic={visiblePostalTraffic} rangeState={selectedTrafficRange} selectedTraffic={selectedTraffic}/>:null}
        {discoveryDialogOpen?<RouteDiscoveryDialog discoveredCount={discoveredCount} onClose={()=>setDiscoveryDialogOpen(false)} onSelect={selectReward} onShowList={closeRewardDetails} rewardStates={rewardStates} rewards={rewards} selectedReward={selectedReward} sourceLabel={t(delivery.routeDiscoveryVersion?"map.persistedRewards":"map.mockedRewards")}/>:null}
        {landmarkDialogOpen&&selectedLandmark?<LandmarkDialog landmark={selectedLandmark} landmarks={landmarks} onClose={()=>{setLandmarkDialogOpen(false);setSelection(null);}} onSelect={selectLandmark}/>:null}

        {tripStatusOpen && journeyPhase !== "completed" ? (
          <TripStatusDialog
            delivery={delivery}
            displayMascot={displayMascot}
            destinationLabel={destinationLabel}
            isDay={!visualTheme.isNight}
            now={now}
            onClosed={closeTripStatus}
            originLabel={originLabel}
            petLeg={petPosition.leg}
            progressPercent={progressPercent}
            status={status}
          />
        ) : null}

        <div className={styles.bottomNav}>
          <AppBottomNav />
        </div>
      </section>
    </main>
  );
}

function CargoSummary({
  canCollect,
  delivery,
  journeyPhase,
  primaryReward,
  rewards,
}: {
  canCollect: boolean;
  delivery: Delivery;
  journeyPhase: Exclude<MapJourneyPhase, "traveling">;
  primaryReward?: DeliveryReward;
  rewards: RouteRewardDiscovery[];
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.cargoSummary}>
      <p className={styles.cargoLead}>
        {journeyPhase === "completed" ? t("map.completedDescription") : t("map.cargoFoundDescription")}
      </p>

      <section className={styles.cargoSection}>
        <div className={styles.cargoHeading}>
          <h3>{t("map.routeCargo")}</h3>
          <span>{rewards.length}</span>
        </div>
        <div className={styles.cargoGrid}>
          {rewards.map((reward) => (
            <ItemCard
              description={`${t(`map.rewardKinds.${reward.kind}`)} · ${t(reward.regionLabel as TranslationKey)}`}
              key={reward.id}
              label={t(`equipment.rarity.${reward.rarity}`)}
              meta={t("map.visualCargo")}
              title={t(reward.titleKey)}
            >
              <AssetImage alt={t(reward.titleKey)} assetKey={reward.thumbnailAssetKey} className={styles.cargoImage}>
                <span className={styles.cargoFallback} aria-hidden="true" />
              </AssetImage>
            </ItemCard>
          ))}
        </div>
      </section>

      <section className={styles.cargoSection}>
        <div className={styles.cargoHeading}>
          <h3>{t("map.primaryReward")}</h3>
          <span>{primaryReward ? 1 : 0}</span>
        </div>
        {primaryReward ? (
          <ItemCard
            description={t(primaryReward.item.descriptionKey)}
            label={t(`equipment.rarity.${primaryReward.item.rarity}`)}
            meta={journeyPhase === "completed" ? t("map.rewardCollected") : t("map.collectionPending")}
            selected={journeyPhase === "completed"}
            title={t(primaryReward.item.nameKey)}
          >
            <AssetImage alt={t(primaryReward.item.nameKey)} assetKey={primaryReward.item.thumbnailAssetKey} className={styles.cargoImage}>
              <span className={styles.cargoFallback} aria-hidden="true" />
            </AssetImage>
          </ItemCard>
        ) : (
          <p className={styles.emptyNote}>{t("map.noPrimaryReward")}</p>
        )}
      </section>

      {journeyPhase === "returned" ? (
        <>
          <p className={styles.cargoNote}>{t("map.routeCargoPreviewNote")}</p>
          {primaryReward && canCollect ? (
            <Link className={styles.routeLink} to={`/rewards/${delivery.id}`}>
              {t("map.goToCollection")}
            </Link>
          ) : primaryReward ? (
            <p className={styles.cargoNote}>{t("map.ownerCollectionOnly")}</p>
          ) : null}
        </>
      ) : (
        <Link className={styles.routeLink} to="/inventory">
          {t("map.openCollection")}
        </Link>
      )}
    </div>
  );
}

function PostalTrafficContent({
  onSelect,
  postalTraffic,
  selectedTrafficId,
}: {
  onSelect: (trafficId: string) => void;
  postalTraffic: PostalTrafficPetSnapshot[];
  selectedTrafficId?: string;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.discoveryHeader}>
        <span>{postalTraffic.length}</span>
        <span>{t("postalTraffic.nearbyPets")}</span>
      </div>
      {postalTraffic.length > 0 ? (
        <div className={styles.discoveryList}>
          {postalTraffic.map((pet) => (
            <button
              aria-pressed={selectedTrafficId === pet.id}
              className={styles.trafficListButton}
              key={pet.id}
              onClick={() => onSelect(pet.id)}
              type="button"
            >
              <ItemCard
                description={t(pet.speciesKey)}
                meta={`${pet.progress}% · ${Math.round(pet.distanceFromMascotKm)} km`}
                selected={selectedTrafficId === pet.id}
                title={pet.mascotName}
              >
                <AssetImage
                  alt={pet.mascotName}
                  className={styles.trafficListPortrait}
                  assetKey={pet.portraitAssetKey}
                >
                  <span className={styles.trafficPortraitFallback} aria-hidden="true" />
                </AssetImage>
              </ItemCard>
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.emptyNote}>{t("postalTraffic.empty")}</p>
      )}
    </>
  );
}

function LandmarkBanner({landmark,onDismiss,onOpen}:{landmark:WorldLandmark;onDismiss:(landmark:WorldLandmark)=>void;onOpen:(landmark:WorldLandmark)=>void}){const{t}=useTranslation();return <aside className={styles.landmarkBanner} role="status"><AssetImage alt="" assetKey={landmark.assetKey} className={styles.landmarkBannerImage}><span aria-hidden="true"/></AssetImage><div><strong>{t("map.landmarks.discovered")}</strong><span>{t(landmark.nameKey)}</span></div><button onClick={()=>onOpen(landmark)} type="button">{t("map.landmarks.learnMore")}</button><button aria-label={t("map.landmarks.dismiss")} onClick={()=>onDismiss(landmark)} type="button"><X aria-hidden="true"/></button></aside>}

function LandmarkDialog({landmark,landmarks,onClose,onSelect}:{landmark:WorldLandmark;landmarks:WorldLandmark[];onClose:()=>void;onSelect:(key:string)=>void}){const{t}=useTranslation();const ref=useRef<HTMLDialogElement>(null);useEffect(()=>ref.current?.showModal(),[]);return <dialog aria-labelledby="landmark-dialog-title" className={styles.trafficDialog} onClick={(event)=>{if(event.target===event.currentTarget)ref.current?.close();}} onClose={onClose} ref={ref}><section className={`${styles.trafficDialogPaper} ${styles.landmarkPaper}`}><header><div><span>{t("map.landmarks.discovered")}</span><h2 id="landmark-dialog-title">{t(landmark.nameKey)}</h2></div><button aria-label={t("map.landmarks.close")} onClick={()=>ref.current?.close()} type="button"><X aria-hidden="true"/></button></header><AssetImage alt={t(landmark.nameKey)} assetKey={landmark.assetKey} className={styles.landmarkArtwork}><span aria-hidden="true"/></AssetImage><p>{t(landmark.descriptionKey)}</p><dl><div><dt>{t("map.landmarks.category")}</dt><dd>{t(`map.landmarks.${landmark.category}` as TranslationKey)}</dd></div><div><dt>{t("mascot.destination")}</dt><dd>{[landmark.city,landmark.region,landmark.countryCode].filter(Boolean).join(", ")}</dd></div></dl>{landmarks.length>1?<nav aria-label={t("map.landmarks.title")} className={styles.landmarkThumbnailList}>{landmarks.map((item)=><button aria-current={item.catalogKey===landmark.catalogKey?"true":undefined} aria-label={t(item.nameKey)} className={styles.landmarkThumbnailButton} key={item.catalogKey} onClick={()=>onSelect(item.catalogKey)} title={t(item.nameKey)} type="button"><AssetImage alt="" assetKey={item.assetKey} className={styles.landmarkThumbnail}><span aria-hidden="true"/></AssetImage></button>)}</nav>:null}</section></dialog>}

function PostalTrafficDialog({onClose,onSelect,onShowList,postalTraffic,rangeState,selectedTraffic}:{onClose:()=>void;onSelect:(id:string)=>void;onShowList:()=>void;postalTraffic:PostalTrafficPetSnapshot[];rangeState:PostalTrafficRangeState;selectedTraffic?:PostalTrafficPetSnapshot}){
  const {t}=useTranslation(); const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>ref.current?.showModal(),[]);
  function backdrop(event:MouseEvent<HTMLDialogElement>){if(event.target===event.currentTarget)ref.current?.close();}
  return <dialog aria-labelledby="postal-traffic-dialog-title" className={styles.trafficDialog} onClick={backdrop} onClose={onClose} ref={ref}><section className={styles.trafficDialogPaper}><header><div><span>{t("postalTraffic.nearbyPets")}</span><h2 id="postal-traffic-dialog-title">{t("postalTraffic.title")}</h2></div><button aria-label={t("map.closeTripStatus")} onClick={()=>ref.current?.close()} type="button"><X aria-hidden="true"/></button></header>{selectedTraffic?<><button className={styles.panelBackButton} onClick={onShowList} type="button">{t("map.backToTrip")}</button><PostalTrafficDetails pet={selectedTraffic} rangeState={rangeState}/></>:<PostalTrafficContent onSelect={onSelect} postalTraffic={postalTraffic}/>}</section></dialog>;
}

function PostalTrafficDetails({
  pet,
  rangeState,
}: {
  pet: PostalTrafficPetSnapshot;
  rangeState: PostalTrafficRangeState;
}) {
  const { t } = useTranslation();

  return (
    <article className={styles.trafficDetails}>
      <div className={styles.trafficCompactIdentity}>
        <AssetImage
          alt={pet.mascotName}
          className={styles.trafficCompactPortrait}
          assetKey={pet.portraitAssetKey}
        >
          <span className={styles.trafficPortraitFallback} aria-hidden="true" />
        </AssetImage>
        <div>
          <h3>{pet.mascotName}</h3>
          <p>{t(pet.speciesKey)}</p>
        </div>
        {pet.visibility === "friend" ? (
          <span className={styles.trafficFriendName}>{pet.friendName}</span>
        ) : null}
      </div>

      {rangeState === "outOfRange" ? (
        <p className={styles.outOfRangeNotice} role="status">{t("postalTraffic.outOfRange")}</p>
      ) : null}

      <dl className={styles.trafficRouteSummary}>
        <SummaryRow label={t("mascot.origin")} value={pet.originRegionLabel ?? t(pet.originRegionKey)} />
        <SummaryRow label={t("mascot.destination")} value={pet.destinationRegionLabel ?? t(pet.destinationRegionKey)} />
      </dl>

      {pet.visibility === "friend" ? (
        <Link className={styles.routeLink} to={`/friends/${pet.friendId}`}>
          {t("postalTraffic.openFriendProfile")}
        </Link>
      ) : null}
    </article>
  );
}

function MascotMapSelector({
  mascots,
  onInspect,
  onSelect,
  selectedMascotId,
}: {
  mascots: Mascot[];
  onInspect: (trigger: HTMLElement) => void;
  onSelect: (mascotId: string) => void;
  selectedMascotId?: string;
}) {
  const { t } = useTranslation();
  const [rotationDirection, setRotationDirection] = useState<"next" | "previous" | null>(null);
  const rotationTimerRef = useRef<number>();
  const inspectTimerRef = useRef<number>();
  const availableMascots = mascots.filter((mascot) => {
    if (!mascot.currentDelivery) return false;
    return !["returned", "completed"].includes(
      getDeliveryStatus(mascot.currentDelivery),
    );
  });
  const selectedIndex = Math.max(
    0,
    availableMascots.findIndex((mascot) => mascot.id === selectedMascotId),
  );

  useEffect(() => () => {
    if (rotationTimerRef.current) window.clearTimeout(rotationTimerRef.current);
    if (inspectTimerRef.current) window.clearTimeout(inspectTimerRef.current);
  }, []);

  if (availableMascots.length === 0) return null;

  function beginRotation(direction: "next" | "previous") {
    if (rotationTimerRef.current) window.clearTimeout(rotationTimerRef.current);
    setRotationDirection(direction);
    rotationTimerRef.current = window.setTimeout(() => {
      setRotationDirection(null);
      rotationTimerRef.current = undefined;
    }, 360);
  }

  function selectOffset(offset: number) {
    if (availableMascots.length < 2) return;
    beginRotation(offset > 0 ? "next" : "previous");
    const nextIndex = (selectedIndex + offset + availableMascots.length) % availableMascots.length;
    onSelect(availableMascots[nextIndex]!.id);
  }

  return (
    <div className={styles.mascotSelector}>
      <div className={styles.mascotCarousel} aria-label={t("map.selectMascot")}>
        <button
          aria-label={t("map.previousMascot")}
          className={`${styles.mascotCarouselArrow} ${styles.previousMascotArrow}`}
          disabled={availableMascots.length < 2}
          onClick={() => selectOffset(-1)}
          type="button"
        >
          <span aria-hidden="true" />
        </button>
        <div className={styles.mascotCarouselTrack} data-rotation={rotationDirection ?? undefined}>
          {availableMascots.map((mascot) => {
            const relativeIndex = (availableMascots.indexOf(mascot) - selectedIndex + availableMascots.length) % availableMascots.length;
            const position = relativeIndex === 0 ? "current" : relativeIndex === 1 ? "next" : "previous";
            return (
          <button
            aria-current={position === "current" ? "true" : undefined}
            aria-label={mascot.name}
            className={styles.mascotSelectorButton}
            data-position={position}
            key={mascot.id}
            onClick={(event) => {
              if (position !== "current") {
                beginRotation(position);
                onSelect(mascot.id);
                if (inspectTimerRef.current) window.clearTimeout(inspectTimerRef.current);
                const trigger = event.currentTarget;
                inspectTimerRef.current = window.setTimeout(() => onInspect(trigger), 320);
                return;
              }
              onInspect(event.currentTarget);
            }}
            type="button"
          >
            <AssetImage
              alt=""
              className={styles.mascotSelectorPortrait}
              assetKey={mascot.appearance.portraitAssetKey}
            >
              <span className={styles.trafficPortraitFallback} aria-hidden="true" />
            </AssetImage>
            <span>{mascot.name}</span>
          </button>
            );
          })}
        </div>
        <button
          aria-label={t("map.nextMascot")}
          className={`${styles.mascotCarouselArrow} ${styles.nextMascotArrow}`}
          disabled={availableMascots.length < 2}
          onClick={() => selectOffset(1)}
          type="button"
        >
          <span aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function TripStatusDialog({
  delivery,
  destinationLabel,
  displayMascot,
  now,
  isDay,
  onClosed,
  originLabel,
  petLeg,
  progressPercent,
  status,
}: {
  delivery: Delivery;
  destinationLabel: string;
  displayMascot: Mascot | undefined;
  isDay: boolean;
  now: Date;
  onClosed: () => void;
  originLabel: string;
  petLeg: TravelLeg;
  progressPercent: number;
  status: DeliveryStatus;
}) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => dialogRef.current?.showModal(), []);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) dialogRef.current?.close();
  }

  return (
    <dialog
      aria-labelledby="trip-status-dialog-title"
      className={styles.tripStatusDialog}
      onClick={handleBackdropClick}
      onClose={onClosed}
      ref={dialogRef}
    >
      <div className={styles.tripStatusDialogPaper}>
        <header className={styles.tripStatusHeader}>
          <AssetImage
            alt={displayMascot?.name ?? ""}
            className={styles.tripStatusPortrait}
            assetKey={displayMascot?.appearance.portraitAssetKey}
          >
            <span className={styles.tripStatusPortraitFallback} aria-hidden="true" />
          </AssetImage>
          <div className={styles.tripStatusIdentity}>
            <span>{t("map.tripStatus")}</span>
            <h2 id="trip-status-dialog-title">{displayMascot?.name ?? t("map.tripStatus")}</h2>
            {displayMascot ? <p>{t(displayMascot.speciesKey)}</p> : null}
          </div>
          <strong className={styles.tripStatusStamp}>{progressPercent}%</strong>
        </header>

        <section className={styles.tripStatusJourney}>
          <div className={styles.tripStatusEndpoint}>
            <span>{t("mascot.origin")}</span>
            <strong>{originLabel}</strong>
          </div>
          <div className={`${styles.tripStatusEndpoint} ${styles.tripStatusEndpointDestination}`}>
            <span>{t("mascot.destination")}</span>
            <strong>{destinationLabel}</strong>
          </div>
          <div className={styles.tripStatusTrack} aria-hidden="true">
            <span style={{ transform: `scaleX(${progressPercent / 100})` }} />
          </div>
        </section>

        {delivery.correspondenceType ? (
          <section className={styles.tripStatusCargo}>
            <span className={styles.tripStatusCargoMark} aria-hidden="true" />
            <div>
              <span>{t("map.carryingCargo")}</span>
              <strong>{t(`correspondence.${delivery.correspondenceType}.name`)}</strong>
            </div>
          </section>
        ) : null}

        <section className={styles.tripVisualFacts}>
          <VisualFact icon={<Clock weight="duotone"/>} label={t("delivery.remainingTime")} value={formatRemainingTime(delivery, now)}/>
          <VisualFact icon={<Compass weight="duotone"/>} label={t("map.currentLeg")} value={t(`map.legs.${petLeg}`)}/>
          <VisualFact icon={<Signpost weight="duotone"/>} label={t("travelWeather.segment")} value={delivery.segmentedTravel?`${delivery.segmentedTravel.currentSegmentIndex+1}/${delivery.segmentedTravel.segmentCount}`:t(`delivery.status.${status}`)}/>
          {delivery.segmentedTravel?<><VisualFact icon={<CloudSun weight="duotone"/>} label={t("travelWeather.weather")} value={`${t(`travelWeather.categories.${delivery.segmentedTravel.currentWeather.category}`)} · ${t(isDay?"travelWeather.day":"travelWeather.night")}`}/>{delivery.segmentedTravel.currentWeather.temperatureC!==undefined?<VisualFact icon={<CloudSun weight="duotone"/>} label={t("travelWeather.temperature")} value={`${Math.round(delivery.segmentedTravel.currentWeather.temperatureC)}°C`}/>:null}<VisualFact icon={<Gauge weight="duotone"/>} label={t("travelWeather.effectiveSpeed")} value={`${Math.round(effectiveSpeedKmh(delivery.animalSpeedKmh,delivery.segmentedTravel.effectiveSpeedMultiplier))} km/h`}/></>:null}
          {delivery.correspondenceType?<VisualFact icon={<Package weight="duotone"/>} label={t("map.carryingCargo")} value={t(`correspondence.${delivery.correspondenceType}.name`)}/>:null}
        </section>
        {delivery.segmentedTravel?.currentWeather.source==="openMeteo"?<p className={styles.weatherAttribution}>{t("travelWeather.attribution")}</p>:null}
        <div className={styles.tripStatusActions}>
          <Link className={styles.routeLink} to={`/mascots/${delivery.mascotId}`}>
            {t("map.backToMascot")}
          </Link>
          <button className={styles.tripStatusClose} onClick={() => dialogRef.current?.close()} type="button">
            {t("map.closeTripStatus")}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function VisualFact({icon,label,value}:{icon:ReactNode;label:string;value:string}){
  return <article className={styles.tripVisualFact}>{icon}<div><span>{label}</span><strong>{value}</strong></div></article>;
}

function RouteDiscoveryDialog({discoveredCount,onClose,onSelect,onShowList,rewardStates,rewards,selectedReward,sourceLabel}:{discoveredCount:number;onClose:()=>void;onSelect:(id:string)=>void;onShowList:()=>void;rewardStates:Record<string,RouteDiscoveryVisualState>;rewards:RouteRewardDiscovery[];selectedReward?:RouteRewardDiscovery;sourceLabel:string}){
  const {t}=useTranslation(); const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>ref.current?.showModal(),[]);
  function backdrop(event:MouseEvent<HTMLDialogElement>){if(event.target===event.currentTarget)ref.current?.close();}
  return <dialog aria-labelledby="route-discovery-dialog-title" className={styles.trafficDialog} onClick={backdrop} onClose={onClose} ref={ref}><section className={styles.trafficDialogPaper}><header><div><span>{discoveredCount}/{rewards.length}</span><h2 id="route-discovery-dialog-title">{selectedReward?t("map.rewardDetails"):t("map.discoveries")}</h2></div><button aria-label={t("map.closeTripStatus")} onClick={()=>ref.current?.close()} type="button"><X aria-hidden="true"/></button></header>{selectedReward?<><button className={styles.panelBackButton} onClick={onShowList} type="button">{t("map.backToTrip")}</button><RewardDetails reward={selectedReward} visualState={rewardStates[selectedReward.id]}/></>:<DiscoveryContent discoveredCount={discoveredCount} onSelect={onSelect} rewards={rewards} rewardStates={rewardStates} sourceLabel={sourceLabel}/>}</section></dialog>;
}

function DiscoveryContent({
  discoveredCount,
  onSelect,
  rewards,
  rewardStates,
  selectedRewardId,
  sourceLabel,
}: {
  discoveredCount: number;
  onSelect: (rewardId: string) => void;
  rewards: RouteRewardDiscovery[];
  rewardStates: Record<string, RouteDiscoveryVisualState>;
  selectedRewardId?: string;
  sourceLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.discoveryHeader}>
        <span>
          {discoveredCount}/{rewards.length}
        </span>
        <span>{sourceLabel}</span>
      </div>
      <div className={styles.discoveryList}>
        {rewards.map((reward) => (
          <RewardDiscoveryCard
            onSelect={onSelect}
            reward={reward}
            visualState={rewardStates[reward.id]}
            selected={selectedRewardId === reward.id}
            key={reward.id}
          />
        ))}
      </div>
    </>
  );
}

function RewardDiscoveryCard({
  onSelect,
  reward,
  visualState,
  selected,
}: {
  onSelect: (rewardId: string) => void;
  reward: RouteRewardDiscovery;
  visualState: RouteDiscoveryVisualState;
  selected: boolean;
}) {
  const { t } = useTranslation();

  return (
    <button
      aria-pressed={selected}
      className={styles.rewardListButton}
      onClick={() => onSelect(reward.id)}
      type="button"
    >
      <span className={`${styles.rewardListVisual} ${getDiscoveryVisualClass(visualState)}`} aria-hidden="true" />
      <span className={styles.rewardListContent}>
        <strong>{reward.discovered ? t(reward.titleKey) : t("map.futureReward")}</strong>
        <span>{reward.discovered ? t(reward.descriptionKey) : t("map.futureRewardHint")}</span>
        <small>{reward.discovered
          ? `${t(`map.rewardKinds.${reward.kind}`)} / ${t(getDiscoveryStateKey(visualState))}`
          : `${t("map.approximateRegion")}: ${t(reward.regionLabel as TranslationKey)}`}</small>
      </span>
    </button>
  );
}

function RewardDetails({ reward, visualState }: { reward: RouteRewardDiscovery; visualState: RouteDiscoveryVisualState }) {
  const { t } = useTranslation();

  return (
    <article className={styles.rewardDetails}>
      {reward.discovered && reward.thumbnailAssetKey ? (
        <img
          alt={t(reward.titleKey)}
          className={styles.rewardDetailImage}
          src={resolveActiveOfficialAssetPath(reward.thumbnailAssetKey)}
        />
      ) : (
        <div className={`${styles.rewardDetailVisual} ${getDiscoveryVisualClass(visualState)}`} aria-hidden="true" />
      )}
      <div>
        <p className={styles.detailState}>{t(getDiscoveryStateKey(visualState))}</p>
        <h2>{reward.discovered ? t(reward.titleKey) : t("map.futureReward")}</h2>
      </div>
      <p>{reward.discovered ? t(reward.descriptionKey) : t("map.futureRewardHint")}</p>
      <dl className={styles.rewardMetadata}>
        {reward.discovered ? (
          <>
            <SummaryRow label={t("map.rewardType")} value={t(`map.rewardKinds.${reward.kind}`)} />
            <SummaryRow label={t("map.rarity")} value={t(`equipment.rarity.${reward.rarity}`)} />
          </>
        ) : null}
        <SummaryRow label={t("map.approximateRegion")} value={t(reward.regionLabel as TranslationKey)} />
      </dl>
    </article>
  );
}

function getDiscoveryVisualClass(state: RouteDiscoveryVisualState) {
  if (state === "new") return styles.newDiscoveryVisual;
  if (state === "carried") return styles.carriedVisual;
  return styles.futureVisual;
}

function getDiscoveryStateKey(state: RouteDiscoveryVisualState): TranslationKey {
  if (state === "new") return "map.newDiscovery";
  if (state === "carried") return "map.carriedDiscovery";
  return "map.futureRewardState";
}

function MapCameraControls({
  deliveryCompleted,
  followMascot,
  onFollowChange,
  onFocus,
}: {
  deliveryCompleted: boolean;
  followMascot: boolean;
  onFollowChange: (follow: boolean) => void;
  onFocus: (target: MapFocusTarget) => void;
}) {
  const { t } = useTranslation();
  const controls: Array<{
    asset: import("../../game").OfficialAssetKey;
    isFollowControl?: boolean;
    label: string;
    target: MapFocusTarget;
  }> = [
    {
      asset: assetKeys.mapControls.overview,
      label: t("map.overview"),
      target: { kind: "overview" },
    },
    {
      asset: assetKeys.mapControls.mascot,
      isFollowControl: true,
      label: followMascot ? t("map.stopFollowing") : t("map.followMascot"),
      target: { kind: "mascot" },
    },
    {
      asset: assetKeys.mapControls.origin,
      label: t("map.focusOrigin"),
      target: { kind: "origin" },
    },
    {
      asset: assetKeys.mapControls.destination,
      label: t("map.focusDestination"),
      target: { kind: "destination" },
    },
  ];

  return (
    <nav className={styles.cameraControls} aria-label={t("map.cameraControls")}>
      {controls.map((control) => {
        const disabled = isMapCameraTargetDisabled(
          control.target.kind as "overview" | "mascot" | "origin" | "destination",
          deliveryCompleted,
        );
        return (
        <button
          aria-label={control.label}
          aria-pressed={control.isFollowControl ? followMascot : undefined}
          disabled={disabled}
          key={control.target.kind}
          onClick={() => {
            if (control.isFollowControl) {
              const nextFollowState = !followMascot;
              onFollowChange(nextFollowState);
              if (nextFollowState) onFocus(control.target);
              return;
            }

            onFollowChange(false);
            onFocus(control.target);
          }}
          title={control.label}
          type="button"
        >
          <AssetImage alt="" assetKey={control.asset} className={styles.cameraControlIcon} loading="eager">
            <span className={styles.cameraControlFallback} aria-hidden="true" />
          </AssetImage>
          <span className={styles.visuallyHidden}>{control.label}</span>
        </button>
        );
      })}
    </nav>
  );
}

function useMotionPreference(): MapMotionPreference {
  const [preference, setPreference] = useState<MapMotionPreference>(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full",
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPreference(mediaQuery.matches ? "reduced" : "full");
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return preference;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function selectMapMascot(mascots: Mascot[], now: Date) {
  return (
    mascots.find((mascot) => hasActiveMascotDelivery(mascot, now)) ??
    mascots.find((mascot) => mascot.id === defaultMascotId)
  );
}

function createIdleNestDelivery(
  profile: { id: string; home_latitude: number; home_longitude: number; home_label_key: string } | null,
  mascot: Mascot | undefined,
): Delivery {
  const origin = profile
    ? {
        latitude: profile.home_latitude,
        longitude: profile.home_longitude,
        labelKey: profile.home_label_key as TranslationKey,
      }
    : { latitude: 0, longitude: 0, labelKey: "onboarding.tutorialNestLabel" as TranslationKey };
  return {
    id: "idle-nest",
    senderId: profile?.id ?? "idle-nest",
    receiverId: profile?.id ?? "idle-nest",
    mascotId: mascot?.id ?? defaultMascotId,
    origin,
    destination: origin,
    distanceKm: 0,
    animalSpeedKmh: 1,
    outboundStartAt: "1970-01-01T00:00:00.000Z",
    outboundArrivalAt: "1970-01-01T00:00:00.000Z",
    returnStartAt: "1970-01-01T00:00:00.000Z",
    returnArrivalAt: "1970-01-01T00:00:00.000Z",
    status: "completed",
    rewardSeed: "idle-nest",
  };
}

function createMapPlaceLabels(
  delivery: Delivery,
  rewards: RouteRewardDiscovery[],
  t: (key: TranslationKey) => string,
  originLabel = resolveDeliveryPlaceLabel(delivery, "origin", t),
  destinationLabel = resolveDeliveryPlaceLabel(delivery, "destination", t),
): MapPlaceLabel[] {
  return [
    {
      coordinates: delivery.origin,
      id: `${delivery.id}-origin`,
      kind: "origin",
      label: originLabel,
    },
    {
      coordinates: delivery.destination,
      id: `${delivery.id}-destination`,
      kind: "destination",
      label: destinationLabel,
    },
    ...rewards.map((reward) => ({
      coordinates: reward.coordinates,
      id: reward.id,
      kind: "reward" as const,
      label: reward.discovered ? t(reward.titleKey) : t("map.futureReward"),
    })),
  ];
}
