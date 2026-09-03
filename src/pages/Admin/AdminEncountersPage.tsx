import { useEffect, useState, type FormEvent } from "react";

import { SketchPanel, StampButton } from "../../components/ui";
import { useTranslation } from "../../i18n";
import {
  getEncounterAdminSettings,
  updateEncounterAdminSettings,
  type EncounterAdminSettings,
} from "../../integrations/supabase/encounterAdminSettings";
import styles from "./AdminLayout.module.css";

const defaults: EncounterAdminSettings = { radiusKm: 1000, refreshMinutes: 5, resultLimit: 5 };

export function AdminEncountersPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<EncounterAdminSettings>(defaults);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getEncounterAdminSettings()
      .then((next) => {
        setSettings(next);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const next = await updateEncounterAdminSettings({
        radiusKm: Number(form.get("radiusKm")),
        refreshMinutes: Number(form.get("refreshMinutes")),
        resultLimit: Number(form.get("resultLimit")),
      });
      setSettings(next);
      setMessage(t("adminPanel.encounters.saved"));
    } catch {
      setMessage(t("adminPanel.encounters.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <SketchPanel eyebrow={t("adminPanel.encounters.eyebrow")} title={t("adminPanel.encounters.title")}>
        <p className={styles.intro}>{t("adminPanel.encounters.description")}</p>
        {status === "loading" ? <p>{t("adminPanel.encounters.loading")}</p> : null}
        {status === "error" ? <p className={styles.error}>{t("adminPanel.encounters.error")}</p> : null}
        {status === "ready" ? (
          <form className={styles.form} onSubmit={(event) => void submit(event)}>
            <label>
              {t("adminPanel.encounters.radiusKm")}
              <input
                defaultValue={settings.radiusKm}
                max={20050}
                min={1}
                name="radiusKm"
                required
                step={1}
                type="number"
              />
            </label>
            <label>
              {t("adminPanel.encounters.refreshMinutes")}
              <input
                defaultValue={settings.refreshMinutes}
                max={1440}
                min={1}
                name="refreshMinutes"
                required
                step={1}
                type="number"
              />
            </label>
            <label>
              {t("adminPanel.encounters.resultLimit")}
              <input
                defaultValue={settings.resultLimit}
                max={50}
                min={1}
                name="resultLimit"
                required
                step={1}
                type="number"
              />
            </label>
            <StampButton disabled={busy} type="submit">
              {t("adminPanel.encounters.save")}
            </StampButton>
          </form>
        ) : null}
        {message ? (
          <p className={message === t("adminPanel.encounters.error") ? styles.error : styles.message} role="status">
            {message}
          </p>
        ) : null}
      </SketchPanel>
    </main>
  );
}
