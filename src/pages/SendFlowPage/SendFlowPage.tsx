import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { LockKey } from "@phosphor-icons/react";

import { MobileTopBar, PageShell } from "../../components/layout";
import { RoutePreview } from "../../components/map/RoutePreview";
import { CityMapPreview } from "../../components/map/CityMapPreview";
import { MascotPortraitNavigator } from "../../components/mascot/MascotPortraitNavigator";
import { MascotLoadoutEditor, type MascotLoadoutEditorHandle } from "../../components/mascot/MascotLoadoutEditor";
import { AssetImage, ItemCard, LetterDialog, PostalEnvelope, PostalPostcard, PostalPostmark, PostalStickerSheet, SketchPanel, StampButton } from "../../components/ui";
import {
  assetKeys,
  createDefaultCorrespondenceContent,
  deriveMascotTravelModifiers,
  estimateMascotSpeedKmh,
  estimateTravelDurationHours,
  formatRemainingTime,
  formatPostalLocationLabel,
  getCorrespondenceContentCount,
  getFriendCoordinates,
  getFriendLocationLabel,
  getDeliveryStatus,
  getTravelProgress,
  resolveDeliveryPlaceLabel,
  haversineDistanceKm,
  isCorrespondenceContentValid,
  defaultPostmarkCustomization,
  LETTER_MAX_CHARACTERS,
  POSTCARD_MAX_CHARACTERS,
  postmarkColors,
  postmarkModels,
  STICKER_MAX_SELECTION,
  type CorrespondenceContent,
  type CorrespondenceOption,
  type Delivery,
  type FriendProfile,
  type Mascot,
  type MascotTravelModifiers,
  type OwnedPostcard,
  type OwnedSticker,
  type PostmarkCustomization,
  type SendFlowSelection,
} from "../../game";
import { useSendFlowData } from "../../game/useSendFlowData";
import { useTranslation, type TranslationKey } from "../../i18n";
import { createAuthenticatedDeliveryFromSelection, getAvailableSendMascots } from "../../integrations/supabase/authenticatedSendFlow";
import { confirmReturnReply, fetchReturnReplyContext, type ReturnReplyContext } from "../../integrations/supabase/mailbox";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { fetchEquipmentData } from "../../integrations/supabase/equipment";
import { previewMascotSkillModifiers, type SkillPreview } from "../../integrations/supabase/skillPreview";
import { fetchDeliveryPostmarkSnapshot, previewOriginPostmark, type AuthoritativePostmark } from "../../integrations/supabase/postmarkSnapshot";
import type { AuthProfile } from "../../integrations/supabase/profile";
import styles from "./SendFlowPage.module.css";

const isSupportedCorrespondence = (option: CorrespondenceOption) => option.type === "letter" || option.type === "postcard";

type ConfirmedSend = {
  delivery: Delivery;
  friend: FriendProfile;
  mascot: Mascot;
  correspondence: CorrespondenceOption;
  content: CorrespondenceContent;
  postmark?: AuthoritativePostmark;
};

