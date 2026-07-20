import { useEffect, useId, useRef, useState } from "react";

import type { OfficialAssetKey } from "../../game";
import { AssetImage } from "./AssetImage";
import styles from "./InauguralPostcard.module.css";

export type PostcardContent = {
  title: string;
  frontAssetKey: OfficialAssetKey;
  frontAlt: string;
  message: string;
  senderName: string;
  deliveredBy: string;
  originTitle: string;
  originLabel: string;
  destinationTitle: string;
  destinationLabel: string;
  postmarkLabel?: string;
  postmarkDate?: string;
  stampAssetKey?: OfficialAssetKey;
};

type ViewerProps = {
  content: PostcardContent;
  flipLabel: string;
  frontLabel: string;
  backLabel: string;
  hint?: string;
  onFirstFlip?: () => Promise<void> | void;
};

export function PostcardViewer({ content, flipLabel, frontLabel, backLabel, hint, onFirstFlip }: ViewerProps) {
  const [back, setBack] = useState(false);
  const [showHint, setShowHint] = useState(Boolean(hint));
  async function flip() {
    const next = !back;
    setBack(next);
    if (next && showHint) { setShowHint(false); await onFirstFlip?.(); }
  }
  const hasPostmark = Boolean(content.postmarkLabel && content.postmarkDate);
  return <div className={styles.scene}>
    {showHint && hint ? <p className={styles.hint}>{hint}</p> : null}
    <button aria-label={flipLabel} aria-pressed={back} className={styles.card} data-postcard-card onClick={() => void flip()} type="button">
      <div className={`${styles.inner} ${back ? styles.backVisible : ""}`}>
        <div aria-label={frontLabel} className={`${styles.face} ${styles.front}`}>
          <AssetImage alt={content.frontAlt} assetKey={content.frontAssetKey} className={styles.art}><i /></AssetImage>
          {content.stampAssetKey ? <Stamp assetKey={content.stampAssetKey} /> : null}
          {hasPostmark ? <Postmark date={content.postmarkDate!} label={content.postmarkLabel!} /> : null}
        </div>
        <div aria-label={backLabel} className={`${styles.face} ${styles.back}`}>
          <div className={styles.message}><p>{content.message}</p></div>
          <div className={`${styles.tripDetails} ${!hasPostmark && !content.stampAssetKey ? styles.tripDetailsPlain : ""}`}>
            <strong>{content.senderName}</strong>
            <div className={styles.deliveryInfo}>{content.deliveredBy}</div>
            <dl><div><dt>{content.originTitle}</dt><dd>{content.originLabel}</dd></div><div><dt>{content.destinationTitle}</dt><dd>{content.destinationLabel}</dd></div></dl>
            {hasPostmark || content.stampAssetKey ? <div className={styles.detailMarks}>{hasPostmark ? <Postmark date={content.postmarkDate!} label={content.postmarkLabel!} /> : null}{content.stampAssetKey ? <Stamp assetKey={content.stampAssetKey} /> : null}</div> : null}
          </div>
        </div>
      </div>
    </button>
  </div>;
}

function Stamp({ assetKey }: { assetKey: OfficialAssetKey }) { return <AssetImage alt="" assetKey={assetKey} className={styles.seal}><i /></AssetImage>; }
function Postmark({ date, label }: { date: string; label: string }) { return <span className={styles.postmark}><span aria-hidden="true" className={styles.cancelLines}><i /><i /><i /></span><span className={styles.postmarkRing}><b>{label}</b><span aria-hidden="true" className={styles.postmarkMark} /><em>{date}</em></span></span>; }

type DialogProps = ViewerProps & { open: boolean; onClose: () => void; closeLabel: string };

export function PostcardDialog({ open, onClose, closeLabel, content, ...viewerProps }: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) { element.showModal(); requestAnimationFrame(() => element.querySelector<HTMLButtonElement>("[data-postcard-card]")?.focus()); }
    if (!open && element.open) element.close();
  }, [open]);
  return <dialog aria-labelledby={titleId} className={styles.dialog} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} ref={dialog}>
    <div className={styles.dialogBody}><button className={styles.close} onClick={onClose} type="button">{closeLabel}</button><h2 id={titleId}>{content.title}</h2><PostcardViewer content={content} {...viewerProps} /></div>
  </dialog>;
}
