import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { AppBottomNav } from "../../components/layout";
import { TravelMap } from "../../components/map/TravelMap";
import { AssetImage, ItemCard, SketchPanel } from "../../components/ui";
import {
  assetPaths,
  formatRemainingTime,
  getDeliveryStatus,
  getMascotById,
  getNearbyPostalTrafficPets,
  getRouteDiscoveryVisualState,
  getPetMapPosition,
  getRouteRewardDiscoveries,
  getTravelProgress,
  nuvemDelivery,
  type Delivery,
  type DeliveryStatus,
  type MapFocusTarget,
  type MapMotionPreference,
  type MapPlaceLabel,
  type MapSelection,
  type Mascot,
  type PostalTrafficPetSnapshot,
  type RouteRewardDiscovery,
  type RouteDiscoveryEventOrigin,
  type RouteDiscoveryVisualState,
  type TravelLeg,
} from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { type TranslationKey, useTranslation } from "../../i18n";
import styles from "./TravelMapPage.module.css";

const defaultMascotId = "mascot-nuvem";
const liveTickMs = 30 * 1000;
const discoveryHighlightMs = 4 * 1000;

export function TravelMapPage() {
  const { t } = useTranslation();
  const { isLoading, mascots } = useMascotCatalog();
  const [now, setNow] = useState(() => new Date());
  const [focusTarget, setFocusTarget] = useState<MapFocusTarget>({ kind: "overview" });
  const [followMascot, setFollowMascot] = useState(false);
  const [selection, setSelection] = useState<MapSelection>(null);
  const [runtimeDiscoveryIds, setRuntimeDiscoveryIds] = useState<Set<string>>(() => new Set());
  const [newDiscoveryIds, setNewDiscoveryIds] = useState<Set<string>>(() => new Set());
  const [discoveryToast, setDiscoveryToast] = useState<string[] | null>(null);
  const highlightTimersRef = useRef<Map<string, number>>(new Map());
  const toastTimerRef = useRef<number>();
  const motionPreference = useMotionPreference();
  const mascot = useMemo(() => selectMapMascot(mascots), [mascots]);
  const delivery = mascot?.currentDelivery ?? nuvemDelivery;
  const displayMascot = mascot ?? getMascotById(defaultMascotId);
  const petPosition = useMemo(() => getPetMapPosition(delivery, now), [delivery, now]);
  const baseRewards = useMemo(() => getRouteRewardDiscoveries(delivery, now), [delivery, now]);
  const rewards = useMemo(
    () => baseRewards.map((reward) => runtimeDiscoveryIds.has(reward.id)
      ? { ...reward, discovered: true }
      : reward),
    [baseRewards, runtimeDiscoveryIds],
  );
  const rewardStates = useMemo<Record<string, RouteDiscoveryVisualState>>(
    () => Object.fromEntries(rewards.map((reward) => [
      reward.id,
      getRouteDiscoveryVisualState(reward, newDiscoveryIds),
    ])),
    [newDiscoveryIds, rewards],
  );
  const postalTraffic = useMemo(() => getNearbyPostalTrafficPets(delivery, now), [delivery, now]);
  const localizedPostalTraffic = useMemo(
    () =>
      postalTraffic.map((pet) => ({
        ...pet,
        label: getPostalTrafficDisplayLabel(pet, t),
      })),
    [postalTraffic, t],
  );
  const placeLabels = useMemo(
    () => createMapPlaceLabels(delivery, rewards, t),
    [delivery, rewards, t],
  );
  const discoveredCount = rewards.filter((reward) => reward.discovered).length;
  const status = getDeliveryStatus(delivery, now);
  const progressPercent = Math.round(getTravelProgress(delivery, now) * 100);
  const selectedReward = selection?.kind === "reward"
    ? rewards.find((reward) => reward.id === selection.rewardId)
    : undefined;
  const rewardLabels = useMemo(
    () => Object.fromEntries(rewards.map((reward) => [
      reward.id,
      reward.discovered
        ? t(reward.titleKey)
        : `${t("map.futureReward")}: ${reward.regionLabel}`,
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

  useEffect(() => () => {
    highlightTimersRef.current.forEach((timer) => window.clearTimeout(timer));
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
    setSelection({ kind: "reward", rewardId });
    setFocusTarget({ kind: "reward", rewardId });
  }

  function closeRewardDetails() {
    setFollowMascot(false);
    setSelection(null);
    setFocusTarget({ kind: "mascot" });
  }

  return (
    <main className={styles.page}>
      <section className={styles.stage} aria-busy={isLoading}>
        <div className={styles.mapLayer}>
          <TravelMap
            delivery={delivery}
            destinationLabel={t(delivery.destination.labelKey)}
            fallbackLabel={t("map.unavailable")}
            focusTarget={focusTarget}
            followMascot={followMascot}
            motionPreference={motionPreference}
            onFollowChange={setFollowMascot}
            onRewardDiscoveries={handleRewardDiscoveries}
            onRewardSelect={selectReward}
            originLabel={t(delivery.origin.labelKey)}
            petLabel={displayMascot?.name ?? t("common.unavailable")}
            petPortraitAssetPath={displayMascot?.appearance.portraitAssetPath}
            placeLabels={placeLabels}
            petPosition={petPosition.coordinates}
            postalTraffic={localizedPostalTraffic}
            rewardLabels={rewardLabels}
            rewardStates={rewardStates}
            rewards={rewards}
            selection={selection}
          />
        </div>

        {discoveryToast ? (
          <div className={styles.discoveryToast} role="status">
            <strong>{discoveryToast.length === 1 ? t("map.discoveryToastSingle") : t("map.discoveryToastMultiple")}</strong>
            <span>{discoveryToast.length === 1
              ? t(rewards.find((reward) => reward.id === discoveryToast[0])?.titleKey ?? "map.discovered")
              : `${discoveryToast.length} ${t("map.discoveries")}`}</span>
          </div>
        ) : null}

        <MapCameraControls
          followMascot={followMascot}
          onFollowChange={setFollowMascot}
          onFocus={setFocusTarget}
        />

        <aside className={styles.overlayPanel}>
          {selectedReward ? (
            <section className={`${styles.mobileDrawer} ${styles.mobileRewardDetails}`}>
              <button className={styles.drawerBackButton} onClick={closeRewardDetails} type="button">
                {t("map.backToTrip")}
              </button>
              <div className={styles.drawerContent}>
                <RewardDetails reward={selectedReward} visualState={rewardStates[selectedReward.id]} />
              </div>
            </section>
          ) : (
            <details className={styles.mobileDrawer}>
              <summary>
                <span>{t("map.tripStatus")}</span>
                <strong>{discoveredCount}/{rewards.length}</strong>
              </summary>
              <div className={styles.drawerContent}>
                <TripStatusContent
                  delivery={delivery}
                  displayMascot={displayMascot}
                  now={now}
                  petLeg={petPosition.leg}
                  progressPercent={progressPercent}
                  status={status}
                />
                <PostalTrafficContent postalTraffic={localizedPostalTraffic} />
                <DiscoveryContent
                  discoveredCount={discoveredCount}
                  onSelect={selectReward}
                  rewards={rewards}
                  rewardStates={rewardStates}
                  selectedRewardId={selection?.kind === "reward" ? selection.rewardId : undefined}
                />
              </div>
            </details>
          )}

          <div className={styles.desktopCards}>
            <SketchPanel title={t("map.tripStatus")} variant="note">
              <TripStatusContent
                delivery={delivery}
                displayMascot={displayMascot}
                now={now}
                petLeg={petPosition.leg}
                progressPercent={progressPercent}
                status={status}
              />
            </SketchPanel>

            <SketchPanel title={t("postalTraffic.title")} variant="note">
              <PostalTrafficContent postalTraffic={localizedPostalTraffic} />
            </SketchPanel>

            <SketchPanel title={selectedReward ? t("map.rewardDetails") : t("map.discoveries")} variant="map">
              {selectedReward ? (
                <>
                  <button className={styles.panelBackButton} onClick={closeRewardDetails} type="button">
                    {t("map.backToTrip")}
                  </button>
                  <RewardDetails reward={selectedReward} visualState={rewardStates[selectedReward.id]} />
                </>
              ) : (
                <DiscoveryContent
                  discoveredCount={discoveredCount}
                  onSelect={selectReward}
                  rewards={rewards}
                  rewardStates={rewardStates}
                  selectedRewardId={selection?.kind === "reward" ? selection.rewardId : undefined}
                />
              )}
            </SketchPanel>
          </div>
        </aside>

        <div className={styles.bottomNav}>
          <AppBottomNav />
        </div>
      </section>
    </main>
  );
}

function PostalTrafficContent({
  postalTraffic,
}: {
  postalTraffic: PostalTrafficPetSnapshot[];
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
            <ItemCard
              description={t(pet.speciesKey)}
              key={pet.id}
              meta={`${t(`postalTraffic.visibility.${pet.visibility}`)} / ${Math.round(
                pet.distanceFromRouteKm,
              )} km`}
              selected={pet.visibility === "friend"}
              title={pet.label}
            />
          ))}
        </div>
      ) : (
        <p className={styles.emptyNote}>{t("postalTraffic.empty")}</p>
      )}
    </>
  );
}