export function SendFlowPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedMascotId = searchParams.get("mascotId");
  const requestedFriendId = searchParams.get("friendId");
  const requestedReplyId = searchParams.get("replyTo");
  const {
    data: sendFlowData,
    isLoading: isSendFlowLoading,
  } = useSendFlowData();
  const { friends, mascots, postalStamps, postcards, reputationLevel, stickers, correspondenceOptions: availableCorrespondence } = sendFlowData;
  const availableMascots = useMemo(() => getAvailableSendMascots(mascots), [mascots]);
  const initialMascotId = getInitialMascotId(availableMascots, requestedMascotId);
  const initialFriendId = getInitialFriendId(friends, requestedFriendId);
  const [selection, setSelection] = useState<SendFlowSelection>({
    friendId: initialFriendId,
    mascotId: initialMascotId,
    correspondenceId: availableCorrespondence.find(isSupportedCorrespondence)?.id,
  });
  const [content, setContent] = useState<CorrespondenceContent>(() =>
    createDefaultCorrespondenceContent(availableCorrespondence.find(isSupportedCorrespondence)?.type ?? "letter", postcards, stickers),
  );
  const [confirmedSend, setConfirmedSend] = useState<ConfirmedSend | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);
  const [isMascotUnavailable, setIsMascotUnavailable] = useState(false);
  const [stampInventoryItemId, setStampInventoryItemId] = useState<string>();
  const [previewStampId, setPreviewStampId] = useState<string>();
  const [postmark, setPostmark] = useState<PostmarkCustomization>(defaultPostmarkCustomization);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSavingLoadout, setIsSavingLoadout] = useState(false);
  const loadoutEditorRef = useRef<MascotLoadoutEditorHandle>(null);
  const [replyContext,setReplyContext]=useState<ReturnReplyContext>();
  const [skillPreview,setSkillPreview]=useState<SkillPreview>();
  const [skillPreviewState,setSkillPreviewState]=useState<"idle"|"loading"|"unavailable">("idle");
  const [replyContextState,setReplyContextState]=useState<"idle"|"loading"|"unavailable">("idle");
  const [postmarkPreview,setPostmarkPreview]=useState<AuthoritativePostmark>();

  useEffect(()=>{if(!requestedReplyId)return;let active=true;setReplyContextState("loading");fetchReturnReplyContext(requestedReplyId).then((value)=>{if(!active)return;setReplyContext(value);setReplyContextState(value?"idle":"unavailable")}).catch(()=>active&&setReplyContextState("unavailable"));return()=>{active=false}},[requestedReplyId]);
  useEffect(()=>{if(!profile){setPostmarkPreview(undefined);return}let active=true;previewOriginPostmark(requestedReplyId??undefined).then((value)=>{if(active)setPostmarkPreview(value)}).catch(()=>{if(active)setPostmarkPreview(undefined)});return()=>{active=false}},[profile,requestedReplyId]);

  useEffect(() => {
    const nextCorrespondence = availableCorrespondence.find(isSupportedCorrespondence);

    setSelection({
      correspondenceId: nextCorrespondence?.id,
      friendId: getInitialFriendId(friends, requestedFriendId),
      mascotId: getInitialMascotId(availableMascots, requestedMascotId),
    });
    setContent(createDefaultCorrespondenceContent(nextCorrespondence?.type ?? "letter", postcards, stickers));
    setConfirmedSend(undefined);
    setHasSubmitError(false);
    setIsMascotUnavailable(false);
  }, [availableCorrespondence, availableMascots, friends, postcards, requestedFriendId, requestedMascotId, stickers]);

  const selectedFriend = friends.find((friend) => friend.id === selection.friendId);
  const selectedMascot = availableMascots.find((mascot) => mascot.id === selection.mascotId);
  const selectedMascotIndex = selectedMascot ? availableMascots.findIndex((mascot) => mascot.id === selectedMascot.id) : -1;
  const selectedCorrespondence = availableCorrespondence.find(
    (option) => option.id === selection.correspondenceId,
  );
  const isSelectionComplete = Boolean(selectedFriend && selectedMascot && selectedCorrespondence);
  const isContentValid = isCorrespondenceContentValid(content);
  const canAdvance = [Boolean(selectedFriend), Boolean(selectedMascot), Boolean(selectedCorrespondence && isContentValid), true, true, false][currentStep];
  const selectedPostalStamp = postalStamps.find((stamp) => stamp.id === stampInventoryItemId);
  const previewedPostalStamp = previewStampId === "default" ? undefined : postalStamps.find((stamp) => stamp.id === previewStampId);

  const estimate = useMemo(() => {
    if (!selectedFriend || !selectedMascot) {
      return undefined;
    }

    const selectedFriendCoordinates = getFriendCoordinates(selectedFriend);

    if (!selectedFriendCoordinates) {
      return undefined;
    }

    if (!profile || !Number.isFinite(profile.home_latitude) || !Number.isFinite(profile.home_longitude)) return undefined;
    const distanceKm = haversineDistanceKm({ latitude: profile.home_latitude, longitude: profile.home_longitude }, selectedFriendCoordinates);
    const speedKmh = estimateMascotSpeedKmh(selectedMascot);
    const modifiers = deriveMascotTravelModifiers(selectedMascot, { distanceKm });

    return {
      distanceKm,
      modifiers,
      outboundDurationHours: estimateTravelDurationHours(
        distanceKm,
        speedKmh * modifiers.outboundSpeedMultiplier,
      ),
      returnDurationHours: estimateTravelDurationHours(
        distanceKm,
        speedKmh * modifiers.returnSpeedMultiplier,
      ),
    };
  }, [selectedFriend, selectedMascot]);

  useEffect(() => {
    if (!selectedMascot || !selectedFriend || !estimate) { setSkillPreview(undefined); setSkillPreviewState("idle"); return; }
    let active=true; setSkillPreviewState("loading");
    const destinationKey=getFriendLocationLabel(selectedFriend.location,t);
    previewMascotSkillModifiers(selectedMascot.id,destinationKey,estimate.distanceKm)
      .then((value)=>{if(!active)return;setSkillPreview(value);setSkillPreviewState(value?"idle":"unavailable")})
      .catch(()=>{if(active){setSkillPreview(undefined);setSkillPreviewState("unavailable")}});
    return()=>{active=false};
  },[estimate,selectedFriend,selectedMascot,t]);

  function updateSelection(nextSelection: SendFlowSelection) {
    setSelection((currentSelection) => ({
      ...currentSelection,
      ...nextSelection,
    }));
    setConfirmedSend(undefined);
    setHasSubmitError(false);
    setIsMascotUnavailable(false);
  }

  function handleCorrespondenceSelect(option: CorrespondenceOption) {
    if (!isSupportedCorrespondence(option)) return;
    updateSelection({ correspondenceId: option.id });
    setContent(createDefaultCorrespondenceContent(option.type, postcards, stickers));
  }

  async function handleNextStep() {
    if (currentStep === 1) {
      const saved = await loadoutEditorRef.current?.saveDraft();
      if (saved === false) return;
    }
    setCurrentStep((step) => Math.min(5, step + 1));
  }

  async function handleConfirmSend() {
    if (!selectedFriend || !selectedMascot || !selectedCorrespondence || isSubmitting) {
      return;
    }

    setHasSubmitError(false);
    setIsMascotUnavailable(false);
    setIsSubmitting(true);

    try {
      const currentEquipment = profile ? await fetchEquipmentData(profile.id) : undefined;
      const equipmentLoadoutRevision = currentEquipment?.loadouts.find((loadout) => loadout.mascotId === selectedMascot.id)?.revision ?? 1;
      const delivery = await createAuthenticatedDeliveryFromSelection({
        correspondence: selectedCorrespondence,
        content,
        friend: selectedFriend,
        mascot: selectedMascot,
        equipmentLoadoutRevision,
        postmark,
        stampInventoryItemId,
      });
      if (delivery) {
        let persistedPostmark: AuthoritativePostmark | undefined;
        try { persistedPostmark=await fetchDeliveryPostmarkSnapshot(delivery.id); } catch { persistedPostmark=undefined; }
        setConfirmedSend({ correspondence: selectedCorrespondence, content, delivery, friend: selectedFriend, mascot: selectedMascot, postmark:persistedPostmark });
      }
    } catch (error) {
      const unavailable = typeof error === "object" && error !== null &&
        (("code" in error && (error.code === "23505" || error.code === "23514")) ||
          ("message" in error && typeof error.message === "string" && /mascot.*(active|open|unavailable)/i.test(error.message)));
      setIsMascotUnavailable(unavailable);
      setHasSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const summaryHint = isSendFlowLoading
    ? t("send.loadingData")
    : isSelectionComplete && isContentValid
      ? t("send.readyHint")
      : isSelectionComplete
        ? t("send.contentInvalid")
      : t("send.incompleteHint");
  const backTo = selectedFriend
    ? `/friends/${selectedFriend.id}`
    : selectedMascot
      ? `/mascots/${selectedMascot.id}`
      : "/mascots";

  if(requestedReplyId){return <ReturnReplyFlow context={replyContext} contextState={replyContextState} postalStamps={postalStamps} postmarkPreview={postmarkPreview} profile={profile} reputationLevel={reputationLevel}/>}

  return (
    <PageShell className={styles.pageShell} hasTopBar>
      <MobileTopBar backTo={backTo} title={t("send.title")} />
      <div className={styles.shell}>
        <p className={styles.subtitle}>{t("send.subtitle")}</p>

        <PostalProgress
          currentStep={currentStep}
          labels={[
            t("send.steps.friend"),
            t("send.steps.mascot"),
            t("send.steps.correspondence"),
            t("send.steps.stamp"),
            t("send.steps.postmark"),
            t("send.steps.review"),
          ]}
        />

        <div className={styles.stepViewport}>
        <div className={styles.flowGrid}>
          {currentStep === 0 ? (
          <ChoiceSection title={t("send.chooseFriend")}>
            {friends.map((friend) => (
              <div
                className={styles.optionFrame}
                data-selected={friend.id === selection.friendId || undefined}
                key={friend.id}
              >
                <ItemCard
                  title={friend.name}
                  description={friend.favoriteNoteKey ? t(friend.favoriteNoteKey) : undefined}
                  selected={friend.id === selection.friendId}
                >
                  <CityMapPreview
                    cityLabel={getFriendLocationLabel(friend.location, t)}
                    latitude={friend.location.latitude}
                    longitude={friend.location.longitude}
                  />
                </ItemCard>
                <button
                  aria-label={`${t("send.selectedFriend")}: ${friend.name}`}
                  className={styles.optionButton}
                  type="button"
                  onClick={() => updateSelection({ friendId: friend.id })}
                />
              </div>
            ))}
          </ChoiceSection>
          ) : null}

          {currentStep === 1 ? (
          <ChoiceSection fullWidth title={t("send.chooseMascot")}>
            {selectedMascot ? (
              <div className={styles.mascotChoice}>
                <MascotPortraitNavigator
                  hasNext={selectedMascotIndex >= 0 && selectedMascotIndex < availableMascots.length - 1}
                  hasPrevious={selectedMascotIndex > 0}
                  mascot={selectedMascot}
                  nextLabel={t("map.nextMascot")}
                  previousLabel={t("map.previousMascot")}
                  onNext={() => {
                    const mascot = availableMascots[selectedMascotIndex + 1];
                    if (mascot) updateSelection({ mascotId: mascot.id });
                  }}
                  onPrevious={() => {
                    const mascot = availableMascots[selectedMascotIndex - 1];
                    if (mascot) updateSelection({ mascotId: mascot.id });
                  }}
                />
                <div className={styles.mascotChoiceDetails}>
                  <span>{t(selectedMascot.speciesKey)}</span>
                  <strong>{selectedMascot.name}</strong>
                  <small>{t("mascot.level")} {selectedMascot.level}</small>
                  <p>{getMascotRouteEffect(
                    selectedMascot,
                    selectedFriend
                      ? deriveMascotTravelModifiers(selectedMascot, {
                          distanceKm: getRouteDistance(selectedFriend, profile?.home_latitude, profile?.home_longitude),
                        })
                      : undefined,
                    t,
                  )}</p>
                </div>
                <MascotLoadoutEditor
                  key={selectedMascot.id}
                  mascotId={selectedMascot.id}
                  mascotNames={Object.fromEntries(mascots.map((mascot) => [mascot.id, mascot.name]))}
                  onSavingChange={setIsSavingLoadout}
                  persistence="external"
                  ref={loadoutEditorRef}
                />
              </div>
            ) : isSendFlowLoading ? <p className={styles.hint}>{t("send.loadingData")}</p> : <div className={styles.noMascots}><p>{t("send.noAvailableMascots")}</p><Link className={styles.returnLink} to="/map">{t("send.viewActiveTrips")}</Link></div>}
          </ChoiceSection>
          ) : null}

          {currentStep === 2 ? <>
          <ChoiceSection title={t("send.chooseCorrespondence")}>
            {availableCorrespondence.map((option) => (
              <div
                className={styles.optionFrame}
                data-selected={option.id === selection.correspondenceId || undefined}
                key={option.id}
              >
                <ItemCard
                  title={t(option.nameKey)}
                  description={t(option.descriptionKey)}
                  meta={isSupportedCorrespondence(option) ? undefined : t("send.availableLater")}
                  selected={option.id === selection.correspondenceId}
                />
                <button
                  aria-label={`${t("send.selectedCorrespondence")}: ${t(option.nameKey)}`}
                  className={styles.optionButton}
                  disabled={!isSupportedCorrespondence(option)}
                  type="button"
                  onClick={() => handleCorrespondenceSelect(option)}
                />
              </div>
            ))}
          </ChoiceSection>

          <SketchPanel title={t("send.composeTitle")}>
            <CorrespondenceComposer
              content={content}
              onChange={setContent}
              postcards={postcards}
              stickers={stickers}
              senderLocation={profile
                ? formatPostalLocationLabel({
                    city: profile.postal_base_city,
                    state: profile.postal_base_state,
                    country: profile.postal_base_country,
                  }) || t("common.unavailable")
                : t("common.unavailable")}
              senderName={profile?.display_name?.trim() || t("common.unavailable")}
            />
          </SketchPanel>
          </> : null}

          {currentStep === 3 ? (
          <ChoiceSection title={t("send.postalFinishing.stampTitle")}>
            <p className={styles.hint}>{t("send.postalFinishing.stampDescription")}</p>
            <div className={styles.stampList}>
              <StampChoice
                assetKey={assetKeys.stamps.default}
                isSelected={!stampInventoryItemId}
                label={t("send.postalFinishing.defaultStamp")}
                onPreview={() => setPreviewStampId("default")}
                onSelect={() => setStampInventoryItemId(undefined)}
              />
              {postalStamps.map((stamp) => (
                <StampChoice
                  assetKey={stamp.assetKey}
                  isSelected={stamp.id === stampInventoryItemId}
                  key={stamp.id}
                  label={t(stamp.nameKey)}
                  onPreview={() => setPreviewStampId(stamp.id)}
                  onSelect={() => setStampInventoryItemId(stamp.id)}
                />
              ))}
            </div>
          </ChoiceSection>
          ) : null}

          {currentStep === 4 ? (
          <ChoiceSection title={t("send.postalFinishing.postmarkTitle")}>
            <p className={styles.hint}>{t("send.postalFinishing.postmarkDescription")}</p>
            <PostmarkCustomizer
              city={profile?.postal_base_city || t("common.unavailable")}
              country={profile?.postal_base_country || t("common.unavailable")}
              customization={postmark}
              date={postmarkPreview?.date}
              level={reputationLevel}
              onChange={setPostmark}
            />
          </ChoiceSection>
          ) : null}

          {currentStep === 5 ? (
          <SketchPanel
            className={styles.summaryPanel}
            title={confirmedSend ? t("send.confirmationTitle") : t("send.summary")}
            variant="note"
          >
            {confirmedSend ? (
              <ConfirmationPanel confirmedSend={confirmedSend} postcards={postcards} stickers={stickers} />
            ) : (
              <div className={styles.summary}>
                <p className={styles.hint}>{summaryHint}</p>
                {hasSubmitError && <p className={styles.error}>{t(isMascotUnavailable ? "send.mascotUnavailable" : "send.errorMessage")}</p>}
                <section className={styles.reviewContent}>
                  <h3>{t("send.contentPreview")}</h3>
                  <ReviewContentPreview
                    city={profile?.postal_base_city || t("common.unavailable")}
                    content={content}
                    country={profile?.postal_base_country || t("common.unavailable")}
                    destinationLabel={selectedFriend ? getFriendLocationLabel(selectedFriend.location, t) : t("common.unavailable")}
                    deliveredBy={selectedMascot?.name ?? t("common.unavailable")}
                    originLabel={profile ? formatPostalLocationLabel({ city: profile.postal_base_city, state: profile.postal_base_state, country: profile.postal_base_country }) : t("common.unavailable")}
                    postcards={postcards}
                    postmark={postmark}
                    postmarkSnapshot={postmarkPreview}
                    senderName={profile?.display_name ?? t("common.unavailable")}
                    stampAssetKey={selectedPostalStamp?.assetKey ?? assetKeys.stamps.default}
                    stickers={stickers}
                  />
                </section>
                <dl className={styles.summaryList}>
                  <SummaryRow
                    fallback={t("common.unavailable")}
                    label={t("send.selectedFriend")}
                    value={selectedFriend?.name}
                  />
                  <SummaryRow
                    fallback={t("common.unavailable")}
                    label={t("send.selectedMascot")}
                    value={selectedMascot?.name}
                  />
                  <SummaryRow
                    fallback={t("common.unavailable")}
                    label={t("send.selectedCorrespondence")}
                    value={selectedCorrespondence ? t(selectedCorrespondence.nameKey) : undefined}
                  />
                  <SummaryRow label={t("send.postalFinishing.summaryLabel")} value={`${stampInventoryItemId ? t(postalStamps.find((stamp) => stamp.id === stampInventoryItemId)?.nameKey ?? "send.postalFinishing.defaultStamp") : t("send.postalFinishing.defaultStamp")} · ${t(`send.postalFinishing.models.${postmark.model}`)} / ${t(`send.postalFinishing.colors.${postmark.color}`)}`} />
                  {estimate ? <>
                    <SummaryRow label={t("mascot.distance")} value={`${estimate.distanceKm} ${t("units.kilometers")}`} />
                    <SummaryRow label={t("send.preparationTime")} value={formatMinutes(skillPreview?.preparationMinutes ?? estimate.modifiers.preparationMinutes)} />
                    <SummaryRow label={t("send.outboundDuration")} value={formatDurationHours(skillPreview && selectedMascot ? estimateTravelDurationHours(estimate.distanceKm,estimateMascotSpeedKmh(selectedMascot)*skillPreview.outboundSpeedMultiplier) : estimate.outboundDurationHours)} />
                    <SummaryRow label={t("send.returnDuration")} value={formatDurationHours(skillPreview && selectedMascot ? estimateTravelDurationHours(estimate.distanceKm,estimateMascotSpeedKmh(selectedMascot)*skillPreview.returnSpeedMultiplier) : estimate.returnDurationHours)} />
                    <SummaryRow label={t("travelWeather.impactRange")} value={t("travelWeather.impactDescription")} />
                  </> : null}
                </dl>
                <SkillPreviewSection mascot={selectedMascot} preview={skillPreview} state={skillPreviewState} />
                <StampButton
                  disabled={!isSelectionComplete || !isContentValid || isSubmitting || isSendFlowLoading}
                  onClick={handleConfirmSend}
                >
                  {isSubmitting ? t("send.sending") : t("send.sendButton")}
                </StampButton>
              </div>
            )}
          </SketchPanel>
          ) : null}
        </div>
        </div>

        {!confirmedSend ? (
          <nav aria-label={t("send.steps.navigation")} className={styles.stepActions}>
            <button
              className={styles.backButton}
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              type="button"
            >
              {t("send.steps.back")}
            </button>
            {currentStep < 5 ? (
              <StampButton
                disabled={!canAdvance || isSendFlowLoading || isSavingLoadout}
                onClick={() => void handleNextStep()}
              >
                {t("send.steps.next")}
              </StampButton>
            ) : null}
          </nav>
        ) : null}
      </div>
      {previewStampId ? (
        <dialog aria-label={t("send.postalFinishing.previewStamp")} className={styles.stampDialog} open>
          <div className={styles.stampDialogPaper}>
            <button className={styles.dialogClose} onClick={() => setPreviewStampId(undefined)} type="button">{t("send.postalFinishing.closeStampPreview")}</button>
            <AssetImage
              alt={previewedPostalStamp ? t(previewedPostalStamp.nameKey) : t("send.postalFinishing.defaultStamp")}
              assetKey={previewedPostalStamp?.assetKey ?? assetKeys.stamps.default}
              className={styles.stampDialogArt}
              loading="eager"
            ><span aria-hidden="true" /></AssetImage>
            <strong>{previewedPostalStamp ? t(previewedPostalStamp.nameKey) : t("send.postalFinishing.defaultStamp")}</strong>
          </div>
        </dialog>
      ) : null}
    </PageShell>
  );
}

function ReviewContentPreview({ city, content, country, deliveredBy, destinationLabel, originLabel, postcards, postmark, postmarkSnapshot, senderName, stampAssetKey, stickers }: {
  city: string;
  content: CorrespondenceContent;
  country: string;
  deliveredBy: string;
  destinationLabel: string;
  originLabel: string;
  postcards: OwnedPostcard[];
  postmark: PostmarkCustomization;
  postmarkSnapshot?: AuthoritativePostmark;
  senderName: string;
  stampAssetKey: string;
  stickers: OwnedSticker[];
}) {
  const { locale, t } = useTranslation();
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const finishing = { stampAssetKey, postmark: { city, country, date: postmarkSnapshot?.date??"----", ...postmark, stampedAt:postmarkSnapshot?.stampedAt, timeZone:postmarkSnapshot?.timeZone, dateSource:postmarkSnapshot?.dateSource } };

  if (content.type === "postcard") {
    const postcard = postcards.find((option) => option.catalogKey === content.postcardCatalogKey);
    return <PostalPostcard deliveredBy={`${t("tutorial.postcard.deliveredBy")} ${deliveredBy}`} destinationLabel={destinationLabel} destinationTitle={t("mascot.destination")} finishing={finishing} flipLabel={t("tutorial.postcard.flip")} frontAlt={postcard?t(postcard.nameKey):t("send.content.emptyPreview")} frontAssetKey={postcard?.artworkAssetKey} message={content.postcardMessage||t("send.content.emptyPreview")} originLabel={originLabel} originTitle={t("mascot.origin")} senderName={senderName}/>;
  }

  if (content.type === "sticker") {
    return <PostalStickerSheet finishing={finishing} stickers={content.stickerIds.flatMap((stickerId) => {
      const sticker = stickers.find((option) => option.catalogKey === stickerId);
      return sticker?[{assetKey:sticker.artworkAssetKey,label:t(sticker.nameKey)}]:[];
    })}/>;
  }

  const text = content.type === "letter" ? content.letterText : content.giftNote;
  if (content.type === "letter") {
    return <div className={styles.reviewLetterExperience}><PostalEnvelope finishing={finishing} onOpen={()=>setIsLetterOpen(true)} openLabel={t("send.previewLetter")} recipientLabel={destinationLabel} recipientTitle={t("mascot.destination")} senderLabel={senderName} senderLocation={originLabel} senderTitle={t("mascot.origin")}/>
      <LetterDialog
        closeLabel={t("send.closeLetterPreview")}
        dateLabel={new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date())}
        emptyLabel={t("send.content.emptyPreview")}
        letterText={text}
        onClose={() => setIsLetterOpen(false)}
        open={isLetterOpen}
        senderLocation={originLabel}
        senderName={senderName}
        title={t("send.previewLetter")}
      />
    </div>;
  }

  return <div className={`${styles.reviewItem} ${styles.reviewLetterSheet}`}><blockquote className={styles.reviewLetter}>{text || t("send.content.emptyPreview")}</blockquote></div>;
}

