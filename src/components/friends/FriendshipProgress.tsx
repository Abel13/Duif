import { getFriendshipProgress } from "../../game";
import { useTranslation } from "../../i18n";
import { AssetImage } from "../ui";
import styles from "./FriendshipProgress.module.css";

type FriendshipProgressProps = {
  exchangeCount: number;
  variant?: "compact" | "full";
};

export function FriendshipProgress({
  exchangeCount,
  variant = "compact",
}: FriendshipProgressProps) {
  const { t } = useTranslation();
  const progress = getFriendshipProgress(exchangeCount);
  const levelLabel = t(progress.nameKey);
  const cycleLabel = progress.isMax
    ? t("friends.maxBond")
    : t("friends.cyclesProgress")
        .replace("{current}", String(progress.cycles))
        .replace("{next}", String(progress.nextThreshold));
  const summary = `${t("friends.friendshipLevel")} ${progress.level}: ${levelLabel}. ${cycleLabel}`;
  const fillPercent = Math.round(progress.progressRatio * 100);

  return (
    <div
      aria-label={summary}
      className={`${styles.root} ${variant === "full" ? styles.full : styles.compact}`}
      role="group"
    >
      <AssetImage
        alt={t(progress.sealAltKey)}
        assetKey={progress.sealAssetKey}
        className={styles.seal}
      >
        <span aria-hidden="true" className={styles.sealFallback} />
      </AssetImage>
      <div className={styles.copy}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t("friends.friendshipLevel")}</span>
          <strong className={styles.levelMark}>{progress.level}</strong>
        </div>
        <p className={styles.name}>{levelLabel}</p>
        <div className={styles.meter}>
          <div
            aria-hidden="true"
            className={styles.track}
          >
            <span className={styles.fill} style={{ width: `${fillPercent}%` }} />
          </div>
          <span className={styles.cycles}>{cycleLabel}</span>
        </div>
      </div>
    </div>
  );
}
