import { Link, Navigate, useParams } from "react-router-dom";

import { MobileTopBar, PageShell } from "../../components/layout";
import { RoutePreview } from "../../components/map/RoutePreview";
import { ItemCard, SketchPanel, StampButton } from "../../components/ui";
import {
  formatRemainingTime,
  getDeliveryStatus,
  getMascotById,
  getTravelProgress,
  useRewardCollectionData,
  type Delivery,
  type DeliveryReward,
} from "../../game";
import { useTranslation, type TranslationKey } from "../../i18n";
import styles from "./RewardCollectionPage.module.css";

const defaultMascotId = "mascot-nuvem";

export function RewardCollectionPage() {
  const { t } = useTranslation();
  const { deliveryId } = useParams();
  const {
    collectReward,
    delivery,
    error,
    inventoryCount,
    isCollected,
    isLoading,
    isMutating,
    reward,
  } = useRewardCollectionData(deliveryId);

  if (isLoading) {
    return (
      <PageShell className={styles.page} hasTopBar>
        <MobileTopBar backLabelKey="navigation.backToNest" backTo={`/mascots/${defaultMascotId}`} title={t("rewards.title")} />
        <div className={styles.shell}>
          <SketchPanel eyebrow={t("rewards.eyebrow")} title={t("rewards.title")}>
            <p className={styles.subtitle}>{t("rewards.loading")}</p>
          </SketchPanel>
        </div>
      </PageShell>
    );
  }

  if (!delivery) {
    return <Navigate replace to={`/mascots/${defaultMascotId}`} />;
  }

  const mascot = getMascotById(delivery.mascotId);
  const status = isCollected ? "completed" : getDeliveryStatus(delivery);
  const isReady = status === "returned" && reward;
  const displayReward = reward;
  const shouldShowReward = Boolean(displayReward && (isReady || isCollected));

  return (
    <PageShell className={styles.page} hasTopBar>
      <MobileTopBar backLabelKey="navigation.backToNest" backTo={`/mascots/${delivery.mascotId}`} title={t("rewards.title")} />
      <div className={styles.shell}>
        <div className={styles.grid}>
          <SketchPanel
            title={
              isCollected
                ? t("rewards.completedTitle")
                : isReady
                  ? t("rewards.readyTitle")
                  : t("rewards.travelingTitle")
            }
            variant="note"
          >
            <p className={styles.subtitle}>
              {isCollected
                ? t("rewards.completedDescription")
                : isReady
                  ? t("rewards.readyDescription")
                  : t("rewards.travelingDescription")}
            </p>
            <div className={styles.envelope}>
              <div className={styles.envelopeFlap} aria-hidden="true" />
              <dl className={styles.summary}>
                <SummaryRow
                  label={t("send.selectedMascot")}
                  value={mascot?.name ?? t("common.unavailable")}
                />
                <SummaryRow label={t("mascot.origin")} value={t(delivery.origin.labelKey)} />
                <SummaryRow label={t("mascot.destination")} value={t(delivery.destination.labelKey)} />
                <SummaryRow label={t("mascot.status")} value={t(`delivery.status.${status}`)} />
              </dl>
            </div>
          </SketchPanel>

          {shouldShowReward ? (
            <RewardPanel
              error={error}
              inventoryCount={inventoryCount}
              isCollected={Boolean(isCollected)}
              isMutating={isMutating}
              deliveryId={delivery.id}
              onCollect={collectReward}
              reward={displayReward as DeliveryReward}
            />
          ) : (
            <TravelingPanel delivery={delivery} />
          )}
        </div>
      </div>
    </PageShell>
  );
}

function RewardPanel({
  error,
  inventoryCount,
  isCollected,
  isMutating,
  deliveryId,
  onCollect,
  reward,
}: {
  error?: TranslationKey;
  inventoryCount: number;
  isCollected: boolean;
  isMutating: boolean;
  deliveryId: string;
  onCollect: () => void;
  reward: DeliveryReward;
}) {
  const { t } = useTranslation();

  return (
    <SketchPanel title={t("rewards.itemFound")}>
      <div className={styles.rewardStack}>
        <ItemCard
          label={t(`equipment.rarity.${reward.item.rarity}`)}
          title={t(reward.item.nameKey)}
          description={t(reward.item.descriptionKey)}
          meta={isCollected ? t("rewards.collected") : `${t("rewards.xpGained")}: ${reward.xpGained}`}
          selected={isCollected}
        />
        <dl className={styles.rewardDetails}>
          <SummaryRow
            label={t("rewards.xpGained")}
            value={`${reward.xpGained} ${t("mascot.xp")}`}
          />
          <SummaryRow
            label={t("rewards.rarity")}
            value={t(`equipment.rarity.${reward.item.rarity}`)}
          />
          <SummaryRow label={t("rewards.inventory")} value={`${inventoryCount}`} />
        </dl>
        {isCollected ? (
          <Link className={styles.returnLink} to={`/map?deliveryId=${encodeURIComponent(deliveryId)}`}>
            {t("rewards.backToMap")}
          </Link>
        ) : (
          <StampButton disabled={isMutating} onClick={onCollect}>
            {isMutating ? t("rewards.collecting") : t("rewards.collectButton")}
          </StampButton>
        )}
        {error ? <p className={styles.feedback}>{t(error)}</p> : null}
      </div>
    </SketchPanel>
  );
}

function TravelingPanel({ delivery }: { delivery: Delivery }) {
  const { t } = useTranslation();
  const status = getDeliveryStatus(delivery);

  return (
    <SketchPanel title={t("mascot.route")} variant="map">
      <div className={styles.routeWrap}>
        <RoutePreview
          originLabel={t(delivery.origin.labelKey)}
          destinationLabel={t(delivery.destination.labelKey)}
          progress={getTravelProgress(delivery)}
          statusLabel={t(`delivery.status.${status}`)}
          remainingTime={formatRemainingTime(delivery)}
          distanceLabel={`${delivery.distanceKm} ${t("units.kilometers")}`}
        />
        <Link className={styles.returnLink} to={`/mascots/${delivery.mascotId}`}>
          {t("rewards.backToMascot")}
        </Link>
      </div>
    </SketchPanel>
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
