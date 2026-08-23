import { useEffect, useMemo, useState } from "react";
import { AppBottomNav, PageShell } from "../../components/layout";
import { LetterDialog, PostcardDialog, SketchPanel, StampButton } from "../../components/ui";
import type { ReceivedCorrespondence } from "../../game";
import { useTranslation } from "../../i18n";
import { confirmReturnReply, fetchReceivedCorrespondence, openReceivedCorrespondence } from "../../integrations/supabase/mailbox";
import styles from "./MailboxPage.module.css";

export function MailboxPage() {
  const { locale, t } = useTranslation();
  const [items, setItems] = useState<ReceivedCorrespondence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>();
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  async function load() { setIsLoading(true); setHasError(false); try { setItems(await fetchReceivedCorrespondence()); } catch { setHasError(true); } finally { setIsLoading(false); } }
  useEffect(() => { void load(); }, []);
  const selected = useMemo(() => items.find((item) => itemKey(item) === selectedKey), [items, selectedKey]);
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(value));
  async function selectItem(item: ReceivedCorrespondence) { setHasError(false); try { const opened = item.isOpened ? item : await openReceivedCorrespondence(item.deliveryId, item.direction); setItems((current) => current.map((candidate) => itemKey(candidate) === itemKey(opened) ? opened : candidate)); setSelectedKey(itemKey(opened)); } catch { setHasError(true); } }
  async function sendReply() { if (!selected || isReplying || !replyText.trim()) return; setIsReplying(true); setHasError(false); try { await confirmReturnReply(selected.deliveryId, replyText); setItems((current) => current.map((item) => itemKey(item) === itemKey(selected) ? { ...item, returnReplyConfirmed: true } : item)); setReplyText(""); } catch { setHasError(true); } finally { setIsReplying(false); } }
  const canReply = Boolean(selected?.direction === "outbound" && !selected.returnReplyConfirmed && selected.returnReplyDeadline && new Date(selected.returnReplyDeadline).getTime() >= Date.now());

  return <PageShell hasBottomNav>
    <main className={styles.shell}>
      <SketchPanel eyebrow={t("mailbox.eyebrow")} title={t("mailbox.title")}><p className={styles.subtitle}>{t("mailbox.description")}</p></SketchPanel>
      {isLoading ? <SketchPanel title={t("common.loading")}><p className={styles.notice}>{t("mailbox.loading")}</p></SketchPanel> : null}
      {!isLoading && hasError ? <SketchPanel title={t("common.unavailable")}><p className={styles.notice}>{t("mailbox.error")}</p><StampButton onClick={() => void load()} variant="secondary">{t("mailbox.retry")}</StampButton></SketchPanel> : null}
      {!isLoading && !hasError && items.length === 0 ? <SketchPanel title={t("mailbox.emptyTitle")}><p className={styles.notice}>{t("mailbox.emptyDescription")}</p></SketchPanel> : null}
      {!isLoading && items.length > 0 ? <section aria-label={t("mailbox.letterList")} className={styles.list}>{items.map((item) => <button className={`${styles.letterCard} ${item.correspondenceType === "letter" ? styles.envelopeCard : ""}`} key={itemKey(item)} type="button" onClick={() => void selectItem(item)}>{item.correspondenceType === "letter" ? <span aria-hidden="true" className={styles.envelope}><i /></span> : null}<span className={styles.postmark}>{item.isOpened ? `${t("mailbox.from")} ${item.senderName}` : t("mailbox.surpriseSender")}</span><strong>{item.isOpened ? correspondenceTitle(item, t) : t("mailbox.surpriseTitle")}</strong><span>{formatDate(item.arrivedAt)}</span><p>{item.isOpened ? correspondencePreview(item, t) : t("mailbox.surpriseDescription")}</p>{returnWindowMinutes(item) !== undefined ? <span>{returnWindowMinutes(item)} min · {t("mailbox.returnWindowRemaining")}</span> : null}<span className={styles.openLabel}>{t("mailbox.openLetter")}</span></button>)}</section> : null}
    </main>
    {selected?.correspondenceType === "letter" ? <LetterDialog action={canReply ? <ReplyComposer text={replyText} disabled={isReplying} onChange={setReplyText} onSend={() => void sendReply()} /> : selected.returnReplyConfirmed ? <p>{t("mailbox.returnReplyConfirmed")}</p> : undefined} closeLabel={t("mailbox.closeLetter")} dateLabel={formatDate(selected.arrivedAt)} emptyLabel={t("mailbox.emptyLetter")} letterText={selected.letterText ?? ""} onClose={() => setSelectedKey(undefined)} open senderLocation={selected.originLabel ?? ""} senderName={selected.senderName ?? ""} title={t("mailbox.letterTitle")} /> : null}
    {selected?.correspondenceType === "postcard" && selected.postcardAssetKey ? <PostcardDialog backLabel={t("tutorial.postcard.back")} closeLabel={t("mailbox.closeLetter")} content={{ title: correspondenceTitle(selected, t), frontAssetKey: selected.postcardAssetKey, frontAlt: correspondenceTitle(selected, t), message: correspondencePreview(selected, t), senderName: selected.senderName ?? "", deliveredBy: `${t("mailbox.from")} ${selected.senderName ?? ""}`, originTitle: t("mailbox.from"), originLabel: selected.originLabel ?? t("common.unavailable"), destinationTitle: t("mailbox.open"), destinationLabel: formatDate(selected.arrivedAt), postmarkLabel: selected.postmarkKey ? t("tutorial.postcard.postmark") : undefined, postmarkDate: selected.postmarkKey ? formatDate(selected.arrivedAt) : undefined, stampAssetKey: selected.stampAssetKey }} flipLabel={t("tutorial.postcard.flip")} frontLabel={t("tutorial.postcard.front")} onClose={() => setSelectedKey(undefined)} open /> : null}
    {selected && selected.correspondenceType === "sticker" ? <dialog className={styles.contentDialog} open><button className={styles.dialogClose} type="button" onClick={() => setSelectedKey(undefined)}>{t("mailbox.closeLetter")}</button><article className={styles.contentPaper}><h2>{correspondenceTitle(selected, t)}</h2><p>{correspondencePreview(selected, t)}</p><footer>{selected.senderName}</footer>{canReply ? <ReplyComposer text={replyText} disabled={isReplying} onChange={setReplyText} onSend={() => void sendReply()} /> : null}</article></dialog> : null}
    <AppBottomNav />
  </PageShell>;
}

