import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Gauge, MoonStars, Sun, X } from "@phosphor-icons/react";
import type { TravelWeatherSummary } from "../../game/travelWeather";
import { useTranslation } from "../../i18n";
import styles from "./TravelWeatherBadge.module.css";

export function TravelWeatherBadge({ mascotName, summary }: { mascotName: string; summary: TravelWeatherSummary }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open && !dialogRef.current?.open) dialogRef.current?.showModal(); }, [open]);
  const Icon = summary.currentWeather.category === "clear" ? Sun : summary.currentWeather.category === "thunderstorm" ? CloudLightning : summary.currentWeather.category === "snow" ? CloudSnow : summary.currentWeather.category === "fogDrizzle" ? CloudFog : ["rain", "heavyFreezingRain"].includes(summary.currentWeather.category) ? CloudRain : Cloud;
  const DayIcon = summary.isDay ? Sun : MoonStars;
  const impactPercent = Math.round((summary.conditionImpactMultiplier - 1) * 100);
  const impactKind = impactPercent > 0 ? "helpful" : impactPercent < 0 ? "challenging" : "neutral";
  function backdrop(event: MouseEvent<HTMLDialogElement>) { if (event.target === event.currentTarget) dialogRef.current?.close(); }
  return <>
    <button aria-label={t("travelWeather.openDetails")} className={styles.badge} data-season={summary.season} onClick={() => setOpen(true)} title={t("travelWeather.openDetails")} type="button"><Icon aria-hidden="true" weight="duotone" /></button>
    {open ? <dialog aria-labelledby="travel-weather-title" className={styles.dialog} onClick={backdrop} onClose={() => setOpen(false)} ref={dialogRef}><article className={styles.paper} data-season={summary.season}>
      <header><div><span>{t("travelWeather.eyebrow")}</span><h2 id="travel-weather-title">{mascotName}</h2></div><button aria-label={t("travelWeather.close")} onClick={() => dialogRef.current?.close()} type="button"><X aria-hidden="true" /></button></header>
      <div className={styles.conditionGrid}><div className={styles.hero}><Icon aria-hidden="true" weight="duotone" /><strong>{t(`travelWeather.categories.${summary.currentWeather.category}`)}</strong></div><div className={styles.hero}><DayIcon aria-hidden="true" weight="duotone" /><strong>{t(summary.isDay ? "travelWeather.day" : "travelWeather.night")}</strong></div></div>
      <section className={styles.impact} data-impact={impactKind}><Gauge aria-hidden="true" weight="duotone" /><div><span>{t(`travelWeather.impacts.${impactKind}`)}</span><strong>{impactPercent > 0 ? "+" : ""}{impactPercent}%</strong><small>{t("travelWeather.conditionImpact")}</small></div></section>
      <div className={styles.speedMeter} aria-label={t("travelWeather.effectiveSpeed")}><span style={{ transform: `scaleX(${Math.min(1, summary.effectiveSpeedMultiplier / 1.25)})` }} /></div>
      <dl><div><dt>{t("travelWeather.effectiveSpeed")}</dt><dd>{Math.round(summary.effectiveSpeedMultiplier * 100)}%</dd></div><div><dt>{t("travelWeather.season")}</dt><dd>{t(`travelWeather.seasons.${summary.season}`)}</dd></div><div><dt>{t("travelWeather.segment")}</dt><dd>{summary.currentSegmentIndex + 1}/{summary.segmentCount}</dd></div></dl>
      <p>{t("travelWeather.etaNotice")}</p><small>{t(summary.currentWeather.source === "openMeteo" ? "travelWeather.attribution" : "travelWeather.virtualSource")}</small>
    </article></dialog> : null}
  </>;
}
