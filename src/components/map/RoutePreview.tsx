import type { CSSProperties } from "react";

import styles from "./RoutePreview.module.css";

export type RoutePreviewProps = {
  originLabel: string;
  destinationLabel: string;
  progress: number;
  statusLabel: string;
  remainingTime: string;
  distanceLabel: string;
};

export function RoutePreview({
  originLabel,
  destinationLabel,
  progress,
  statusLabel,
  remainingTime,
  distanceLabel,
}: RoutePreviewProps) {
  const safeProgress = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const progressPercent = Math.round(safeProgress * 100);
  const previewStyle = {
    "--route-progress": `${progressPercent}%`,
  } as CSSProperties;

  return (
    <article className={styles.preview} style={previewStyle}>
      <div className={styles.map} aria-hidden="true">
        <svg className={styles.route} viewBox="0 0 320 140" role="presentation" focusable="false">
          <path
            className={styles.wash}
            d="M30 88 C75 30, 129 112, 173 56 S260 39, 296 83"
          />
          <path
            className={styles.line}
            d="M30 88 C75 30, 129 112, 173 56 S260 39, 296 83"
          />
          <circle className={styles.pin} cx="30" cy="88" r="7" />
          <circle className={styles.pin} cx="296" cy="83" r="7" />
        </svg>
        <span className={styles.marker} />
      </div>

      <div className={styles.points}>
        <span>{originLabel}</span>
        <span>{destinationLabel}</span>
      </div>

      <div className={styles.meta}>
        <span>{statusLabel}</span>
        <span>{remainingTime}</span>
        <span>{distanceLabel}</span>
        <span>{progressPercent}%</span>
      </div>
    </article>
  );
}
