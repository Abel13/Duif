import { useEffect, useRef, type ReactNode } from "react";

import styles from "./LetterDialog.module.css";

export type LetterDialogProps = {
  action?: ReactNode;
  dateLabel: string;
  letterText: string;
  onClose: () => void;
  open: boolean;
  senderLocation: string;
  senderName: string;
  title: string;
  closeLabel: string;
  emptyLabel: string;
};

/** A reusable postal-paper reader for authored letters. */
export function LetterDialog({
  action,
  closeLabel,
  dateLabel,
  emptyLabel,
  letterText,
  onClose,
  open,
  senderLocation,
  senderName,
  title,
}: LetterDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => closeRef.current?.focus());
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const bodyOverflow = document.body.style.overflow;
    const documentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = documentOverflow;
    };
  }, [open]);

  return (
    <dialog
      aria-labelledby="letter-dialog-title"
      className={styles.dialog}
      ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className={styles.body}>
        <button className={styles.close} ref={closeRef} type="button" onClick={onClose}>{closeLabel}</button>
        <article className={styles.paper}>
          <header>
            <p>{senderLocation} · {dateLabel}</p>
            <h2 className={styles.visuallyHidden} id="letter-dialog-title">{title}</h2>
          </header>
          <p className={styles.text}>{letterText || emptyLabel}</p>
          <footer>{senderName}</footer>
        </article>
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
    </dialog>
  );
}
