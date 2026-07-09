import { Link, Navigate, useParams } from "react-router-dom";
import { useState } from "react";

import { RoutePreview } from "../../components/map/RoutePreview";
import { ItemCard, SketchPanel, StampButton } from "../../components/ui";
import {
  createMockRewardFromDelivery,
  formatRemainingTime,
  getDeliveryById,
  getDeliveryStatus,
  getMascotById,
  getTravelProgress,
  initialMockInventory,
  type Delivery,
  type DeliveryReward,
  type InventoryItem,
} from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./RewardCollectionPage.module.css";

const defaultMascotId = "mascot-nuvem";

export function RewardCollectionPage() {
  const { t } = useTranslation();
  const { deliveryId } = useParams();
  const delivery = deliveryId ? getDeliveryById(deliveryId) : undefined;
  const [collectedReward, setCollectedReward] = useState<DeliveryReward | undefined>();
  const [inventory, setInventory] = useState<InventoryItem[]>(initialMockInventory);

  if (!delivery) {
    return <Navigate replace to={`/mascots/${defaultMascotId}`} />;
  }

  const mascot = getMascotById(delivery.mascotId);
  const reward = createMockRewardFromDelivery(delivery);
  const status = collectedReward ? "completed" : getDeliveryStatus(delivery);
  const isReady = status === "returned" && reward;
  const isCollected = status === "completed" && collectedReward;

  function handleCollect() {
    if (!reward) {
      return;
    }

    setCollectedReward(reward);
    setInventory((currentInventory) => [
      ...currentInventory,
      {
        ...reward.item,
        collectedAt: new Date().toISOString(),
      },
    ]);
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("rewards.eyebrow")} title={t("rewards.title")}>
          <p className={styles.subtitle}>
            {isCollected
              ? t("rewards.completedDescription")
              : isReady
                ? t("rewards.readyDescription")
                : t("rewards.travelingDescription")}
          </p>
        </SketchPanel>

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

          {isReady || isCollected ? (
            <RewardPanel
              inventoryCount={inventory.length}
              isCollected={Boolean(isCollected)}
              mascotId={delivery.mascotId}
              onCollect={handleCollect}
              reward={(collectedReward ?? reward) as DeliveryReward}
            />
          ) : (
            <TravelingPanel delivery={delivery} />
          )}
        </div>
      </div>
    </main>
  );
}

function RewardPanel({
  inventoryCount,
  isCollected,
  mascotId,
  onCollect,
  reward,
}: {
  inventoryCount: number;
  isCollected: boolean;
  mascotId: string;
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
          <Link className={styles.returnLink} to={`/mascots/${mascotId}`}>
            {t("rewards.backToMascot")}
          </Link>
        ) : (
          <StampButton onClick={onCollect}>{t("rewards.collectButton")}</StampButton>
        )}
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
