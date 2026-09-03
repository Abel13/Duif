import { useEffect, useState } from "react";

import { SketchPanel, StampButton } from "../../components/ui";
import { useTranslation } from "../../i18n";
import {
  listGeoNamesRefreshes,
  startGeoNamesRefresh,
  type GeoNamesRefreshSummary,
} from "../../integrations/supabase/assetStudio";
import styles from "../AssetStudioPage/AssetStudioPage.module.css";

export function GeoNamesAdminPage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<GeoNamesRefreshSummary>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function refresh() {
    setStatus("loading");
    try {
      setSummary(await listGeoNamesRefreshes());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function startRefresh() {
    setBusy(true);
    setMessage("");
    try {
      await startGeoNamesRefresh();
      setMessage(t("geonamesAdmin.refreshStarted"));
      setConfirming(false);
      await refresh();
    } catch {
      setMessage(t("assetStudio.error"));
    } finally {
      setBusy(false);
    }
  }

  const statusLabel = (value: string) =>
    t(`geonamesAdmin.${value}` as "geonamesAdmin.queued" | "geonamesAdmin.running" | "geonamesAdmin.failed" | "geonamesAdmin.succeeded");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span>{t("geonamesAdmin.eyebrow")}</span>
        <h1>{t("geonamesAdmin.title")}</h1>
        <p>{t("geonamesAdmin.description")}</p>
      </header>
      <SketchPanel eyebrow={t("geonamesAdmin.eyebrow")} title={t("geonamesAdmin.title")}>
        <div className={styles.geo}>
          {status === "loading" ? <p>{t("assetStudio.loading")}</p> : null}
          {status === "error" ? <p>{t("assetStudio.error")}</p> : null}
          {status === "ready" ? (
            <>
              <p>
                <strong>{summary?.activeCityCount ?? 0}</strong> {t("geonamesAdmin.activeCities")}
              </p>
              <p>
                {summary?.latestSuccess
                  ? `${t("geonamesAdmin.latestSuccess")}: ${new Date(summary.latestSuccess.completed_at ?? summary.latestSuccess.created_at).toLocaleString()}`
                  : t("geonamesAdmin.noSuccess")}
              </p>
              {confirming ? (
                <div className={styles.confirm}>
                  <strong>{t("geonamesAdmin.confirmTitle")}</strong>
                  <p>{t("geonamesAdmin.confirmDescription")}</p>
                  <div>
                    <StampButton disabled={busy} onClick={() => void startRefresh()}>
                      {t("geonamesAdmin.confirm")}
                    </StampButton>
                    <StampButton disabled={busy} onClick={() => setConfirming(false)} variant="secondary">
                      {t("geonamesAdmin.cancel")}
                    </StampButton>
                  </div>
                </div>
              ) : (
                <StampButton
                  disabled={busy || summary?.jobs.some((job) => job.status === "queued" || job.status === "running")}
                  onClick={() => setConfirming(true)}
                >
                  {t("geonamesAdmin.refresh")}
                </StampButton>
              )}
              <h2>{t("geonamesAdmin.history")}</h2>
              <ul className={styles.geoHistory}>
                {summary?.jobs.map((job) => (
                  <li key={job.id}>
                    <strong>{statusLabel(job.status)}</strong>
                    <span>{new Date(job.created_at).toLocaleString()}</span>
                    <small>
                      {job.processed_city_count} {t("geonamesAdmin.processed")} · {job.imported_city_count}{" "}
                      {t("geonamesAdmin.imported")} · {job.updated_city_count} {t("geonamesAdmin.updated")} ·{" "}
                      {job.archived_city_count} {t("geonamesAdmin.archived")}
                    </small>
                    {job.safe_error_code ? <small>{t("assetStudio.error")}</small> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {message ? (
            <p className={styles.message} role="status">
              {message}
            </p>
          ) : null}
        </div>
      </SketchPanel>
    </main>
  );
}
