import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { AppBottomNav } from "../../components/layout";
import { TravelMap } from "../../components/map/TravelMap";
import { ItemCard, SketchPanel } from "../../components/ui";
import {
  formatRemainingTime,
  getDeliveryStatus,
  getMascotById,
  getPetMapPosition,
  getRouteRewardDiscoveries,
  getTravelProgress,
  nuvemDelivery,
  type Delivery,
  type DeliveryStatus,
  type MapPlaceLabel,
  type Mascot,
  type RouteRewardDiscovery,
  type TravelLeg,
} from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { type TranslationKey, useTranslation } from "../../i18n";
import styles from "./TravelMapPage.module.css";

const defaultMascotId = "mascot-nuvem";
const liveTickMs = 30 * 1000;

export function TravelMapPage() {
  const { t } = useTranslation();
  const { isLoading, mascots } = useMascotCatalog();
  const [now, setNow] = useState(() => new Date());
  const mascot = useMemo(() => selectMapMascot(mascots), [mascots]);
  const delivery = mascot?.currentDelivery ?? nuvemDelivery;
  const displayMascot = mascot ?? getMascotById(defaultMascotId);
  const petPosition = useMemo(() => getPetMapPosition(delivery, now), [delivery, now]);
  const rewards = useMemo(() => getRouteRewardDiscoveries(delivery, now), [delivery, now]);
  const placeLabels = useMemo(
    () => createMapPlaceLabels(delivery, rewards, t),
    [delivery, rewards, t],
  );
  const discoveredCount = rewards.filter((reward) => reward.discovered).length;
  const status = getDeliveryStatus(delivery, now);
  const progressPercent = Math.round(getTravelProgress(delivery, now) * 100);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, liveTickMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.stage} aria-busy={isLoading}>
        <div className={styles.mapLayer}>
          <TravelMap
            delivery={delivery}
            destinationLabel={t(delivery.destination.labelKey)}
            fallbackLabel={t("map.unavailable")}
            originLabel={t(delivery.origin.labelKey)}
            petLabel={displayMascot?.name ?? t("common.unavailable")}
            placeLabels={placeLabels}
            petPosition={petPosition.coordinates}
            rewards={rewards}
          />
        </div>

        <aside className={styles.overlayPanel}>
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
              <DiscoveryContent discoveredCount={discoveredCount} rewards={rewards} />
            </div>
          </details>

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

            <SketchPanel title={t("map.discoveries")} variant="map">
              <DiscoveryContent discoveredCount={discoveredCount} rewards={rewards} />
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
  rewards,
}: {
  discoveredCount: number;
  rewards: RouteRewardDiscovery[];
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
          <RewardDiscoveryCard reward={reward} key={reward.id} />
        ))}
      </div>
    </>
  );
}

function RewardDiscoveryCard({ reward }: { reward: RouteRewardDiscovery }) {
  const { t } = useTranslation();

  return (
    <ItemCard
      label={t(`equipment.rarity.${reward.rarity}`)}
      title={t(reward.titleKey)}
      description={t(reward.descriptionKey)}
      meta={`${t(`map.rewardKinds.${reward.kind}`)} / ${
        reward.discovered ? t("map.discovered") : t("map.onTheRoute")
      }`}
      selected={reward.discovered}
    />
  );
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
      label: t(reward.titleKey),
    })),
  ];
}