function PostmarkCustomizer({ city, country, customization, date, level, onChange }: {
  city: string;
  country: string;
  customization: PostmarkCustomization;
  date?: string;
  level: number;
  onChange: (value: PostmarkCustomization) => void;
}) {
  const { t } = useTranslation();
  return <div className={styles.postmarkCustomizer}>
    <div className={styles.postmarkLevel}>{t("send.postalFinishing.reputationLevel").replace("{level}", String(level))}</div>
    <PostalPostmark postmark={{city,country,date:date??"----",...customization}} showLabel />
    <fieldset className={styles.postmarkOptions}>
      <legend>{t("send.postalFinishing.modelLabel")}</legend>
      <div className={styles.postmarkModelGrid}>
        {postmarkModels.map((model) => {
          const locked = model.level > level;
          return <button aria-pressed={customization.model === model.id} disabled={locked} key={model.id} onClick={() => onChange({ ...customization, model: model.id })} type="button">
            <span>{t(`send.postalFinishing.models.${model.id}`)}</span>
            {locked ? <small><LockKey aria-hidden="true" />{t("send.postalFinishing.unlockLevel").replace("{level}", String(model.level))}</small> : null}
          </button>;
        })}
      </div>
    </fieldset>
    <fieldset className={styles.postmarkOptions}>
      <legend>{t("send.postalFinishing.colorLabel")}</legend>
      <div className={styles.postmarkColorGrid}>
        {postmarkColors.map((color) => {
          const locked = color.level > level;
          return <button aria-label={locked ? `${t(`send.postalFinishing.colors.${color.id}`)} — ${t("send.postalFinishing.unlockLevel").replace("{level}", String(color.level))}` : t(`send.postalFinishing.colors.${color.id}`)} aria-pressed={customization.color === color.id} disabled={locked} key={color.id} onClick={() => onChange({ ...customization, color: color.id })} style={{ "--postmark-swatch": color.value } as CSSProperties} type="button">
            <span aria-hidden="true" />
            {locked ? <LockKey aria-hidden="true" /> : null}
          </button>;
        })}
      </div>
    </fieldset>
  </div>;
}

