import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { MobileTopBar, PageShell } from "../../components/layout";
import { RoutePreview } from "../../components/map/RoutePreview";
import { ItemCard, SketchPanel, StampButton } from "../../components/ui";
import {
  createMockDeliveryFromSelection,
  createDefaultCorrespondenceContent,
  currentPlayer,
  deriveMascotTravelModifiers,
  estimateMascotSpeedKmh,
  estimateTravelDurationHours,
  formatRemainingTime,
  getCorrespondenceContentCount,
  getFriendCoordinates,
  getFriendLocationLabel,
  getDeliveryStatus,
  getTravelProgress,
  haversineDistanceKm,
  isCorrespondenceContentValid,
  LETTER_MAX_CHARACTERS,
  mockPostcardOptions,
  mockStickerOptions,
  POSTCARD_MAX_CHARACTERS,
  STICKER_MAX_SELECTION,
  type CorrespondenceContent,
  type CorrespondenceOption,
  type Delivery,
  type FriendProfile,
  type Mascot,
  type MascotTravelModifiers,
  type SendFlowSelection,
} from "../../game";
import { useSendFlowData } from "../../game/useSendFlowData";
import { useTranslation } from "../../i18n";
import { createAuthenticatedDeliveryFromSelection } from "../../integrations/supabase/authenticatedSendFlow";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import styles from "./SendFlowPage.module.css";

const isMvpCorrespondence = (option: CorrespondenceOption) => option.type === "letter";

type ConfirmedSend = {
  delivery: Delivery;
  friend: FriendProfile;
  mascot: Mascot;
  correspondence: CorrespondenceOption;
  content: CorrespondenceContent;
};

