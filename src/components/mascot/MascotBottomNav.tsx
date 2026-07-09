import { useLocation, useNavigate } from "react-router-dom";

import { PaperTab } from "../ui";
import { useTranslation } from "../../i18n";
import styles from "./MascotBottomNav.module.css";

export function MascotBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isFriendsActive = location.pathname.startsWith("/friends");
  const isInventoryActive = location.pathname.startsWith("/inventory");
  const isNestActive = location.pathname.startsWith("/mascots");

  return (
    <nav className={styles.nav} aria-label={t("mascot.bottomNav")}>
      <PaperTab active={isNestActive} onClick={() => navigate("/mascots/mascot-nuvem")}>
        {t("navigation.nest")}
      </PaperTab>
      <PaperTab active={isInventoryActive} onClick={() => navigate("/inventory")}>
        {t("navigation.letters")}
      </PaperTab>
      <PaperTab>{t("navigation.map")}</PaperTab>
      <PaperTab active={isFriendsActive} onClick={() => navigate("/friends")}>
        {t("navigation.friends")}
      </PaperTab>
      <PaperTab>{t("navigation.shop")}</PaperTab>
    </nav>
  );
}
