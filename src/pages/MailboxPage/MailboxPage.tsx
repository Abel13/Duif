import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppBottomNav, PageShell } from "../../components/layout";
import { AssetImage, PostalCorrespondenceDialog, PostalEnvelope, PostalLetterReader, PostalPostcard, PostalStickerSheet, SketchPanel, StampButton } from "../../components/ui";
import { formatPostalLocationLabel, type ReceivedCorrespondence } from "../../game";
import { useTranslation } from "../../i18n";
import { fetchReceivedCorrespondence, openReceivedCorrespondence } from "../../integrations/supabase/mailbox";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import styles from "./MailboxPage.module.css";

export function MailboxPage() {
  const { locale, t } = useTranslation();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedDeliveryId=searchParams.get("deliveryId");
  const handledDeliveryRef=useRef<string>();
  const [items, setItems] = useState<ReceivedCorrespondence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>();
  const [deepLinkUnavailable,setDeepLinkUnavailable]=useState(false);
  async function load() { setIsLoading(true); setHasError(false); try { setItems(await fetchReceivedCorrespondence()); } catch { setHasError(true); } finally { setIsLoading(false); } }
  useEffect(() => { void load(); }, []);
  const selected = useMemo(() => items.find((item) => itemKey(item) === selectedKey), [items, selectedKey]);
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(value));
  async function selectItem(item: ReceivedCorrespondence) { setHasError(false); try { const opened = item.isOpened ? item : await openReceivedCorrespondence(item.deliveryId, item.direction); setItems((current) => current.map((candidate) => itemKey(candidate) === itemKey(opened) ? opened : candidate)); setSelectedKey(itemKey(opened)); } catch { setHasError(true); } }
  useEffect(()=>{if(isLoading||!requestedDeliveryId||handledDeliveryRef.current===requestedDeliveryId)return;handledDeliveryRef.current=requestedDeliveryId;const item=items.find((candidate)=>candidate.deliveryId===requestedDeliveryId&&candidate.direction==="outbound");if(item){void selectItem(item)}else{setDeepLinkUnavailable(true)}},[isLoading,items,requestedDeliveryId]);
  const canReply = Boolean(selected?.correspondenceType === "letter" && selected.direction === "outbound" && !selected.returnReplyConfirmed && selected.returnReplyDeadline && new Date(selected.returnReplyDeadline).getTime() >= Date.now());
  const finishing = (item: ReceivedCorrespondence) => ({ stampAssetKey: item.stampAssetKey, postmark: item.postmark });
  const recipientLocation = profile ? formatPostalLocationLabel({ city: profile.postal_base_city, state: profile.postal_base_state, country: profile.postal_base_country }) : t("common.unavailable");

  return <PageShell hasBottomNav>
    <main className={styles.shell}>
      <SketchPanel eyebrow={t("mailbox.eyebrow")} title={t("mailbox.title")}><p className={styles.subtitle}>{t("mailbox.description")}</p></SketchPanel>
      {isLoading ? <SketchPanel title={t("common.loading")}><p className={styles.notice}>{t("mailbox.loading")}</p></SketchPanel> : null}
      {!isLoading && hasError ? <SketchPanel title={t("common.unavailable")}><p className={styles.notice}>{t("mailbox.error")}</p><StampButton onClick={() => void load()} variant="secondary">{t("mailbox.retry")}</StampButton></SketchPanel> : null}
      {!isLoading && deepLinkUnavailable ? <SketchPanel title={t("common.unavailable")}><p className={styles.notice}>{t("mailbox.correspondenceUnavailable")}</p></SketchPanel> : null}
      {!isLoading && !hasError && items.length === 0 ? <SketchPanel title={t("mailbox.emptyTitle")}><p className={styles.notice}>{t("mailbox.emptyDescription")}</p></SketchPanel> : null}
      {!isLoading && items.length > 0 ? <section aria-label={t("mailbox.letterList")} className={styles.list}>{items.map((item) => <button className={styles.letterCard} key={itemKey(item)} type="button" onClick={() => void selectItem(item)}><span aria-hidden="true" className={styles.objectPreview}>{item.correspondenceType === "letter" ? <PostalEnvelope density="compact" finishing={finishing(item)} /> : item.correspondenceType === "postcard" ? <PostalPostcard density="compact" interactive={false} finishing={finishing(item)} flipLabel={t("tutorial.postcard.flip")} frontAlt={t("mailbox.surpriseTitle")} frontAssetKey={item.postcardAssetKey} /> : <PostalStickerSheet density="compact" finishing={finishing(item)} stickers={item.stickerAssetKeys.map((assetKey)=>({assetKey}))} />}</span><span className={styles.postmark}>{item.isOpened ? `${t("mailbox.from")} ${item.senderName}` : t("mailbox.surpriseSender")}</span><strong>{item.isOpened ? correspondenceTitle(item, t) : t("mailbox.surpriseTitle")}</strong><span>{formatDate(item.arrivedAt)}</span><p>{item.isOpened ? correspondencePreview(item, t) : t("mailbox.surpriseDescription")}</p>{item.isOpened && item.mascotName ? <span className={styles.courier}><AssetImage alt="" assetKey={item.mascotPortraitAssetKey} className={styles.courierPortrait}><i /></AssetImage><span>{t("mailbox.deliveredBy").replace("{mascot}", item.mascotName)}</span></span> : null}{returnWindowMinutes(item) !== undefined ? <span>{returnWindowMinutes(item)} min · {t("mailbox.returnWindowRemaining")}</span> : null}<span className={styles.openLabel}>{t("mailbox.openLetter")}</span></button>)}</section> : null}
    </main>
    {selected?.correspondenceType === "letter" ? <PostalCorrespondenceDialog closeLabel={t("mailbox.closeLetter")} onClose={() => setSelectedKey(undefined)} title={t("mailbox.letterTitle")}><PostalLetterReader backLabel={t("mailbox.showEnvelope")} envelope={{finishing:finishing(selected),openLabel:t("mailbox.openLetter"),recipientLabel:recipientLocation,recipientTitle:t("mascot.destination"),senderLabel:selected.senderName,senderLocation:selected.originLabel,senderTitle:t("mascot.origin")}} letter={{action:canReply?<Link className={styles.replyLink} to={`/send?replyTo=${selected.deliveryId}`}>{t("mailbox.prepareReturnReply")}</Link>:selected.returnReplyConfirmed?<p>{t("mailbox.returnReplyConfirmed")}</p>:undefined,dateLabel:formatDate(selected.arrivedAt),emptyLabel:t("mailbox.emptyLetter"),letterText:selected.letterText??"",senderLocation:selected.originLabel??"",senderName:selected.senderName??"",title:t("mailbox.letterTitle")}} /></PostalCorrespondenceDialog> : null}
    {selected?.correspondenceType === "postcard" ? <PostalCorrespondenceDialog closeLabel={t("mailbox.closeLetter")} onClose={() => setSelectedKey(undefined)} title={correspondenceTitle(selected, t)}><PostalPostcard density="reader" finishing={finishing(selected)} flipLabel={t("tutorial.postcard.flip")} frontAlt={correspondenceTitle(selected, t)} frontAssetKey={selected.postcardAssetKey} message={correspondencePreview(selected, t)} senderName={selected.senderName} originLabel={selected.originLabel} originTitle={t("mailbox.from")} destinationLabel={formatDate(selected.arrivedAt)} destinationTitle={t("mailbox.open")} /></PostalCorrespondenceDialog> : null}
    {selected?.correspondenceType === "sticker" ? <PostalCorrespondenceDialog closeLabel={t("mailbox.closeLetter")} onClose={() => setSelectedKey(undefined)} title={correspondenceTitle(selected, t)}><PostalStickerSheet density="reader" finishing={finishing(selected)} stickers={selected.stickerAssetKeys.map((assetKey,index)=>({assetKey,label:t(stickerNameKey(selected.stickerIds[index]??""))}))} /></PostalCorrespondenceDialog> : null}
    <AppBottomNav />
  </PageShell>;
}

