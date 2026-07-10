import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { MascotBottomNav } from "../../components/mascot/MascotBottomNav";
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
  type Mascot,
  type RouteRewardDiscovery,
} from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { useTranslation } from "../../i18n";
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
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("map.eyebrow")} title={t("map.title")}>
          <p className={styles.subtitle}>{t("map.subtitle")}</p>
        </SketchPanel>

        <section className={styles.layout} aria-busy={isLoading}>
          <div className={styles.mapColumn}>
            <TravelMap
              delivery={delivery}
              destinationLabel={t(delivery.destination.labelKey)}
              fallbackLabel={t("map.unavailable")}
              originLabel={t(delivery.origin.labelKey)}
              petLabel={displayMascot?.name ?? t("common.unavailable")}
              petPosition={petPosition.coordinates}
              rewards={rewards}
            />
          </div>

          <aside className={styles.sidebar}>
            <SketchPanel title={t("map.tripStatus")} variant="note">
              <dl className={styles.summary}>
                <SummaryRow
                  label={t("send.selectedMascot")}
                  value={displayMascot?.name ?? t("common.unavailable")}
                />
                <SummaryRow label={t("mascot.status")} value={t(`delivery.status.${status}`)} />
                <SummaryRow label={t("delivery.progress")} value={`${progressPercent}%`} />
                <SummaryRow label={t("delivery.remainingTime")} value={formatRemainingTime(delivery, now)} />
                <SummaryRow label={t("map.currentLeg")} value={t(`map.legs.${petPosition.leg}`)} />
              </dl>
              <Link className={styles.routeLink} to={`/mascots/${delivery.mascotId}`}>
                {t("map.backToMascot")}
              </Link>
            </SketchPanel>

            <SketchPanel title={t("map.discoveries")} variant="map">
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
            </SketchPanel>

          </aside>
        </section>

        <MascotBottomNav />
      </div>
    </main>
  );
}

function RewardDiscoveryCard({ reward }: { reward: RouteRewardDiscovery }) {
  const { t } = useTranslation();

  return (
    <ItemCard
      label={t(`equipment.rarity.${reward.rarity}`)}
      title={t(reward.titleKey)}
      description={t(reward.descriptionKey)}
      meta={reward.discovered ? t("map.discovered") : t("map.onTheRoute")}
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
