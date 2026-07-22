import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppBottomNav, PageShell } from "../../components/layout";
import { LetterDialog, SketchPanel, StampButton } from "../../components/ui";
import type { ReceivedLetter } from "../../game";
import { useTranslation } from "../../i18n";
import { fetchReceivedLetters } from "../../integrations/supabase/mailbox";
import styles from "./MailboxPage.module.css";

export function MailboxPage() {
  const { locale, t } = useTranslation();
  const navigate = useNavigate();
  const [letters, setLetters] = useState<ReceivedLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>();

  async function loadLetters() {
    setIsLoading(true);
    setHasError(false);
    try { setLetters(await fetchReceivedLetters()); }
    catch { setHasError(true); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { void loadLetters(); }, []);
  const selectedLetter = useMemo(
    () => letters.find((letter) => letter.deliveryId === selectedDeliveryId),
    [letters, selectedDeliveryId],
  );
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(value));

  return (
    <PageShell hasBottomNav>
      <main className={styles.shell}>
        <SketchPanel eyebrow={t("mailbox.eyebrow")} title={t("mailbox.title")}>
          <p className={styles.subtitle}>{t("mailbox.description")}</p>
        </SketchPanel>
        {isLoading ? <SketchPanel title={t("common.loading")}><p className={styles.notice}>{t("mailbox.loading")}</p></SketchPanel> : null}
        {!isLoading && hasError ? <SketchPanel title={t("common.unavailable")}><p className={styles.notice}>{t("mailbox.error")}</p><StampButton onClick={() => void loadLetters()} variant="secondary">{t("mailbox.retry")}</StampButton></SketchPanel> : null}
        {!isLoading && !hasError && letters.length === 0 ? <SketchPanel title={t("mailbox.emptyTitle")}><p className={styles.notice}>{t("mailbox.emptyDescription")}</p></SketchPanel> : null}
        {!isLoading && !hasError && letters.length > 0 ? <section aria-label={t("mailbox.letterList")} className={styles.list}>
          {letters.map((letter) => <button className={styles.letterCard} key={letter.deliveryId} type="button" onClick={() => setSelectedDeliveryId(letter.deliveryId)}>
            <span className={styles.postmark}>{t("mailbox.from")} {letter.senderName}</span>
            <strong>{letter.senderName}</strong>
            <span>{letter.originLabel} · {formatDate(letter.arrivedAt)}</span>
            <p>{letter.letterText}</p>
            <span className={styles.openLabel}>{t("mailbox.openLetter")}</span>
          </button>)}
        </section> : null}
      </main>
      <LetterDialog
        action={selectedLetter ? <StampButton onClick={() => navigate(`/send?friendId=${selectedLetter.senderProfileId}`)}>{t("mailbox.reply")}</StampButton> : undefined}
        closeLabel={t("mailbox.closeLetter")}
        dateLabel={selectedLetter ? formatDate(selectedLetter.arrivedAt) : ""}
        emptyLabel={t("mailbox.emptyLetter")}
        letterText={selectedLetter?.letterText ?? ""}
        onClose={() => setSelectedDeliveryId(undefined)}
        open={Boolean(selectedLetter)}
        senderLocation={selectedLetter?.originLabel ?? ""}
        senderName={selectedLetter?.senderName ?? ""}
        title={t("mailbox.letterTitle")}
      />
      <AppBottomNav />
    </PageShell>
  );
}
