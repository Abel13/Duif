import { PaperTab } from "../ui";
import { useTranslation } from "../../i18n";
import styles from "./MascotBottomNav.module.css";

export function MascotBottomNav() {
  const { t } = useTranslation();

  return (
    <nav className={styles.nav} aria-label={t("mascot.bottomNav")}>
      <PaperTab active>{t("navigation.nest")}</PaperTab>
      <PaperTab>{t("navigation.letters")}</PaperTab>
      <PaperTab>{t("navigation.map")}</PaperTab>
      <PaperTab>{t("navigation.friends")}</PaperTab>
      <PaperTab>{t("navigation.shop")}</PaperTab>
    </nav>
  );
}