function itemKey(item: ReceivedCorrespondence) { return `${item.deliveryId}:${item.direction}`; }
function returnWindowMinutes(item: ReceivedCorrespondence) { if (item.direction !== "outbound" || item.returnReplyConfirmed || !item.returnReplyDeadline) return undefined; const minutes = Math.ceil((new Date(item.returnReplyDeadline).getTime() - Date.now()) / 60_000); return minutes > 0 ? minutes : undefined; }
function correspondenceTitle(item: ReceivedCorrespondence, t: ReturnType<typeof useTranslation>["t"]) { if (item.correspondenceType === "postcard") return item.postcardNameKey ? t(item.postcardNameKey) : t("correspondence.postcard.name"); if (item.correspondenceType === "sticker") return t("correspondence.sticker.name"); return t("mailbox.letterTitle"); }
function correspondencePreview(item: ReceivedCorrespondence, t: ReturnType<typeof useTranslation>["t"]) { if (item.correspondenceType === "postcard") return item.postcardMessage || t("mailbox.postcardWithoutMessage"); if (item.correspondenceType === "sticker") return item.stickerIds.map((id) => t(stickerNameKey(id))).join(" · "); return item.letterText || t("mailbox.emptyLetter"); }
function stickerNameKey(id: string): "send.content.stickers.sunStamp" | "send.content.stickers.blueEnvelope" | "send.content.stickers.routeSpark" { if (id === "sticker-blue-envelope") return "send.content.stickers.blueEnvelope"; if (id === "sticker-route-spark") return "send.content.stickers.routeSpark"; return "send.content.stickers.sunStamp"; }
