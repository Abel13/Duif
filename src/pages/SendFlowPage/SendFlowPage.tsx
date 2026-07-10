import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { RoutePreview } from "../../components/map/RoutePreview";
import { ItemCard, SketchPanel, StampButton } from "../../components/ui";
import {
  createMockDeliveryFromSelection,
  currentPlayer,
  estimateMascotSpeedKmh,
  estimateTravelDurationHours,
  formatRemainingTime,
  getDeliveryStatus,
  getTravelProgress,
  haversineDistanceKm,
  type CorrespondenceOption,
  type Delivery,
  type FriendProfile,
  type Mascot,
  type SendFlowSelection,
} from "../../game";
import { useSendFlowData } from "../../game/useSendFlowData";
import { useTranslation } from "../../i18n";
import { createAuthenticatedDeliveryFromSelection } from "../../integrations/supabase/authenticatedSendFlow";
import styles from "./SendFlowPage.module.css";

const defaultMascotId = "mascot-nuvem";

type ConfirmedSend = {
  delivery: Delivery;
  friend: FriendProfile;
  mascot: Mascot;
  correspondence: CorrespondenceOption;
};

export function SendFlowPage() {
  const { t } = useTranslation();
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
    correspondenceId: availableCorrespondence[0]?.id,
  });
  const [confirmedSend, setConfirmedSend] = useState<ConfirmedSend | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);

  useEffect(() => {
    setSelection({
      correspondenceId: availableCorrespondence[0]?.id,
      friendId: getInitialFriendId(friends, requestedFriendId),
      mascotId: getInitialMascotId(mascots, requestedMascotId),
    });
    setConfirmedSend(undefined);
    setHasSubmitError(false);
  }, [availableCorrespondence, friends, mascots, requestedFriendId, requestedMascotId]);

  const selectedFriend = friends.find((friend) => friend.id === selection.friendId);
  const selectedMascot = mascots.find((mascot) => mascot.id === selection.mascotId);
  const selectedCorrespondence = availableCorrespondence.find(
    (option) => option.id === selection.correspondenceId,
  );
  const isSelectionComplete = Boolean(selectedFriend && selectedMascot && selectedCorrespondence);

  const estimate = useMemo(() => {
    if (!selectedFriend || !selectedMascot) {
      return undefined;
    }

    const distanceKm = haversineDistanceKm(currentPlayer.homeBase, selectedFriend.location);
    const speedKmh = estimateMascotSpeedKmh(selectedMascot);

    return {
      distanceKm,
      durationHours: estimateTravelDurationHours(distanceKm, speedKmh),
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
          friend: selectedFriend,
          mascot: selectedMascot,
        });

        if (delivery) {
          setConfirmedSend({
            correspondence: selectedCorrespondence,
            delivery,
            friend: selectedFriend,
            mascot: selectedMascot,
          });
        }
        return;
      }

      const result = createMockDeliveryFromSelection(selection);

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
    : isSelectionComplete
      ? t("send.readyHint")
      : t("send.incompleteHint");

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("send.eyebrow")} title={t("send.title")}>
          <p className={styles.subtitle}>{t("send.subtitle")}</p>
        </SketchPanel>

        <div className={styles.flowGrid}>
          <ChoiceSection title={t("send.chooseFriend")}>
            {friends.map((friend) => (
              <div
                className={styles.optionFrame}
                data-selected={friend.id === selection.friendId || undefined}
                key={friend.id}
              >
                <ItemCard
                  label={t(friend.location.labelKey)}
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
                  selected={option.id === selection.correspondenceId}
                />
                <button
                  aria-label={`${t("send.selectedCorrespondence")}: ${t(option.nameKey)}`}
                  className={styles.optionButton}
                  type="button"
                  onClick={() => updateSelection({ correspondenceId: option.id })}
                />
              </div>
            ))}
          </ChoiceSection>

          <SketchPanel title={confirmedSend ? t("send.confirmationTitle") : t("send.summary")} variant="note">
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
                    fallback={t("common.unavailable")}
                    label={t("mascot.distance")}
                    value={
                      estimate ? `${estimate.distanceKm} ${t("units.kilometers")}` : undefined
                    }
                  />
                  <SummaryRow
                    fallback={t("common.unavailable")}
                    label={t("send.estimatedDuration")}
                    value={estimate ? formatDurationHours(estimate.durationHours) : undefined}
                  />
                </dl>
                <StampButton
                  disabled={!isSelectionComplete || isSubmitting || isSendFlowLoading}
                  onClick={handleConfirmSend}
                >
                  {isSubmitting ? t("send.sending") : t("send.sendButton")}
                </StampButton>
              </div>
            )}
          </SketchPanel>
        </div>
      </div>
    </main>
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
  value?: string;
  fallback?: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value ?? fallback}</dd>
    </div>
  );
}

function ConfirmationPanel({
  confirmedSend,
  onReset,
}: {
  confirmedSend: ConfirmedSend;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const { delivery, friend, mascot, correspondence } = confirmedSend;
  const status = getDeliveryStatus(delivery);
  const progress = getTravelProgress(delivery);
  const remainingTime = formatRemainingTime(delivery);
  const distanceLabel = `${delivery.distanceKm} ${t("units.kilometers")}`;

  return (
    <div className={styles.confirmation}>
      <p className={styles.hint}>{t("send.confirmationDescription")}</p>
      <RoutePreview
        originLabel={t(delivery.origin.labelKey)}
        destinationLabel={t(delivery.destination.labelKey)}
        progress={progress}
        statusLabel={t(`delivery.status.${status}`)}
        remainingTime={remainingTime}
        distanceLabel={distanceLabel}
      />
      <dl className={styles.summaryList}>
        <SummaryRow label={t("send.selectedFriend")} value={friend.name} />
        <SummaryRow label={t("send.selectedMascot")} value={mascot.name} />
        <SummaryRow label={t("send.selectedCorrespondence")} value={t(correspondence.nameKey)} />
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

function getInitialMascotId(mascots: Mascot[], requestedMascotId: string | null) {
  return mascots.some((mascot) => mascot.id === requestedMascotId)
    ? requestedMascotId ?? mascots[0]?.id
    : (mascots[0]?.id ?? defaultMascotId);
}

function getInitialFriendId(friends: FriendProfile[], requestedFriendId: string | null) {
  return friends.some((friend) => friend.id === requestedFriendId)
    ? requestedFriendId ?? friends[0]?.id
    : friends[0]?.id;
}
