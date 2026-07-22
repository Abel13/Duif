import { useNavigate } from "react-router-dom";

import { AppBottomNav, PageShell } from "../../components/layout";
import { AssetImage, StampButton } from "../../components/ui";
import { assetKeys } from "../../game";
import { formatPostalLocationLabel } from "../../game/locationLabels";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import styles from "./ProfilePage.module.css";

export function ProfilePage() {
  const { profile, session } = useAuth();
  const { locale, t } = useTranslation();
  const navigate = useNavigate();
  const location = profile ? formatPostalLocationLabel({ city: profile.postal_base_city, state: profile.postal_base_state, country: profile.postal_base_country }) : t("common.unavailable");
  const joined = profile ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(profile.created_at)) : t("common.unavailable");
  return <PageShell hasBottomNav><main className={styles.shell}><StampButton onClick={() => navigate("/nest")} variant="secondary">{t("navigation.backToNest")}</StampButton><section className={styles.panel}><AssetImage alt={t("nestHub.defaultAvatar")} assetKey={assetKeys.profile.defaultSilhouette} className={styles.avatar} loading="eager"><span aria-hidden="true" /></AssetImage><p className={styles.eyebrow}>{t("profile.eyebrow")}</p><h1>{profile?.display_name ?? t("common.unavailable")}</h1><p className={styles.nestName}>{t("nestHub.nestOf")} {profile?.display_name ?? ""}</p><dl><div><dt>{t("profile.email")}</dt><dd>{session?.user.email ?? t("common.unavailable")}</dd></div><div><dt>{t("profile.location")}</dt><dd>{location}</dd></div><div><dt>{t("profile.joined")}</dt><dd>{joined}</dd></div><div><dt>{t("profile.level")}</dt><dd>{t("nestHub.levelZero")}</dd></div><div><dt>{t("profile.xp")}</dt><dd>{t("nestHub.xpZero")}</dd></div><div><dt>{t("profile.stamps")}</dt><dd>0</dd></div><div><dt>{t("profile.crystals")}</dt><dd>0</dd></div></dl><p className={styles.notice}>{t("profile.readOnlyNotice")}</p></section></main><AppBottomNav /></PageShell>;
}