function TripStatusContent({
  delivery,
  displayMascot,
  now,
  petLeg,
  progressPercent,
  status,
}: {
  delivery: Delivery;
  displayMascot: Mascot | undefined;
  now: Date;
  petLeg: TravelLeg;
  progressPercent: number;
  status: DeliveryStatus;
}) {
  const { t } = useTranslation();

  return (
    <>
      <dl className={styles.summary}>
        <SummaryRow
          label={t("send.selectedMascot")}
          value={displayMascot?.name ?? t("common.unavailable")}
        />
        <SummaryRow label={t("mascot.status")} value={t(`delivery.status.${status}`)} />
        <SummaryRow label={t("delivery.progress")} value={`${progressPercent}%`} />
        <SummaryRow label={t("delivery.remainingTime")} value={formatRemainingTime(delivery, now)} />
        <SummaryRow label={t("map.currentLeg")} value={t(`map.legs.${petLeg}`)} />
      </dl>
      <Link className={styles.routeLink} to={`/mascots/${delivery.mascotId}`}>
        {t("map.backToMascot")}
      </Link>
    </>
  );
}

function DiscoveryContent({
  discoveredCount,
  onSelect,
  rewards,
  rewardStates,
  selectedRewardId,
}: {
  discoveredCount: number;
  onSelect: (rewardId: string) => void;
  rewards: RouteRewardDiscovery[];
  rewardStates: Record<string, RouteDiscoveryVisualState>;
  selectedRewardId?: string;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.discoveryHeader}>
        <span>
          {discoveredCount}/{rewards.length}
        </span>
        <span>{t("map.mockedRewards")}</span>
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
          : `${t("map.approximateRegion")}: ${reward.regionLabel}`}</small>
      </span>
    </button>
  );
}

