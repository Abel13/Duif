import { useEffect, useId, useRef, useState } from "react";

import { assetKeys } from "../../game";
import { useTranslation } from "../../i18n";
import { AssetImage } from "./AssetImage";
import styles from "./InauguralPostcard.module.css";

type Props = { completionAt?: string | null; hintSeen?: boolean; mascotName?: string; senderNickname?: string; onFirstFlip?: () => Promise<void> | void };

export function formatInauguralPostmark(value: string | null | undefined, locale: "pt-BR" | "en-US") {
  const date = value ? new Date(value) : undefined;
  return date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date)
    : "—";
}

export function InauguralPostcard({ completionAt, hintSeen = false, mascotName, senderNickname, onFirstFlip }: Props) {
  const { locale, t } = useTranslation();
  const [back, setBack] = useState(false); const [hint, setHint] = useState(!hintSeen);
  const date = formatInauguralPostmark(completionAt, locale);
  async function flip() { const next = !back; setBack(next); if (next && hint) { setHint(false); await onFirstFlip?.(); } }
  return <div className={styles.scene}>
    {hint && <p className={styles.hint}>{t("tutorial.postcard.flipHint")}</p>}
    <button aria-label={t("tutorial.postcard.flip")} aria-pressed={back} className={styles.card} onClick={() => void flip()} type="button">
      <span className={`${styles.inner} ${back ? styles.backVisible : ""}`}>
        <span className={`${styles.face} ${styles.front}`} aria-label={t("tutorial.postcard.front")}>
          <AssetImage alt={t("tutorial.rewards.inauguralPostcard.name")} assetKey={assetKeys.postcards.inauguralFront} className={styles.art}><i /></AssetImage>
          <Seal /><Postmark date={date} />
        </span>
        <span className={`${styles.face} ${styles.back}`} aria-label={t("tutorial.postcard.back")}>
          <span className={styles.message}><p>{t("tutorial.postcard.backMessage")}</p></span>
          <span className={styles.tripDetails}>
            <strong>{senderNickname ?? t("tutorial.eyebrow")}</strong>
            <span className={styles.deliveryInfo}>{t("tutorial.postcard.deliveredBy")} <b>{mascotName ?? t("common.unavailable")}</b></span>
            <dl><div><dt>{t("mascot.origin")}</dt><dd>{t("tutorial.locations.nest")}</dd></div><div><dt>{t("mascot.destination")}</dt><dd>{t("tutorial.locations.station")}</dd></div></dl>
            <span className={styles.detailMarks}><Postmark date={date} /><Seal /></span>
          </span>
        </span>
      </span>
    </button>
  </div>;
}

function Seal() { return <AssetImage alt="" assetKey={assetKeys.collectibles.firstJourneyStamp} className={styles.seal}><i /></AssetImage>; }
function Postmark({ date }: { date: string }) { const { t } = useTranslation(); return <span className={styles.postmark}><span aria-hidden="true" className={styles.cancelLines}><i /><i /><i /></span><span className={styles.postmarkRing}><b>{t("tutorial.postcard.postmark")}</b><span aria-hidden="true" className={styles.postmarkMark} /><em>{date}</em></span></span>; }

export function InauguralPostcardDialog({ open, onClose, ...props }: Props & { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null); const cardId = useId();
  const { t } = useTranslation();
  useEffect(() => { const element = dialog.current; if (!element) return; if (open && !element.open) { element.showModal(); requestAnimationFrame(() => element.querySelector<HTMLButtonElement>("button")?.focus()); } if (!open && element.open) element.close(); }, [open]);
  return <dialog aria-labelledby={cardId} className={styles.dialog} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} ref={dialog}>
    <div className={styles.dialogBody}><button className={styles.close} onClick={onClose} type="button">{t("tutorial.postcard.close")}</button><h2 id={cardId}>{t("tutorial.rewards.inauguralPostcard.name")}</h2><InauguralPostcard {...props} /></div>
  </dialog>;
}
