import type { Mascot } from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./MascotStatsPanel.module.css";

type MascotStatsPanelProps = {
  mascot: Mascot;
};

export function MascotStatsPanel({ mascot }: MascotStatsPanelProps) {
  const { t } = useTranslation();
  const xpProgress = Math.round((mascot.xp / mascot.nextLevelXp) * 100);
  const attributes = [
    ["mascot.speed", mascot.attributes.speed],
    ["mascot.stamina", mascot.attributes.stamina],
    ["mascot.orientation", mascot.attributes.orientation],
    ["mascot.luck", mascot.attributes.luck],
  ] as const;

  return (
    <div className={styles.stats}>
      <div className={styles.level}>
        <span>{t("mascot.level")}</span>
        <strong>{mascot.level}</strong>
      </div>
      <div className={styles.xp}>
        <div className={styles.xpHeader}>
          <span>{t("mascot.xp")}</span>
          <span>
            {mascot.xp}/{mascot.nextLevelXp}
          </span>
        </div>
        <div className={styles.track}>
          <span className={styles.fill} style={{ width: `${xpProgress}%` }} />
        </div>
      </div>
      <dl className={styles.attributes}>
        {mascot.flightState?<><div className={styles.attribute}><dt>{t("mascot.flightRange" as never)}</dt><dd>{mascot.flightState.maxOneWayKm} km</dd></div><div className={styles.attribute}><dt>{t("mascot.naturalSlots" as never)}</dt><dd>{mascot.flightState.naturalSlots}</dd></div></>:null}
        {attributes.map(([labelKey, value]) => (
          <div className={styles.attribute} key={labelKey}>
            <dt>{t(labelKey)}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
