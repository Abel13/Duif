import { useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "../../i18n";
import { PaperTab } from "../ui";
import styles from "./AppBottomNav.module.css";

export function AppBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isFriendsActive = location.pathname.startsWith("/friends");
  const isInventoryActive = location.pathname.startsWith("/inventory");
  const isMapActive = location.pathname.startsWith("/map");
  const isNestActive = location.pathname.startsWith("/mascots");

  return (
    <nav className={styles.nav} aria-label={t("mascot.bottomNav")}>
      <PaperTab active={isNestActive} className={styles.tab} onClick={() => navigate("/mascots/mascot-nuvem")}>
        {t("navigation.nest")}
      </PaperTab>
      <PaperTab active={isInventoryActive} className={styles.tab} onClick={() => navigate("/inventory")}>
        {t("navigation.letters")}
      </PaperTab>
      <PaperTab active={isMapActive} className={styles.tab} onClick={() => navigate("/map")}>
        {t("navigation.map")}
      </PaperTab>
      <PaperTab active={isFriendsActive} className={styles.tab} onClick={() => navigate("/friends")}>
        {t("navigation.friends")}
      </PaperTab>
      <PaperTab
        aria-label={t("navigation.shopUnavailable")}
        className={styles.tab}
        disabled
        title={t("navigation.shopUnavailable")}
      >
        {t("navigation.shop")}
      </PaperTab>
    </nav>
  );
}
