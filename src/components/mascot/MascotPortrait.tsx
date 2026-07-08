import type { CSSProperties } from "react";

import type { Mascot } from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./MascotPortrait.module.css";

type MascotPortraitProps = {
  mascot: Mascot;
};

export function MascotPortrait({ mascot }: MascotPortraitProps) {
  const { t } = useTranslation();
  const portraitStyle = {
    "--mascot-primary": mascot.appearance.primaryColor,
    "--mascot-accent": mascot.appearance.accentColor,
  } as CSSProperties;

  return (
    <section className={styles.portrait} style={portraitStyle} aria-label={t("mascot.visualPreview")}>
      <span className={styles.postmark} aria-hidden="true" />
      <div className={styles.sheet}>
        <div className={styles.figure}>
          <span className={styles.wing} aria-hidden="true" />
          <span className={styles.mark}>{mascot.name.slice(0, 1)}</span>
          <span className={styles.badge} aria-hidden="true" />
        </div>
        <p className={styles.caption}>{t(mascot.appearance.portraitPlaceholderKey)}</p>
      </div>
    </section>
  );
}
