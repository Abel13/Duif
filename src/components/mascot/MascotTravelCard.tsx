import type { Delivery } from "../../game";
import { useTranslation } from "../../i18n";
import { SketchPanel, StampButton } from "../ui";
import styles from "./MascotTravelCard.module.css";

type MascotTravelCardProps = {
  delivery?: Delivery;
};

export function MascotTravelCard({ delivery }: MascotTravelCardProps) {
  const { t } = useTranslation();

  if (!delivery) {
    return (
      <SketchPanel eyebrow={t("mascot.currentDelivery")} title={t("mascot.noDeliveryTitle")}>
        <p className={styles.empty}>{t("mascot.noDeliveryDescription")}</p>
      </SketchPanel>
    );
  }

  return (
    <SketchPanel eyebrow={t("mascot.currentDelivery")} title={t("mascot.route")} variant="map">
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
          <dd>
            {delivery.distanceKm} {t("units.kilometers")}
          </dd>
        </div>
        <div>
          <dt>{t("mascot.status")}</dt>
          <dd>{t(`delivery.status.${delivery.status}`)}</dd>
        </div>
      </dl>
      <StampButton>{t("mascot.viewTrip")}</StampButton>
    </SketchPanel>
  );
}