function StampChoice({ assetKey, isSelected, label, onPreview, onSelect }: {
  assetKey?: string;
  isSelected: boolean;
  label: string;
  onPreview: () => void;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return <article className={styles.stampChoice} data-selected={isSelected || undefined}>
    <AssetImage alt="" assetKey={assetKey} className={styles.stampChoiceArt}><span aria-hidden="true" /></AssetImage>
    <strong>{label}</strong>
    <div>
      <button aria-pressed={isSelected} onClick={onSelect} type="button">{t("send.postalFinishing.chooseStamp")}</button>
      <button onClick={onPreview} type="button">{t("send.postalFinishing.previewStamp")}</button>
    </div>
  </article>;
}

function ReturnReplyFlow({context,contextState,postalStamps,postmarkPreview,profile,reputationLevel}:{context?:ReturnReplyContext;contextState:"idle"|"loading"|"unavailable";postalStamps:{assetKey?:import("../../game").OfficialAssetKey;id:string;nameKey:import("../../i18n").TranslationKey}[];postmarkPreview?:AuthoritativePostmark;profile:AuthProfile|null;reputationLevel:number}){
  const {t}=useTranslation(); const [step,setStep]=useState(0); const [content,setContent]=useState<CorrespondenceContent>({type:"letter",letterText:""}); const [stampId,setStampId]=useState<string>(); const [previewStampId,setPreviewStampId]=useState<string>(); const [postmark,setPostmark]=useState<PostmarkCustomization>(defaultPostmarkCustomization); const [submitting,setSubmitting]=useState(false); const [confirmed,setConfirmed]=useState(false); const [unavailableReason,setUnavailableReason]=useState<"expired"|"confirmed">(); const [error,setError]=useState(false); const [now,setNow]=useState(Date.now());
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer)},[]);
  if(contextState==="loading")return <PageShell className={styles.pageShell} hasTopBar><MobileTopBar backTo="/mailbox" title={t("mailbox.returnReplyFlowTitle")}/><SketchPanel title={t("common.loading")}><p>{t("mailbox.returnReplyLoading")}</p></SketchPanel></PageShell>;
  if(!context||contextState==="unavailable"||unavailableReason||context.replyConfirmed||new Date(context.replyDeadline).getTime()<=now)return <PageShell className={styles.pageShell} hasTopBar><MobileTopBar backTo="/mailbox" title={t("mailbox.returnReplyFlowTitle")}/><SketchPanel title={t("mailbox.returnReplyUnavailable")}><p>{t(context?.replyConfirmed||unavailableReason==="confirmed"?"mailbox.returnReplyConfirmed":"mailbox.returnReplyExpired")}</p><Link className={styles.returnLink} to="/mailbox">{t("mailbox.open")}</Link></SketchPanel></PageShell>;
  const replyContext = context;
  const letterText=content.type==="letter"?content.letterText:""; const selectedStamp=postalStamps.find(item=>item.id===stampId); const previewStamp=postalStamps.find(item=>item.id===previewStampId); const remaining=Math.max(0,new Date(context.replyDeadline).getTime()-now); const remainingLabel=`${Math.floor(remaining/60000)}:${String(Math.floor((remaining%60000)/1000)).padStart(2,"0")}`;
  async function confirm(){if(!letterText.trim()||submitting)return;setSubmitting(true);setError(false);try{await confirmReturnReply(replyContext.deliveryId,letterText,postmark,stampId);setConfirmed(true)}catch{try{const current=await fetchReturnReplyContext(replyContext.deliveryId);if(!current||current.replyConfirmed){setUnavailableReason(current?.replyConfirmed?"confirmed":"expired");return}}catch{/* Preserve the actionable submission error when eligibility cannot be refreshed. */}setError(true)}finally{setSubmitting(false)}}
  if(confirmed)return <PageShell className={styles.pageShell} hasTopBar><MobileTopBar backTo="/mailbox" title={t("mailbox.returnReplyFlowTitle")}/><SketchPanel title={t("mailbox.returnReplyConfirmed")}><p>{t("mailbox.returnReplyConfirmedDescription")}</p><div className={styles.actions}><Link className={styles.primaryLink} to={`/map?deliveryId=${context.deliveryId}`}>{t("mascot.viewTrip")}</Link><Link className={styles.returnLink} to="/mailbox">{t("mailbox.open")}</Link></div></SketchPanel></PageShell>;
  return <PageShell className={styles.pageShell} hasTopBar><MobileTopBar backTo="/mailbox" title={t("mailbox.returnReplyFlowTitle")}/><div className={styles.shell}><div className={styles.replyDeadline}><span>{t("mailbox.returnWindowRemaining")}</span><strong>{remainingLabel}</strong></div><PostalProgress currentStep={step} labels={[t("send.steps.correspondence"),t("send.steps.stamp"),t("send.steps.postmark"),t("send.steps.review")]}/><div className={styles.stepViewport}><div className={styles.flowGrid}>
    {step===0?<ChoiceSection title={t("mailbox.writeReturnReply")}><CorrespondenceComposer content={content} onChange={setContent} postcards={[]} stickers={[]} senderLocation={context.destinationLabel} senderName={profile?.display_name??t("common.unavailable")}/></ChoiceSection>:null}
    {step===1?<ChoiceSection title={t("send.postalFinishing.stampTitle")}><div className={styles.stampChoices}><StampChoice assetKey={assetKeys.stamps.default} isSelected={!stampId} label={t("send.postalFinishing.defaultStamp")} onPreview={()=>setPreviewStampId("default")} onSelect={()=>setStampId(undefined)}/>{postalStamps.map(item=><StampChoice assetKey={item.assetKey} isSelected={stampId===item.id} key={item.id} label={t(item.nameKey)} onPreview={()=>setPreviewStampId(item.id)} onSelect={()=>setStampId(item.id)}/>)}</div></ChoiceSection>:null}
    {step===2?<ChoiceSection title={t("send.postalFinishing.postmarkTitle")}><PostmarkCustomizer city={profile?.postal_base_city||t("common.unavailable")} country={profile?.postal_base_country||t("common.unavailable")} customization={postmark} date={postmarkPreview?.date} level={reputationLevel} onChange={setPostmark}/></ChoiceSection>:null}
    {step===3?<SketchPanel className={styles.summaryPanel} title={t("send.summary")} variant="note"><div className={styles.summary}><ReviewContentPreview city={profile?.postal_base_city||t("common.unavailable")} content={content} country={profile?.postal_base_country||t("common.unavailable")} deliveredBy={context.mascotName} destinationLabel={context.originLabel} originLabel={context.destinationLabel} postcards={[]} postmark={postmark} postmarkSnapshot={postmarkPreview} senderName={profile?.display_name??t("common.unavailable")} stampAssetKey={selectedStamp?.assetKey??assetKeys.stamps.default} stickers={[]}/><dl className={styles.summaryList}><SummaryRow label={t("mailbox.toOriginalSender")} value={context.senderName}/><SummaryRow label={t("send.selectedMascot")} value={context.mascotName}/></dl>{error?<p className={styles.error}>{t("mailbox.returnReplySubmitError")}</p>:null}<StampButton disabled={!letterText.trim()||submitting} onClick={()=>void confirm()}>{submitting?t("mailbox.replying"):t("mailbox.sendReturnReply")}</StampButton></div></SketchPanel>:null}
  </div></div><nav aria-label={t("send.steps.navigation")} className={styles.stepActions}><button className={styles.backButton} disabled={step===0} onClick={()=>setStep(value=>Math.max(0,value-1))} type="button">{t("send.steps.back")}</button>{step<3?<StampButton disabled={step===0&&!letterText.trim()} onClick={()=>setStep(value=>Math.min(3,value+1))}>{t("send.steps.next")}</StampButton>:null}</nav></div>{previewStampId?<dialog aria-label={t("send.postalFinishing.previewStamp")} className={styles.stampDialog} open><div className={styles.stampDialogPaper}><button className={styles.dialogClose} onClick={()=>setPreviewStampId(undefined)} type="button">{t("send.postalFinishing.closeStampPreview")}</button><AssetImage alt={previewStamp?t(previewStamp.nameKey):t("send.postalFinishing.defaultStamp")} assetKey={previewStamp?.assetKey??assetKeys.stamps.default} className={styles.stampDialogArt}><span aria-hidden="true" /></AssetImage></div></dialog>:null}</PageShell>;
}

