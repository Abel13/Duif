import { useEffect, useState } from "react";

import { StampButton } from "../ui";
import { useTranslation } from "../../i18n";
import {
  disablePushNotifications,
  enablePushNotifications,
  fetchPushPreferences,
  getPushSupportState,
  savePushPreferences,
  type PushPreferences,
} from "../../integrations/supabase/pushNotifications";
import styles from "./PushNotificationSettings.module.css";

export function PushNotificationSettings() {
  const { locale, t } = useTranslation();
  const [preferences, setPreferences] = useState<PushPreferences | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState(false);
  const support = getPushSupportState();

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
    <section className={styles.panel} aria-labelledby="push-settings-title">
      <p className={styles.eyebrow}>{t("profile.push.title")}</p>
      <h2 id="push-settings-title">{t("profile.push.title")}</h2>
      <p className={styles.notice}>{t("profile.push.description")}</p>
      {support === "unsupported" ? <p className={styles.notice}>{t("profile.push.unsupported")}</p> : null}
      {support === "denied" ? <p className={styles.notice}>{t("profile.push.denied")}</p> : null}
      {support === "missingVapid" ? <p className={styles.notice}>{t("profile.push.missingKey")}</p> : null}
      {preferences?.enabled ? <p className={styles.notice}>{t("profile.push.enabled")}</p> : null}
      {pushError ? <p className={styles.notice} role="alert">{t("profile.push.error")}</p> : null}
      <div className={styles.actions}>
        <StampButton
          disabled={pushBusy || support === "unsupported" || support === "denied" || support === "missingVapid"}
          onClick={() => void toggleMaster(!(preferences?.enabled ?? false))}
          type="button"
        >
          {preferences?.enabled ? t("profile.push.disable") : t("profile.push.enable")}
        </StampButton>
      </div>
      {preferences?.enabled ? (
        <ul className={styles.categories}>
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
