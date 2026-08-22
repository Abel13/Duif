import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageShell } from "../../components/layout";
import { AssetImage, StampButton } from "../../components/ui";
import { assetKeys } from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { type TranslationKey, useTranslation } from "../../i18n";
import { acceptPostalJobOffer, dispatchPostalJob, fetchPostalJobOffer, replacePostalJobOffer, type PostalJobOffer } from "../../integrations/supabase/postalJobs";
import styles from "./PostalJobsPage.module.css";

export function PostalJobsPage() {
  const { mascots, isLoading } = useMascotCatalog();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Record<string, PostalJobOffer>>({});
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState(false);

  useEffect(() => { void Promise.all(mascots.map(async (mascot) => [mascot.id, await fetchPostalJobOffer(mascot.id)] as const)).then((entries) => setOffers(Object.fromEntries(entries))).catch(() => setError(true)); }, [mascots]);
  async function replace(mascotId: string) { setBusy(mascotId); setError(false); try { const next = await replacePostalJobOffer(mascotId); setOffers((current) => ({ ...current, [mascotId]: next })); } catch { setError(true); } finally { setBusy(undefined); } }
  async function accept(mascotId: string, offerId: string) { setBusy(mascotId); setError(false); try { await acceptPostalJobOffer(offerId); setOffers((current) => ({ ...current, [mascotId]: { ...current[mascotId], offer: { ...current[mascotId].offer, status: "accepted" } } })); } catch { setError(true); } finally { setBusy(undefined); } }
  async function dispatch(mascotId: string, offerId: string) { setBusy(mascotId); setError(false); try { const delivery = await dispatchPostalJob(offerId); navigate(`/map?mascotId=${mascotId}&deliveryId=${delivery.id}`); } catch { setError(true); } finally { setBusy(undefined); } }
  return <PageShell><main className={styles.page}><header><AssetImage alt={t("postalJobs.artworkAlt")} assetKey={assetKeys.jobs.postalBoard} className={styles.artwork} loading="eager"><i /></AssetImage><span>{t("postalJobs.eyebrow")}</span><h1>{t("postalJobs.title")}</h1><p>{t("postalJobs.description")}</p></header>{isLoading ? <p>{t("common.loading")}</p> : <section className={styles.list}>{mascots.map((mascot) => { const job = offers[mascot.id]; return <article className={styles.job} key={mascot.id}><p>{mascot.name}</p>{job ? <><h2>{t(job.template.title_key as TranslationKey)}</h2><p>{t(job.template.description_key as TranslationKey)}</p><dl><div><dt>{t("postalJobs.distance")}</dt><dd>{job.template.min_distance_km}–{job.template.max_distance_km} km</dd></div><div><dt>{t("postalJobs.cargo")}</dt><dd>{job.template.cargo_slots}</dd></div><div><dt>{t("postalJobs.seeds")}</dt><dd>{job.template.seed_reward}</dd></div><div><dt>{t("postalJobs.xp")}</dt><dd>{job.template.mascot_xp}</dd></div></dl>{job.offer.status === "accepted" ? <StampButton disabled={busy === mascot.id || Boolean(mascot.currentDelivery)} onClick={() => void dispatch(mascot.id, job.offer.id)}>{t("postalJobs.depart")}</StampButton> : <div className={styles.actions}><StampButton disabled={busy === mascot.id || Boolean(mascot.currentDelivery)} onClick={() => void accept(mascot.id, job.offer.id)}>{t("postalJobs.accept")}</StampButton><StampButton disabled={busy === mascot.id || job.replacementsRemaining === 0} onClick={() => void replace(mascot.id)} variant="secondary">{t("postalJobs.replace")} ({job.replacementsRemaining})</StampButton></div>}</> : <p>{t("common.loading")}</p>}</article>; })}</section>}{error ? <p className={styles.error}>{t("postalJobs.error")}</p> : null}</main></PageShell>;
}