function RewardDetails({ reward, visualState }: { reward: RouteRewardDiscovery; visualState: RouteDiscoveryVisualState }) {
  const { t } = useTranslation();

  return (
    <article className={styles.rewardDetails}>
      {reward.discovered && reward.thumbnailAssetPath ? (
        <img
          alt={t(reward.titleKey)}
          className={styles.rewardDetailImage}
          src={reward.thumbnailAssetPath}
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
        <SummaryRow label={t("map.approximateRegion")} value={reward.regionLabel} />
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
  followMascot,
  onFollowChange,
  onFocus,
}: {
  followMascot: boolean;
  onFollowChange: (follow: boolean) => void;
  onFocus: (target: MapFocusTarget) => void;
}) {
  const { t } = useTranslation();
  const controls: Array<{
    asset: string;
    isFollowControl?: boolean;
    label: string;
    target: MapFocusTarget;
  }> = [
    {
      asset: assetPaths.mapControls.icon("overview.webp"),
      label: t("map.overview"),
      target: { kind: "overview" },
    },
    {
      asset: assetPaths.mapControls.icon("mascot.webp"),
      isFollowControl: true,
      label: followMascot ? t("map.stopFollowing") : t("map.followMascot"),
      target: { kind: "mascot" },
    },
    {
      asset: assetPaths.mapControls.icon("origin.webp"),
      label: t("map.focusOrigin"),
      target: { kind: "origin" },
    },
    {
      asset: assetPaths.mapControls.icon("destination.webp"),
      label: t("map.focusDestination"),
      target: { kind: "destination" },
    },
  ];

  return (
    <nav className={styles.cameraControls} aria-label={t("map.cameraControls")}>
      {controls.map((control) => (
        <button
          aria-label={control.label}
          aria-pressed={control.isFollowControl ? followMascot : undefined}
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
          <AssetImage alt="" className={styles.cameraControlIcon} loading="eager" src={control.asset}>
            <span className={styles.cameraControlFallback} aria-hidden="true" />
          </AssetImage>
          <span className={styles.visuallyHidden}>{control.label}</span>
        </button>
      ))}
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

function selectMapMascot(mascots: Mascot[]) {
  return (
    mascots.find((mascot) => mascot.currentDelivery) ??
    mascots.find((mascot) => mascot.id === defaultMascotId)
  );
}

function createMapPlaceLabels(
  delivery: Delivery,
  rewards: RouteRewardDiscovery[],
  t: (key: TranslationKey) => string,
): MapPlaceLabel[] {
  return [
    {
      coordinates: delivery.origin,
      id: `${delivery.id}-origin`,
      kind: "origin",
      label: t(delivery.origin.labelKey),
    },
    {
      coordinates: delivery.destination,
      id: `${delivery.id}-destination`,
      kind: "destination",
      label: t(delivery.destination.labelKey),
    },
    ...rewards.map((reward) => ({
      coordinates: reward.coordinates,
      id: reward.id,
      kind: "reward" as const,
      label: reward.discovered ? t(reward.titleKey) : t("map.futureReward"),
    })),
  ];
}

function getPostalTrafficDisplayLabel(
  pet: PostalTrafficPetSnapshot,
  t: (key: TranslationKey) => string,
) {
  if (pet.visibility === "anonymous") {
    return t("postalTraffic.anonymousPet");
  }

  return pet.label;
}