function ReplyComposer({ text, disabled, onChange, onSend }: { text: string; disabled: boolean; onChange: (value: string) => void; onSend: () => void }) { const { t } = useTranslation(); return <div className={styles.replyComposer}><label>{t("mailbox.returnReplyLabel")}<textarea maxLength={500} value={text} onChange={(event) => onChange(event.currentTarget.value)} /></label><StampButton disabled={!text.trim() || disabled} onClick={onSend}>{disabled ? t("mailbox.replying") : t("mailbox.sendReturnReply")}</StampButton><small>{t("mailbox.returnReplyDeadline")}</small></div>; }
function itemKey(item: ReceivedCorrespondence) { return `${item.deliveryId}:${item.direction}`; }
function returnWindowMinutes(item: ReceivedCorrespondence) { if (item.direction !== "outbound" || item.returnReplyConfirmed || !item.returnReplyDeadline) return undefined; const minutes = Math.ceil((new Date(item.returnReplyDeadline).getTime() - Date.now()) / 60_000); return minutes > 0 ? minutes : undefined; }
function correspondenceTitle(item: ReceivedCorrespondence, t: ReturnType<typeof useTranslation>["t"]) { if (item.correspondenceType === "postcard") return item.postcardNameKey ? t(item.postcardNameKey) : t("correspondence.postcard.name"); if (item.correspondenceType === "sticker") return t("correspondence.sticker.name"); return t("mailbox.letterTitle"); }
function correspondencePreview(item: ReceivedCorrespondence, t: ReturnType<typeof useTranslation>["t"]) { if (item.correspondenceType === "postcard") return item.postcardMessage || t("mailbox.postcardWithoutMessage"); if (item.correspondenceType === "sticker") return item.stickerIds.map((id) => t(stickerNameKey(id))).join(" · "); return item.letterText || t("mailbox.emptyLetter"); }
function stickerNameKey(id: string): "send.content.stickers.sunStamp" | "send.content.stickers.blueEnvelope" | "send.content.stickers.routeSpark" { if (id === "sticker-blue-envelope") return "send.content.stickers.blueEnvelope"; if (id === "sticker-route-spark") return "send.content.stickers.routeSpark"; return "send.content.stickers.sunStamp"; }
