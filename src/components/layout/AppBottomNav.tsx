import { useLocation, useNavigate } from "react-router-dom";

import { assetKeys, type OfficialAssetKey } from "../../game";
import { useTranslation } from "../../i18n";
import { useReferrals } from "../../integrations/supabase/useReferrals";
import { AssetImage, PaperTab } from "../ui";
import styles from "./AppBottomNav.module.css";

export function AppBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { progress: referralProgress } = useReferrals();
  const isFriendsActive = location.pathname.startsWith("/friends");
  const isInventoryActive = location.pathname.startsWith("/inventory");
  const isMapActive = location.pathname.startsWith("/map");
  const isNestActive = location.pathname.startsWith("/nest") || location.pathname.startsWith("/profile") || location.pathname.startsWith("/mascots");
  const isShopActive = location.pathname.startsWith("/shop");
  const items = [
    {
      active: isNestActive,
      attention: false,
      icon: assetKeys.navigation.nest,
      label: t("navigation.nest"),
      onClick: () => navigate("/nest"),
    },
    {
      active: isInventoryActive,
      attention: false,
      icon: assetKeys.navigation.collection,
      label: t("navigation.collection"),
      onClick: () => navigate("/inventory"),
    },
    {
      active: isMapActive,
      attention: false,
      icon: assetKeys.navigation.map,
      label: t("navigation.map"),
      onClick: () => navigate("/map"),
    },
    {
      active: isFriendsActive,
      icon: assetKeys.navigation.friends,
      label: t("navigation.friends"),
      attention: referralProgress.owlStatus === "pending",
      onClick: () => navigate(referralProgress.owlStatus === "pending" ? "/friends?mode=invite" : "/friends"),
    },
    {
      active: isShopActive,
      attention: false,
      icon: assetKeys.navigation.shop,
      label: t("navigation.shop"),
      onClick: () => navigate("/shop"),
    },
  ];

  return (
    <nav className={styles.nav} aria-label={t("mascot.bottomNav")}>
      {items.map((item) => (
        <PaperTab
          active={item.active}
          aria-label={item.attention ? `${item.label}. ${t("navigation.referralRewardAvailable")}` : item.label}
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
              assetKey={item.icon as OfficialAssetKey}
            >
              <span className={styles.iconFallback} />
            </AssetImage>
            {item.attention ? <span className={styles.attention} /> : null}
          </span>
          <span className={styles.label}>{item.label}</span>
        </PaperTab>
      ))}
    </nav>
  );
}