function PostalProgress({ currentStep, labels }: { currentStep: number; labels: string[] }) {
  return (
    <ol aria-label={labels[currentStep]} className={styles.postalProgress} style={{"--postal-step-count":labels.length} as CSSProperties}>
      {labels.map((label, index) => (
        <li
          aria-current={index === currentStep ? "step" : undefined}
          data-complete={index < currentStep || undefined}
          data-current={index === currentStep || undefined}
          key={label}
        >
          <span>{index + 1}</span>
          <small>{label}</small>
        </li>
      ))}
    </ol>
  );
}

function ChoiceSection({ title, children, fullWidth = false }: { title: string; children: ReactNode; fullWidth?: boolean }) {
  return (
    <SketchPanel title={title}>
      <div className={styles.options} data-full-width={fullWidth || undefined}>{children}</div>
    </SketchPanel>
  );
}

function SummaryRow({
  label,
  value,
  fallback = "",
}: {
  label: string;
  value?: ReactNode;
  fallback?: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value ?? fallback}</dd>
    </div>
  );
}

function CorrespondenceComposer({
  content,
  onChange,
  postcards,
  stickers,
  senderLocation,
  senderName,
}: {
  content: CorrespondenceContent;
  onChange: (content: CorrespondenceContent) => void;
  postcards: OwnedPostcard[];
  stickers: OwnedSticker[];
  senderLocation: string;
  senderName: string;
}) {
  const { locale, t } = useTranslation();
  const [isLetterPreviewOpen, setIsLetterPreviewOpen] = useState(false);

  if (content.type === "postcard") {
    const selectedPostcard = postcards.find((option) => option.catalogKey === content.postcardCatalogKey);

    return (
      <div className={styles.composer}>
        <fieldset className={styles.fieldset}>
          <legend>{t("send.content.postcardVariantLabel")}</legend>
          <div className={styles.segmented}>
            {postcards.map((option) => (
              <button
                className={styles.segment}
                data-active={content.postcardCatalogKey === option.catalogKey || undefined}
                key={option.catalogKey}
                onClick={() => onChange({ ...content, postcardCatalogKey: option.catalogKey })}
                type="button"
              >
                {t(option.nameKey)}{option.quantity !== undefined ? ` · ${option.quantity}` : ""}
              </button>
            ))}
          </div>
        </fieldset>
        {selectedPostcard ? (
          <figure className={styles.postcardPreview}>
            <AssetImage
              alt={t(selectedPostcard.nameKey)}
              assetKey={selectedPostcard.artworkAssetKey}
              className={styles.postcardPreviewArt}
              loading="eager"
            >
              <span aria-hidden="true" className={styles.postcardPreviewFallback} />
            </AssetImage>
            <figcaption>
              <strong>{t(selectedPostcard.nameKey)}</strong>
              <span>{t(selectedPostcard.descriptionKey)}</span>
            </figcaption>
          </figure>
        ) : null}
        <TextComposerField
          count={getCorrespondenceContentCount(content)}
          label={t("send.content.postcardLabel")}
          maxLength={POSTCARD_MAX_CHARACTERS}
          onChange={(value) => onChange({ ...content, postcardMessage: value })}
          placeholder={t("send.postcardPlaceholder")}
          value={content.postcardMessage}
        />
      </div>
    );
  }

  if (content.type === "sticker") {
    return (
      <div className={styles.composer}>
        <fieldset className={styles.fieldset}>
          <legend>{t("send.content.stickerLabel")}</legend>
          <div className={styles.segmented}>
            {stickers.map((option) => {
              const selectedCount = content.stickerIds.filter((id) => id === option.catalogKey).length;

              return <div className={styles.stickerChoice} key={option.catalogKey}>
                <button
                  className={styles.segment}
                  data-active={selectedCount > 0 || undefined}
                  disabled={content.stickerIds.length >= STICKER_MAX_SELECTION || selectedCount >= option.quantity}
                  onClick={() => {
                    onChange({ ...content, stickerIds: [...content.stickerIds, option.catalogKey] });
                  }}
                  type="button"
                >
                  {t(option.nameKey)} · {selectedCount}/{option.quantity}
                </button>
                {selectedCount > 0 ? <button className={styles.segment} type="button" onClick={() => {
                  const stickerIds = [...content.stickerIds];
                  stickerIds.splice(stickerIds.lastIndexOf(option.catalogKey), 1);
                  onChange({ ...content, stickerIds });
                }}>{t("send.removeSticker")} {t(option.nameKey)}</button> : null}
              </div>;
            })}
          </div>
          <p className={styles.counter}>
            {t("send.selectedStickers")}: {content.stickerIds.length}/{STICKER_MAX_SELECTION}
          </p>
        </fieldset>
      </div>
    );
  }

  if (content.type === "smallGift") {
    return (
      <div className={styles.composer}>
        <div className={styles.pendingGift}>
          <strong>{t("send.giftPendingTitle")}</strong>
          <span>{t("send.giftPendingDescription")}</span>
        </div>
        <TextComposerField
          count={getCorrespondenceContentCount(content)}
          label={t("send.content.giftLabel")}
          maxLength={POSTCARD_MAX_CHARACTERS}
          onChange={(value) => onChange({ ...content, giftNote: value })}
          placeholder={t("send.giftPlaceholder")}
          value={content.giftNote}
        />
      </div>
    );
  }

  return (
    <div className={styles.composer}>
      <div className={styles.letterPaper}>
        <p className={styles.letterHeading}>
          {senderLocation} · {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date())}
        </p>
        <textarea
          aria-label={t("send.content.letterLabel")}
          className={styles.letterBody}
          maxLength={LETTER_MAX_CHARACTERS}
          onChange={(event) => onChange({ ...content, letterText: event.currentTarget.value })}
          placeholder={t("send.letterPlaceholder")}
          required
          value={content.letterText}
        />
        <p className={styles.letterSignature}>{senderName}</p>
        <p className={styles.counter}>
          {t("send.characterCount")}: {getCorrespondenceContentCount(content)}/{LETTER_MAX_CHARACTERS}
        </p>
        <StampButton
          className={styles.previewButton}
          variant="secondary"
          onClick={() => setIsLetterPreviewOpen(true)}
        >
          {t("send.previewLetter")}
        </StampButton>
      </div>
      <LetterDialog
        closeLabel={t("send.closeLetterPreview")}
        dateLabel={new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date())}
        emptyLabel={t("send.content.emptyPreview")}
        letterText={content.letterText}
        onClose={() => {
          setIsLetterPreviewOpen(false);
        }}
        open={isLetterPreviewOpen}
        senderLocation={senderLocation}
        senderName={senderName}
        title={t("send.previewLetter")}
      />
    </div>
  );
}

