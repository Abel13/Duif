import { useEffect, useId, useRef, useState } from "react";

import { assetKeys } from "../../game";
import { useTranslation, type TranslationKey } from "../../i18n";
import { AssetImage } from "./AssetImage";
import type { PostcardContent } from "./PostcardViewer";
import styles from "./InauguralPostcard.module.css";

type Props = { completionAt?: string | null; hintSeen?: boolean; mascotName?: string; senderNickname?: string; onFirstFlip?: () => Promise<void> | void };

export function formatInauguralPostmark(value: string | null | undefined, locale: "pt-BR" | "en-US") {
  const date = value ? new Date(value) : undefined;
  return date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date)
    : "—";
}

export function createInauguralPostcardContent({ completionAt, mascotName, senderNickname, locale, t }: Props & { locale: "pt-BR" | "en-US"; t: (key: TranslationKey) => string }): PostcardContent {
  return {
    title: t("tutorial.rewards.inauguralPostcard.name"),
    frontAssetKey: assetKeys.postcards.inauguralFront,
    frontAlt: t("tutorial.rewards.inauguralPostcard.name"),
    message: t("tutorial.postcard.backMessage"),
    senderName: senderNickname ?? t("tutorial.eyebrow"),
    deliveredBy: `${t("tutorial.postcard.deliveredBy")} ${mascotName ?? t("common.unavailable")}`,
    originTitle: t("mascot.origin"),
    originLabel: t("tutorial.locations.nest"),
    destinationTitle: t("mascot.destination"),
    destinationLabel: t("tutorial.locations.station"),
    postmarkLabel: t("tutorial.postcard.postmark"),
    postmarkDate: formatInauguralPostmark(completionAt, locale),
    stampAssetKey: assetKeys.collectibles.firstJourneyStamp,
  };
}

export function InauguralPostcard(props: Props) {
  const { locale, t } = useTranslation();
  const [back, setBack] = useState(false);
  const [hint, setHint] = useState(!props.hintSeen);
  const date = formatInauguralPostmark(props.completionAt, locale);
  async function flip() {
    const next = !back;
    setBack(next);
    if (next && hint) {
      setHint(false);
      await props.onFirstFlip?.();
    }
  }
  return <div className={styles.scene}>
    {hint ? <p className={styles.hint}>{t("tutorial.postcard.flipHint")}</p> : null}
    <button aria-label={t("tutorial.postcard.flip")} aria-pressed={back} className={styles.card} data-postcard-card onClick={() => void flip()} type="button">
      <span className={`${styles.inner} ${back ? styles.backVisible : ""}`}>
        <span aria-label={t("tutorial.postcard.front")} className={`${styles.face} ${styles.front}`}>
          <AssetImage alt={t("tutorial.rewards.inauguralPostcard.name")} assetKey={assetKeys.postcards.inauguralFront} className={styles.art}><i /></AssetImage>
          <Seal /><Postmark date={date} label={t("tutorial.postcard.postmark")} />
        </span>
        <span aria-label={t("tutorial.postcard.back")} className={`${styles.face} ${styles.back}`}>
          <span className={styles.message}><p>{t("tutorial.postcard.backMessage")}</p></span>
          <span className={styles.tripDetails}>
            <strong>{props.senderNickname ?? t("tutorial.eyebrow")}</strong>
            <span className={styles.deliveryInfo}>{t("tutorial.postcard.deliveredBy")} <b>{props.mascotName ?? t("common.unavailable")}</b></span>
            <dl><div><dt>{t("mascot.origin")}</dt><dd>{t("tutorial.locations.nest")}</dd></div><div><dt>{t("mascot.destination")}</dt><dd>{t("tutorial.locations.station")}</dd></div></dl>
            <span className={styles.detailMarks}><Postmark date={date} label={t("tutorial.postcard.postmark")} /><Seal /></span>
          </span>
        </span>
      </span>
    </button>
  </div>;
}

export function InauguralPostcardDialog({ open, onClose, ...props }: Props & { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { t } = useTranslation();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      requestAnimationFrame(() => element.querySelector<HTMLButtonElement>("[data-postcard-card]")?.focus());
    }
    if (!open && element.open) element.close();
  }, [open]);
  return <dialog aria-labelledby={titleId} className={styles.dialog} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} ref={dialog}>
    <div className={styles.dialogBody}><button className={styles.close} onClick={onClose} type="button">{t("tutorial.postcard.close")}</button><h2 id={titleId}>{t("tutorial.rewards.inauguralPostcard.name")}</h2><InauguralPostcard {...props} /></div>
  </dialog>;
}

function Seal() { return <AssetImage alt="" assetKey={assetKeys.collectibles.firstJourneyStamp} className={styles.seal}><i /></AssetImage>; }
function Postmark({ date, label }: { date: string; label: string }) { return <span className={styles.postmark}><span aria-hidden="true" className={styles.cancelLines}><i /><i /><i /></span><span className={styles.postmarkRing}><b>{label}</b><span aria-hidden="true" className={styles.postmarkMark} /><em>{date}</em></span></span>; }
