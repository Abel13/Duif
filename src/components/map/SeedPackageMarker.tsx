import type { SeedPackageIndicator } from "../../game/types";
import styles from "./SeedPackageMarker.module.css";

export type SeedPackageMarkerProps = {
  indicator: SeedPackageIndicator;
  position: { x: number; y: number };
  revealed: boolean;
};

export function SeedPackageMarker({ indicator, position, revealed }: SeedPackageMarkerProps) {
  const tierClass = indicator.tier ? `tier${indicator.tier}` : "";
  
  return (
    <div
      className={styles.packageMarker}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {revealed && indicator.hasPackage ? (
        <span className={`${styles.packageIcon} ${styles[tierClass]}`} title={`+${indicator.quantity} sementes`}>
          📦
        </span>
      ) : !revealed ? (
        <span className={styles.packageHint} title="Oportunidade de pacote">
          ✨
        </span>
      ) : null}
    </div>
  );
}
