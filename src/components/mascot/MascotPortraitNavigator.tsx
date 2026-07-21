import type { Mascot } from "../../game";
import { MascotPortrait } from "./MascotPortrait";
import styles from "./MascotPortraitNavigator.module.css";

type MascotPortraitNavigatorProps = {
  mascot: Mascot;
  nextLabel: string;
  previousLabel: string;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
};

export function MascotPortraitNavigator({
  mascot,
  nextLabel,
  previousLabel,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: MascotPortraitNavigatorProps) {
  return (
    <div className={styles.navigator}>
      <button
        aria-label={previousLabel}
        className={styles.arrow}
        disabled={!hasPrevious}
        type="button"
        onClick={onPrevious}
      >
        <span aria-hidden="true" className={styles.previousArrow} />
      </button>
      <MascotPortrait mascot={mascot} />
      <button
        aria-label={nextLabel}
        className={styles.arrow}
        disabled={!hasNext}
        type="button"
        onClick={onNext}
      >
        <span aria-hidden="true" className={styles.nextArrow} />
      </button>
    </div>
  );
}