export function SendFlowPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedMascotId = searchParams.get("mascotId");
  const requestedFriendId = searchParams.get("friendId");
  const {
    data: sendFlowData,
    isAuthenticatedSource,
    isLoading: isSendFlowLoading,
  } = useSendFlowData();
  const { friends, mascots, correspondenceOptions: availableCorrespondence } = sendFlowData;
  const initialMascotId = getInitialMascotId(mascots, requestedMascotId);
  const initialFriendId = getInitialFriendId(friends, requestedFriendId);
  const [selection, setSelection] = useState<SendFlowSelection>({
    friendId: initialFriendId,
    mascotId: initialMascotId,
    correspondenceId: availableCorrespondence.find(isMvpCorrespondence)?.id,
  });
  const [content, setContent] = useState<CorrespondenceContent>(() =>
    createDefaultCorrespondenceContent(availableCorrespondence.find(isMvpCorrespondence)?.type ?? "letter"),
  );
  const [confirmedSend, setConfirmedSend] = useState<ConfirmedSend | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);

  useEffect(() => {
    const nextCorrespondence = availableCorrespondence.find(isMvpCorrespondence);

    setSelection({
      correspondenceId: nextCorrespondence?.id,
      friendId: getInitialFriendId(friends, requestedFriendId),
      mascotId: getInitialMascotId(mascots, requestedMascotId),
    });
    setContent(createDefaultCorrespondenceContent(nextCorrespondence?.type ?? "letter"));
    setConfirmedSend(undefined);
    setHasSubmitError(false);
  }, [availableCorrespondence, friends, mascots, requestedFriendId, requestedMascotId]);

  const selectedFriend = friends.find((friend) => friend.id === selection.friendId);
  const selectedMascot = mascots.find((mascot) => mascot.id === selection.mascotId);
  const selectedCorrespondence = availableCorrespondence.find(
    (option) => option.id === selection.correspondenceId,
  );
  const isSelectionComplete = Boolean(selectedFriend && selectedMascot && selectedCorrespondence);
  const isContentValid = isCorrespondenceContentValid(content);

  const estimate = useMemo(() => {
    if (!selectedFriend || !selectedMascot) {
      return undefined;
    }

    const selectedFriendCoordinates = getFriendCoordinates(selectedFriend);

    if (!selectedFriendCoordinates) {
      return undefined;
    }

    const distanceKm = haversineDistanceKm(currentPlayer.homeBase, selectedFriendCoordinates);
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

  function updateSelection(nextSelection: SendFlowSelection) {
    setSelection((currentSelection) => ({
      ...currentSelection,
      ...nextSelection,
    }));
    setConfirmedSend(undefined);
    setHasSubmitError(false);
  }

  function handleCorrespondenceSelect(option: CorrespondenceOption) {
    if (!isMvpCorrespondence(option)) return;
    updateSelection({ correspondenceId: option.id });
    setContent(createDefaultCorrespondenceContent(option.type));
  }

  async function handleConfirmSend() {
    if (!selectedFriend || !selectedMascot || !selectedCorrespondence || isSubmitting) {
      return;
    }

    setHasSubmitError(false);
    setIsSubmitting(true);

    try {
      if (isAuthenticatedSource) {
        const delivery = await createAuthenticatedDeliveryFromSelection({
          correspondence: selectedCorrespondence,
          content,
          friend: selectedFriend,
          mascot: selectedMascot,
        });

        if (delivery) {
          setConfirmedSend({
            correspondence: selectedCorrespondence,
            content,
            delivery,
            friend: selectedFriend,
            mascot: selectedMascot,
          });
        }
        return;
      }

      const result = createMockDeliveryFromSelection(selection, content);

      if (result) {
        setConfirmedSend(result);
      }
    } catch {
      setHasSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setConfirmedSend(undefined);
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

  return (
    <PageShell hasTopBar>
      <MobileTopBar backTo={backTo} title={t("send.title")} />
      <div className={styles.shell}>
        <p className={styles.subtitle}>{t("send.subtitle")}</p>

        <div className={styles.flowGrid}>
          <ChoiceSection title={t("send.chooseFriend")}>
            {friends.map((friend) => (
              <div
                className={styles.optionFrame}
                data-selected={friend.id === selection.friendId || undefined}
                key={friend.id}
              >
                <ItemCard
                  label={getFriendLocationLabel(friend.location, t)}
                  title={friend.name}
                  description={friend.favoriteNoteKey ? t(friend.favoriteNoteKey) : undefined}
                  selected={friend.id === selection.friendId}
                />
                <button
                  aria-label={`${t("send.selectedFriend")}: ${friend.name}`}
                  className={styles.optionButton}
                  type="button"
                  onClick={() => updateSelection({ friendId: friend.id })}
                />
              </div>
            ))}
          </ChoiceSection>

          <ChoiceSection title={t("send.chooseMascot")}>
            {mascots.map((mascot) => (
              <div
                className={styles.optionFrame}
                data-selected={mascot.id === selection.mascotId || undefined}
                key={mascot.id}
              >
                <ItemCard
                  label={t(mascot.speciesKey)}
                  title={mascot.name}
                  meta={`${t("mascot.level")} ${mascot.level}`}
                  description={getMascotRouteEffect(
                    mascot,
                    selectedFriend
                      ? deriveMascotTravelModifiers(mascot, {
                          distanceKm: getRouteDistance(selectedFriend),
                        })
                      : undefined,
                    t,
                  )}
                  selected={mascot.id === selection.mascotId}
                />
                <button
                  aria-label={`${t("send.selectedMascot")}: ${mascot.name}`}
                  className={styles.optionButton}
                  type="button"
                  onClick={() => updateSelection({ mascotId: mascot.id })}
                />
              </div>
            ))}
          </ChoiceSection>

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
                  meta={isMvpCorrespondence(option) ? undefined : t("send.availableLater")}
                  selected={option.id === selection.correspondenceId}
                />
                <button
                  aria-label={`${t("send.selectedCorrespondence")}: ${t(option.nameKey)}`}
                  className={styles.optionButton}
                  disabled={!isMvpCorrespondence(option)}
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
              senderLocation={profile?.postal_base_city?.trim() || t("common.unavailable")}
              senderName={profile?.display_name?.trim() || t("common.unavailable")}
            />
          </SketchPanel>

          <SketchPanel
            className={styles.summaryPanel}
            title={confirmedSend ? t("send.confirmationTitle") : t("send.summary")}
            variant="note"
          >
            {confirmedSend ? (
              <ConfirmationPanel confirmedSend={confirmedSend} onReset={handleReset} />
            ) : (
              <div className={styles.summary}>
                <p className={styles.hint}>{summaryHint}</p>
                {hasSubmitError && <p className={styles.error}>{t("send.errorMessage")}</p>}
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
                  <SummaryRow
                    fallback={t("send.content.emptyPreview")}
                    label={t("send.contentPreview")}
                    value={<CorrespondenceContentPreview content={content} />}
                  />
                  {estimate ? <>
                    <SummaryRow label={t("mascot.distance")} value={`${estimate.distanceKm} ${t("units.kilometers")}`} />
                    <SummaryRow label={t("send.preparationTime")} value={formatMinutes(estimate.modifiers.preparationMinutes)} />
                    <SummaryRow label={t("send.outboundDuration")} value={formatDurationHours(estimate.outboundDurationHours)} />
                    <SummaryRow label={t("send.returnDuration")} value={formatDurationHours(estimate.returnDurationHours)} />
                  </> : null}
                </dl>
                <StampButton
                  disabled={!isSelectionComplete || !isContentValid || isSubmitting || isSendFlowLoading}
                  onClick={handleConfirmSend}
                >
                  {isSubmitting ? t("send.sending") : t("send.sendButton")}
                </StampButton>
              </div>
            )}
          </SketchPanel>
        </div>
      </div>
    </PageShell>
  );
}

function ChoiceSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SketchPanel title={title}>
      <div className={styles.options}>{children}</div>
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
  senderLocation,
  senderName,
}: {
  content: CorrespondenceContent;
  onChange: (content: CorrespondenceContent) => void;
  senderLocation: string;
  senderName: string;
}) {
  const { locale, t } = useTranslation();
  const [isLetterPreviewOpen, setIsLetterPreviewOpen] = useState(false);

  if (content.type === "postcard") {
    return (
      <div className={styles.composer}>
        <fieldset className={styles.fieldset}>
          <legend>{t("send.content.postcardVariantLabel")}</legend>
          <div className={styles.segmented}>
            {mockPostcardOptions.map((option) => (
              <button
                className={styles.segment}
                data-active={content.postcardVariant === option.id || undefined}
                key={option.id}
                onClick={() => onChange({ ...content, postcardVariant: option.id })}
                type="button"
              >
                {t(option.nameKey)}
              </button>
            ))}
          </div>
        </fieldset>
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
            {mockStickerOptions.map((option) => {
              const isSelected = content.stickerIds.includes(option.id);

              return (
                <button
                  className={styles.segment}
                  data-active={isSelected || undefined}
                  key={option.id}
                  onClick={() => {
                    const stickerIds = isSelected
                      ? content.stickerIds.filter((stickerId) => stickerId !== option.id)
                      : [...content.stickerIds, option.id].slice(0, STICKER_MAX_SELECTION);
                    onChange({ ...content, stickerIds });
                  }}
                  type="button"
                >
                  {t(option.nameKey)}
                </button>
              );
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
      <LetterPreviewDialog
        dateLabel={new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date())}
        letterText={content.letterText}
        onClose={() => {
          setIsLetterPreviewOpen(false);
        }}
        open={isLetterPreviewOpen}
        senderLocation={senderLocation}
        senderName={senderName}
      />
    </div>
  );
}

function LetterPreviewDialog({
  dateLabel,
  letterText,
  onClose,
  open,
  senderLocation,
  senderName,
}: {
  dateLabel: string;
  letterText: string;
  onClose: () => void;
  open: boolean;
  senderLocation: string;
  senderName: string;
}) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => dialog.querySelector<HTMLButtonElement>("button")?.focus());
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
      aria-labelledby="letter-preview-title"
      className={styles.letterPreviewDialog}
      ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className={styles.letterPreviewBody}>
        <button className={styles.letterPreviewClose} type="button" onClick={onClose}>
          {t("send.closeLetterPreview")}
        </button>
        <article className={styles.letterPreviewPaper}>
          <header>
            <p>{senderLocation} · {dateLabel}</p>
            <h2 className={styles.visuallyHidden} id="letter-preview-title">{t("send.previewLetter")}</h2>
          </header>
          <p className={styles.letterPreviewText}>{letterText || t("send.content.emptyPreview")}</p>
          <footer>{senderName}</footer>
        </article>
      </div>
    </dialog>
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

function CorrespondenceContentPreview({ content }: { content: CorrespondenceContent }) {
  const { t } = useTranslation();

  if (content.type === "postcard") {
    const variant = mockPostcardOptions.find((option) => option.id === content.postcardVariant);
    return (
      <span>
        {variant ? t(variant.nameKey) : t("correspondence.postcard.name")}
        {content.postcardMessage ? ` / ${content.postcardMessage}` : ""}
      </span>
    );
  }

  if (content.type === "sticker") {
    const stickerNames = content.stickerIds
      .map((stickerId) => mockStickerOptions.find((option) => option.id === stickerId))
      .filter((option): option is (typeof mockStickerOptions)[number] => Boolean(option))
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
  onReset,
}: {
  confirmedSend: ConfirmedSend;
  onReset: () => void;
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
      <RoutePreview
        originLabel={t(delivery.origin.labelKey)}
        destinationLabel={getFriendLocationLabel(friend.location, t)}
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
          value={<CorrespondenceContentPreview content={content} />}
        />
        <SummaryRow label={t("mascot.status")} value={t(`delivery.status.${status}`)} />
      </dl>
      <div className={styles.actions}>
        <StampButton onClick={onReset}>{t("send.sendAnother")}</StampButton>
        <Link className={styles.returnLink} to={`/mascots/${mascot.id}`}>
          {t("send.backToMascot")}
        </Link>
      </div>
    </div>
  );
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

function getRouteDistance(friend: FriendProfile) {
  const coordinates = getFriendCoordinates(friend);
  return coordinates ? haversineDistanceKm(currentPlayer.homeBase, coordinates) : 0;
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