function TextComposerField({
  count,
  label,
  maxLength,
  onChange,
  placeholder,
  required = false,
  value,
}: {
  count: number;
  label: string;
  maxLength: number;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  const { t } = useTranslation();

  return (
    <label className={styles.textField}>
      <span>{label}</span>
      <textarea
        maxLength={maxLength}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
      <small>
        {t("send.characterCount")}: {count}/{maxLength}
      </small>
    </label>
  );
}

function CorrespondenceContentPreview({ content, postcards, stickers }: { content: CorrespondenceContent; postcards: OwnedPostcard[]; stickers: OwnedSticker[] }) {
  const { t } = useTranslation();

  if (content.type === "postcard") {
    const variant = postcards.find((option) => option.catalogKey === content.postcardCatalogKey);
    return (
      <span>
        {variant ? t(variant.nameKey) : t("correspondence.postcard.name")}
        {content.postcardMessage ? ` / ${content.postcardMessage}` : ""}
      </span>
    );
  }

  if (content.type === "sticker") {
    const stickerNames = content.stickerIds
      .map((stickerId) => stickers.find((option) => option.catalogKey === stickerId))
      .filter((option): option is OwnedSticker => Boolean(option))
      .map((option) => t(option.nameKey));

    return <span>{stickerNames.join(" / ") || t("send.content.emptyPreview")}</span>;
  }

  if (content.type === "smallGift") {
    return <span>{content.giftNote || t("send.giftPendingDescription")}</span>;
  }

  return <span>{content.letterText || t("send.content.emptyPreview")}</span>;
}

function ConfirmationPanel({
  confirmedSend,
  postcards,
  stickers,
}: {
  confirmedSend: ConfirmedSend;
  postcards: OwnedPostcard[];
  stickers: OwnedSticker[];
}) {
  const { t } = useTranslation();
  const { delivery, friend, mascot, correspondence, content } = confirmedSend;
  const status = getDeliveryStatus(delivery);
  const progress = getTravelProgress(delivery);
  const remainingTime = formatRemainingTime(delivery);
  const distanceLabel = `${delivery.distanceKm} ${t("units.kilometers")}`;

  return (
    <div className={styles.confirmation}>
      <p className={styles.hint}>{t("send.confirmationDescription")}</p>
      {confirmedSend.postmark?<PostalPostmark postmark={confirmedSend.postmark}/>:null}
      <RoutePreview
        originLabel={resolveDeliveryPlaceLabel(delivery, "origin", t)}
        destinationLabel={resolveDeliveryPlaceLabel(delivery, "destination", t)}
        progress={progress}
        statusLabel={t(`delivery.status.${status}`)}
        remainingTime={remainingTime}
        distanceLabel={distanceLabel}
      />
      <dl className={styles.summaryList}>
        <SummaryRow label={t("send.selectedFriend")} value={friend.name} />
        <SummaryRow label={t("send.selectedMascot")} value={mascot.name} />
        <SummaryRow label={t("send.selectedCorrespondence")} value={t(correspondence.nameKey)} />
        <SummaryRow
          label={t("send.contentPreview")}
          value={<CorrespondenceContentPreview content={content} postcards={postcards} stickers={stickers} />}
        />
        <SummaryRow label={t("mascot.status")} value={t(`delivery.status.${status}`)} />
      </dl>
      <SkillPreviewSection mascot={mascot} preview={skillPreviewFromDelivery(delivery)} state="idle" />
      <div className={styles.actions}>
        <Link className={styles.primaryLink} to={`/map?mascotId=${mascot.id}`}>
          {t("mascot.viewTrip")}
        </Link>
        <Link className={styles.returnLink} to={`/mascots/${mascot.id}`}>
          {t("send.backToMascot")}
        </Link>
      </div>
    </div>
  );
}

function skillPreviewFromDelivery(delivery: Delivery): SkillPreview | undefined {
  const modifiers=delivery.travelModifiers;
  if(modifiers?.version!==3||!modifiers.skillEffects)return undefined;
  return {version:3,skillRulesVersion:modifiers.skillRulesVersion,preparationMinutes:modifiers.preparationMinutes,outboundSpeedMultiplier:modifiers.outboundSpeedMultiplier,returnSpeedMultiplier:modifiers.returnSpeedMultiplier,discoveryRadiusMultiplier:modifiers.discoveryRadiusMultiplier,rarityWeightMultiplier:modifiers.rarityWeightMultiplier,weatherMayChange:modifiers.weatherMayChange===true,skillEffects:modifiers.skillEffects.flatMap((effect)=>
    (effect.reason==="snapshot"||effect.reason==="conditionNotMet")
      ? [{...effect,reason:effect.reason,weatherDependent:effect.weatherDependent===true}]
      : [])};
}

function SkillPreviewSection({mascot,preview,state}:{mascot?:Mascot;preview?:SkillPreview;state:"idle"|"loading"|"unavailable"}) {
  const {t}=useTranslation();
  return <section className={styles.skillPreview} aria-busy={state==="loading"}>
    <h3>{t("send.skillPreview.title")}</h3>
    {state==="loading"?<p>{t("send.skillPreview.loading")}</p>:null}
    {state==="unavailable"?<p>{t("send.skillPreview.unavailable")}</p>:null}
    {preview?<ul>{preview.skillEffects.map((effect)=>{const skill=mascot?.skills.find((candidate)=>candidate.id===effect.skillId);return <li key={effect.skillId}><strong>{skill?t(skill.nameKey):effect.skillId}</strong><span>{effect.state==="active"?t(effect.weatherDependent?"send.skillPreview.weatherDependent":"send.skillPreview.active"):t("send.skillPreview.inactive")}</span>{effect.impact?<small>{formatSkillImpact(effect.impact)}</small>:null}<small>{t(`send.skillPreview.reasons.${effect.reason}` as TranslationKey)}</small></li>})}</ul>:null}
    {preview?.weatherMayChange?<p className={styles.hint}>{t("send.skillPreview.weatherNotice")}</p>:null}
  </section>;
}

function formatSkillImpact(impact:{kind:string;value:number;duration?:number}) {
  if(impact.kind==="preparationMinutes")return `${impact.value.toFixed(1)} min`;
  const value=`${impact.value>=0?"+":""}${Math.round(impact.value*1000)/10}%`;
  return impact.duration===undefined?value:`${value} · +${Math.round(impact.duration*1000)/10}%`;
}

function formatDurationHours(durationHours: number) {
  if (!Number.isFinite(durationHours) || durationHours <= 0) {
    return "0m";
  }

  const totalMinutes = Math.ceil(durationHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatMinutes(minutes: number) {
  return `${Math.round(minutes)}m`;
}

function formatMultiplierBonus(multiplier: number) {
  return `+${Math.round((multiplier - 1) * 100)}%`;
}

function getRouteDistance(friend: FriendProfile, originLatitude?: number, originLongitude?: number) {
  const coordinates = getFriendCoordinates(friend);
  return coordinates && Number.isFinite(originLatitude) && Number.isFinite(originLongitude)
    ? haversineDistanceKm({ latitude: originLatitude!, longitude: originLongitude! }, coordinates)
    : 0;
}

function getMascotRouteEffect(
  mascot: Mascot,
  modifiers: MascotTravelModifiers | undefined,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (!modifiers) {
    return t(mascot.trait.descriptionKey);
  }

  const traitName = t(mascot.trait.nameKey);

  if (mascot.trait.effect === "fastReturn") {
    return `${traitName}: ${t("send.effectFastReturn")}`;
  }

  if (mascot.trait.effect === "rareFind") {
    return `${traitName}: ${t("send.effectDiscoveryReach")} ${formatMultiplierBonus(modifiers.discoveryRadiusMultiplier)}`;
  }

  if (mascot.trait.effect !== "deliveryReward") {
    return `${traitName}: ${t(mascot.trait.descriptionKey)}`;
  }

  return `${traitName}: ${t(
    modifiers.isLongRoute ? "send.effectSafeLongRoute" : "send.effectSafeShortRoute",
  )}`;
}

function getInitialMascotId(mascots: Mascot[], requestedMascotId: string | null) {
  return mascots.some((mascot) => mascot.id === requestedMascotId)
    ? requestedMascotId ?? mascots[0]?.id
    : mascots[0]?.id;
}

function getInitialFriendId(friends: FriendProfile[], requestedFriendId: string | null) {
  return friends.some((friend) => friend.id === requestedFriendId)
    ? requestedFriendId ?? friends[0]?.id
    : friends[0]?.id;
}
