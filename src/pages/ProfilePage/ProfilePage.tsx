import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppBottomNav, PageShell } from "../../components/layout";
import { AssetImage, StampButton } from "../../components/ui";
import { assetKeys } from "../../game";
import { formatPostalLocationLabel } from "../../game/locationLabels";
import { useProfileProgression } from "../../game/useProfileProgression";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import {
  disablePushNotifications,
  enablePushNotifications,
  fetchPushPreferences,
  getPushSupportState,
  savePushPreferences,
  type PushPreferences,
} from "../../integrations/supabase/pushNotifications";
import styles from "./ProfilePage.module.css";

export function ProfilePage() {
  const { profile, session } = useAuth();
  const progression = useProfileProgression();
  const { locale, t } = useTranslation();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<PushPreferences | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState(false);
  const support = getPushSupportState();
  const location = profile
    ? formatPostalLocationLabel({ city: profile.postal_base_city, state: profile.postal_base_state, country: profile.postal_base_country })
    : t("common.unavailable");
  const joined = profile
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(profile.created_at))
    : t("common.unavailable");

  useEffect(() => {
    let active = true;
    void fetchPushPreferences()
      .then((value) => {
        if (active) setPreferences(value);
      })
      .catch(() => {
        if (active) setPreferences(null);
      });
    return () => {
      active = false;
    };
  }, []);

  async function toggleMaster(enabled: boolean) {
    setPushBusy(true);
    setPushError(false);
    try {
      const next = enabled
        ? await enablePushNotifications(locale)
        : await disablePushNotifications();
      setPreferences(next);
    } catch {
      setPushError(true);
    } finally {
      setPushBusy(false);
    }
  }

  async function toggleCategory(
    key: keyof Pick<
      PushPreferences,
      "correspondenceArrived" | "returnPrepRemaining" | "returnDeparted" | "readyForCollection"
    >,
    value: boolean,
  ) {
    if (!preferences) return;
    setPushBusy(true);
    setPushError(false);
    try {
      const next = await savePushPreferences({
        ...preferences,
        [key]: value,
        locale,
      });
      setPreferences(next);
    } catch {
      setPushError(true);
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <PageShell hasBottomNav>
      <main className={styles.shell}>
        <StampButton onClick={() => navigate("/nest")} variant="secondary">{t("navigation.backToNest")}</StampButton>
        <section className={styles.panel}>
          <AssetImage alt={t("nestHub.defaultAvatar")} assetKey={assetKeys.profile.defaultSilhouette} className={styles.avatar} loading="eager"><span aria-hidden="true" /></AssetImage>
          <p className={styles.eyebrow}>{t("profile.eyebrow")}</p>
          <h1>{profile?.display_name ?? t("common.unavailable")}</h1>
          <p className={styles.nestName}>{t("nestHub.nestOf")} {profile?.display_name ?? ""}</p>
          <dl>
            <div><dt>{t("profile.email")}</dt><dd>{session?.user.email ?? t("common.unavailable")}</dd></div>
            <div><dt>{t("profile.location")}</dt><dd>{location}</dd></div>
            <div><dt>{t("profile.joined")}</dt><dd>{joined}</dd></div>
            <div><dt>{t("profile.level")}</dt><dd>{progression.isLoading ? "..." : `Nível ${progression.level}`}</dd></div>
            <div><dt>{t("profile.xp")}</dt><dd>{progression.isLoading ? "..." : `${progression.xp} XP`}</dd></div>
            <div><dt>{t("profile.seeds")}</dt><dd>{progression.isLoading ? "..." : progression.seeds}</dd></div>
            <div><dt>{t("profile.crystals")}</dt><dd>0</dd></div>
          </dl>
          <p className={styles.notice}>{t("profile.readOnlyNotice")}</p>
        </section>

        <section className={styles.pushPanel} aria-labelledby="profile-push-title">
          <p className={styles.eyebrow}>{t("profile.push.title")}</p>
          <h2 id="profile-push-title">{t("profile.push.title")}</h2>
          <p className={styles.notice}>{t("profile.push.description")}</p>
          {support === "unsupported" ? <p className={styles.notice}>{t("profile.push.unsupported")}</p> : null}
          {support === "denied" ? <p className={styles.notice}>{t("profile.push.denied")}</p> : null}
          {support === "missingVapid" ? <p className={styles.notice}>{t("profile.push.missingKey")}</p> : null}
          {preferences?.enabled ? <p className={styles.notice}>{t("profile.push.enabled")}</p> : null}
          {pushError ? <p className={styles.notice} role="alert">{t("profile.push.error")}</p> : null}
          <div className={styles.pushActions}>
            <StampButton
              disabled={pushBusy || support === "unsupported" || support === "denied" || support === "missingVapid"}
              onClick={() => void toggleMaster(!(preferences?.enabled ?? false))}
              type="button"
            >
              {preferences?.enabled ? t("profile.push.disable") : t("profile.push.enable")}
            </StampButton>
          </div>
          {preferences?.enabled ? (
            <ul className={styles.pushCategories}>
              <PreferenceToggle
                checked={preferences.correspondenceArrived}
                disabled={pushBusy}
                label={t("profile.push.correspondenceArrived")}
                onChange={(value) => void toggleCategory("correspondenceArrived", value)}
              />
              <PreferenceToggle
                checked={preferences.returnPrepRemaining}
                disabled={pushBusy}
                label={t("profile.push.returnPrepRemaining")}
                onChange={(value) => void toggleCategory("returnPrepRemaining", value)}
              />
              <PreferenceToggle
                checked={preferences.returnDeparted}
                disabled={pushBusy}
                label={t("profile.push.returnDeparted")}
                onChange={(value) => void toggleCategory("returnDeparted", value)}
              />
              <PreferenceToggle
                checked={preferences.readyForCollection}
                disabled={pushBusy}
                label={t("profile.push.readyForCollection")}
                onChange={(value) => void toggleCategory("readyForCollection", value)}
              />
            </ul>
          ) : null}
        </section>
      </main>
      <AppBottomNav />
    </PageShell>
  );
}

function PreferenceToggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <li>
      <label>
        <input
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span>{label}</span>
      </label>
    </li>
  );
}
