import { Link } from "react-router-dom";

import type { Mascot } from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./MascotSelector.module.css";

type MascotSelectorProps = {
  mascots: Mascot[];
  selectedMascotId: string;
};

export function MascotSelector({ mascots, selectedMascotId }: MascotSelectorProps) {
  const { t } = useTranslation();

  return (
    <nav className={styles.selector} aria-label={t("mascot.chooseMascot")}>
      <p className={styles.title}>{t("mascot.myMascots")}</p>
      <div className={styles.list}>
        {mascots.map((mascot) => {
          const isSelected = mascot.id === selectedMascotId;

          return (
            <Link
              aria-current={isSelected ? "page" : undefined}
              className={isSelected ? `${styles.link} ${styles.selected}` : styles.link}
              key={mascot.id}
              to={`/mascots/${mascot.id}`}
            >
              <span className={styles.name}>{mascot.name}</span>
              <span className={styles.species}>{t(mascot.speciesKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
