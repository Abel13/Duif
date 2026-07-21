import { Link, useNavigate } from "react-router-dom";

import {
  formatRemainingTime,
  getDeliveryStatus,
  getTravelProgress,
  resolveMascotDeliveryAction,
  type Delivery,
} from "../../game";
import { useTranslation } from "../../i18n";
import { RoutePreview } from "../map/RoutePreview";
import { SketchPanel, StampButton } from "../ui";
import styles from "./MascotTravelCard.module.css";

type MascotTravelCardProps = {
  delivery?: Delivery;
};

export function MascotTravelCard({ delivery }: MascotTravelCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!delivery) {
    return (
      <SketchPanel eyebrow={t("mascot.currentDelivery")} title={t("mascot.noDeliveryTitle")}>
        <p className={styles.empty}>{t("mascot.noDeliveryDescription")}</p>
      </SketchPanel>
    );
  }

  const progress = getTravelProgress(delivery);
  const progressLabel = `${Math.round(progress * 100)}%`;
  const calculatedStatus = getDeliveryStatus(delivery);
  const statusLabel = t(`delivery.status.${calculatedStatus}`);
  const remainingTime = formatRemainingTime(delivery);
  const distanceLabel = `${delivery.distanceKm} ${t("units.kilometers")}`;
  const action = resolveMascotDeliveryAction(delivery);

  return (
    <SketchPanel eyebrow={t("mascot.currentDelivery")} title={t("mascot.route")} variant="map">
      <div className={styles.previewRegion} role="group" aria-label={t("delivery.routePreview")}>
        <p className={styles.previewLabel}>{t("delivery.routePreview")}</p>
        <RoutePreview
          originLabel={t(delivery.origin.labelKey)}
          destinationLabel={t(delivery.destination.labelKey)}
          progress={progress}
          statusLabel={statusLabel}
          remainingTime={remainingTime}
          distanceLabel={distanceLabel}
        />
      </div>
      <dl className={styles.details}>
        <div>
          <dt>{t("mascot.origin")}</dt>
          <dd>{t(delivery.origin.labelKey)}</dd>
        </div>
        <div>
          <dt>{t("mascot.destination")}</dt>
          <dd>{t(delivery.destination.labelKey)}</dd>
        </div>
        <div>
          <dt>{t("mascot.distance")}</dt>
          <dd>{distanceLabel}</dd>
        </div>
        <div>
          <dt>{t("mascot.status")}</dt>
          <dd>{statusLabel}</dd>
        </div>
        <div>
          <dt>{t("delivery.progress")}</dt>
          <dd>{progressLabel}</dd>
        </div>
        <div>
          <dt>{t("delivery.remainingTime")}</dt>
          <dd>{remainingTime}</dd>
        </div>
      </dl>
      {action === "collect" ? (
        <Link className={styles.rewardLink} to={`/rewards/${delivery.id}`}>
          {t("rewards.collectButton")}
        </Link>
      ) : action === "viewTrip" ? (
        <StampButton onClick={() => navigate(`/map?mascotId=${delivery.mascotId}`)}>
          {t("mascot.viewTrip")}
        </StampButton>
      ) : null}
    </SketchPanel>
  );
}
