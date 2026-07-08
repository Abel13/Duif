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
  } as React.CSSProperties;

  return (
    <section className={styles.portrait} style={portraitStyle} aria-label={t("mascot.visualPreview")}>
      <div className={styles.sheet}>
        <div className={styles.figure}>
          <span className={styles.mark}>{mascot.name.slice(0, 1)}</span>
        </div>
        <p className={styles.caption}>{t(mascot.appearance.portraitPlaceholderKey)}</p>
      </div>
    </section>
  );
}
