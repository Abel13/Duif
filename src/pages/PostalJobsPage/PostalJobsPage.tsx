import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageShell } from "../../components/layout";
import { AssetImage, StampButton } from "../../components/ui";
import { assetKeys } from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { type TranslationKey, useTranslation } from "../../i18n";
import { acceptPostalJobOffer, dispatchPostalJob, fetchPostalJobOffer, replacePostalJobOffer } from "../../integrations/supabase/postalJobs";
import { initialPostalJobOfferStates, markPostalJobOfferFailed, markPostalJobOfferLoading, markPostalJobOfferReady, type PostalJobOfferStates } from "./postalJobOfferState";
import styles from "./PostalJobsPage.module.css";

export function PostalJobsPage() {
  const { mascots, isLoading } = useMascotCatalog();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [offerStates, setOfferStates] = useState<PostalJobOfferStates>({});
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setOfferStates(initialPostalJobOfferStates(mascots.map((mascot) => mascot.id)));
    for (const mascot of mascots) {
      void fetchPostalJobOffer(mascot.id).then((offer) => {
        if (!cancelled) setOfferStates((current) => markPostalJobOfferReady(current, mascot.id, offer));
      }).catch(() => {
        if (!cancelled) setOfferStates((current) => markPostalJobOfferFailed(current, mascot.id));
      });
    }
    return () => { cancelled = true; };
  }, [mascots]);

  async function retry(mascotId: string) {
    setOfferStates((current) => markPostalJobOfferLoading(current, mascotId));
    try {
      const offer = await fetchPostalJobOffer(mascotId);
      setOfferStates((current) => markPostalJobOfferReady(current, mascotId, offer));
    } catch {
      setOfferStates((current) => markPostalJobOfferFailed(current, mascotId));
    }
  }

  async function replace(mascotId: string) {
    setBusy(mascotId); setError(false);
    try {
      const offer = await replacePostalJobOffer(mascotId);
      setOfferStates((current) => markPostalJobOfferReady(current, mascotId, offer));
    } catch { setError(true); } finally { setBusy(undefined); }
  }

  async function accept(mascotId: string, offerId: string) {
    setBusy(mascotId); setError(false);
    try {
      await acceptPostalJobOffer(offerId);
      setOfferStates((current) => {
        const state = current[mascotId];
        if (state?.status !== "ready") return current;
        return { ...current, [mascotId]: { status: "ready", offer: { ...state.offer, offer: { ...state.offer.offer, status: "accepted" } } } };
      });
    } catch { setError(true); } finally { setBusy(undefined); }
  }

  async function dispatch(mascotId: string, offerId: string) {
    setBusy(mascotId); setError(false);
    try {
      const delivery = await dispatchPostalJob(offerId);
      navigate(`/map?mascotId=${mascotId}&deliveryId=${delivery.id}`);
    } catch { setError(true); } finally { setBusy(undefined); }
  }

  return <PageShell><main className={styles.page}>
    <header><AssetImage alt={t("postalJobs.artworkAlt")} assetKey={assetKeys.jobs.postalBoard} className={styles.artwork} loading="eager"><i /></AssetImage><span>{t("postalJobs.eyebrow")}</span><h1>{t("postalJobs.title")}</h1><p>{t("postalJobs.description")}</p></header>
    {isLoading ? <p>{t("common.loading")}</p> : <section className={styles.list}>{mascots.map((mascot) => {
      const state = offerStates[mascot.id] ?? { status: "loading" };
      const job = state.status === "ready" ? state.offer : undefined;
      return <article className={styles.job} key={mascot.id}>
        <p>{mascot.name}</p>
        {state.status === "error" ? <div><p className={styles.error}>{t("common.loadError")}</p><StampButton onClick={() => void retry(mascot.id)} variant="secondary">{t("common.retry")}</StampButton></div> : job ? <>
          <h2>{t(job.template.title_key as TranslationKey)}</h2><p>{t(job.template.description_key as TranslationKey)}</p>
          <dl><div><dt>{t("postalJobs.distance")}</dt><dd>{job.template.min_distance_km}–{job.template.max_distance_km} km</dd></div><div><dt>{t("postalJobs.cargo")}</dt><dd>{job.template.cargo_slots}</dd></div><div><dt>{t("postalJobs.seeds")}</dt><dd>{job.template.seed_reward}</dd></div><div><dt>{t("postalJobs.xp")}</dt><dd>{job.template.mascot_xp}</dd></div></dl>
          {job.offer.status === "accepted" ? <StampButton disabled={busy === mascot.id || Boolean(mascot.currentDelivery)} onClick={() => void dispatch(mascot.id, job.offer.id)}>{t("postalJobs.depart")}</StampButton> : <div className={styles.actions}><StampButton disabled={busy === mascot.id || Boolean(mascot.currentDelivery)} onClick={() => void accept(mascot.id, job.offer.id)}>{t("postalJobs.accept")}</StampButton><StampButton disabled={busy === mascot.id || job.replacementsRemaining === 0} onClick={() => void replace(mascot.id)} variant="secondary">{t("postalJobs.replace")} ({job.replacementsRemaining})</StampButton></div>}
        </> : <p>{t("common.loading")}</p>}
      </article>;
    })}</section>}
    {error ? <p className={styles.error}>{t("postalJobs.error")}</p> : null}
  </main></PageShell>;
}
