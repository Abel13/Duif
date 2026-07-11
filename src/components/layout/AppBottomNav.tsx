import { useLocation, useNavigate } from "react-router-dom";

import { assetPaths } from "../../game";
import { useTranslation } from "../../i18n";
import { AssetImage, PaperTab } from "../ui";
import styles from "./AppBottomNav.module.css";

export function AppBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isFriendsActive = location.pathname.startsWith("/friends");
  const isInventoryActive = location.pathname.startsWith("/inventory");
  const isMapActive = location.pathname.startsWith("/map");
  const isNestActive = location.pathname.startsWith("/mascots");
  const items = [
    {
      active: isNestActive,
      icon: assetPaths.navigation.icon("nest.webp"),
      label: t("navigation.nest"),
      onClick: () => navigate("/mascots/mascot-nuvem"),
    },
    {
      active: isInventoryActive,
      icon: assetPaths.navigation.icon("collection.webp"),
      label: t("navigation.collection"),
      onClick: () => navigate("/inventory"),
    },
    {
      active: isMapActive,
      icon: assetPaths.navigation.icon("map.webp"),
      label: t("navigation.map"),
      onClick: () => navigate("/map"),
    },
    {
      active: isFriendsActive,
      icon: assetPaths.navigation.icon("friends.webp"),
      label: t("navigation.friends"),
      onClick: () => navigate("/friends"),
    },
  ];

  return (
    <nav className={styles.nav} aria-label={t("mascot.bottomNav")}>
      {items.map((item) => (
        <PaperTab
          active={item.active}
          aria-label={item.label}
          className={styles.tab}
          key={item.label}
          onClick={item.onClick}
        >
          <span className={styles.iconFrame} aria-hidden="true">
            <AssetImage
              alt=""
              className={styles.icon}
              draggable="false"
              loading="eager"
              src={item.icon}
            >
              <span className={styles.iconFallback} />
            </AssetImage>
          </span>
          <span className={styles.label}>{item.label}</span>
        </PaperTab>
      ))}
      <PaperTab
        aria-label={t("navigation.shopUnavailable")}
        className={styles.tab}
        disabled
        title={t("navigation.shopUnavailable")}
      >
        <span className={styles.iconFrame} aria-hidden="true">
          <AssetImage
            alt=""
            className={styles.icon}
            draggable="false"
            loading="eager"
            src={assetPaths.navigation.icon("shop.webp")}
          >
            <span className={styles.iconFallback} />
          </AssetImage>
        </span>
        <span className={styles.label}>{t("navigation.shop")}</span>
      </PaperTab>
    </nav>
  );
}
