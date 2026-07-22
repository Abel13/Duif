import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppBottomNav, PageShell } from "../../components/layout";
import { MascotEquipmentGrid } from "../../components/mascot/MascotEquipmentGrid";
import { MascotPortraitNavigator } from "../../components/mascot/MascotPortraitNavigator";
import { MascotSkillsPanel } from "../../components/mascot/MascotSkillsPanel";
import { MascotStatsPanel } from "../../components/mascot/MascotStatsPanel";
import { MascotTraitCard } from "../../components/mascot/MascotTraitCard";
import { MascotTravelCard } from "../../components/mascot/MascotTravelCard";
import {
  getDeliveryStatus,
  getNestMascotNeighbors,
  readStoredNestMascotId,
  resolveMascotDeliveryAction,
  resolveNestMascotId,
  writeStoredNestMascotId,
} from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { useTranslation } from "../../i18n";
import { SketchPanel, StampButton } from "../../components/ui";
import styles from "./MascotDetailPage.module.css";

export function MascotDetailPage() {
  const { mascotId } = useParams();
  const navigate = useNavigate();
  const { isLoading, mascots } = useMascotCatalog();
  const { t } = useTranslation();
  const storedMascotId = useMemo(
    () => readStoredNestMascotId(typeof window === "undefined" ? undefined : window.localStorage),
    [],
  );
  const resolvedMascotId = resolveNestMascotId(mascots, mascotId, storedMascotId);
  const mascotIndex = mascots.findIndex((candidate) => candidate.id === resolvedMascotId);
  const mascot = mascotIndex >= 0 ? mascots[mascotIndex] : undefined;

  useEffect(() => {
    if (isLoading) return;
    if (!resolvedMascotId) {
      writeStoredNestMascotId(undefined, window.localStorage);
      return;
    }
    writeStoredNestMascotId(resolvedMascotId, window.localStorage);
    if (mascotId !== resolvedMascotId) {
      navigate(`/mascots/${resolvedMascotId}`, { replace: true });
    }
  }, [isLoading, mascotId, navigate, resolvedMascotId]);

  if (isLoading) {
    return (
      <PageShell hasBottomNav>
        <div className={styles.shell}>
          <SketchPanel title={t("mascot.myMascots")}>
            <p className={styles.dataNotice}>{t("mascot.loadingCatalog")}</p>
          </SketchPanel>
        </div>
        <AppBottomNav />
      </PageShell>
    );
  }

  if (!mascot) {
    return (
      <PageShell hasBottomNav>
        <div className={styles.shell}>
          <SketchPanel title={t("mascot.myMascots")}>
            <p className={styles.dataNotice}>{t("common.unavailable")}</p>
          </SketchPanel>
        </div>
        <AppBottomNav />
      </PageShell>
    );
  }

  const { previous: previousMascot, next: nextMascot } = getNestMascotNeighbors(mascots, mascot.id);
  const selectedMascot = mascot;
  const deliveryAction = resolveMascotDeliveryAction(selectedMascot.currentDelivery);

  function handleDeliveryAction() {
    if (deliveryAction === "send") {
      navigate(`/send?mascotId=${selectedMascot.id}`);
      return;
    }

    if (deliveryAction === "collect" && selectedMascot.currentDelivery) {
      navigate(`/rewards/${selectedMascot.currentDelivery.id}`);
      return;
    }

    navigate(`/map?mascotId=${selectedMascot.id}`);
  }

  const deliveryActionLabel = deliveryAction === "send"
    ? t("send.startAction")
    : deliveryAction === "collect"
      ? t("rewards.collectButton")
      : t("mascot.viewTrip");

  return (
    <PageShell hasBottomNav>
      <div className={styles.shell}>
        <section
          aria-busy={false}
          aria-label={t("mascot.selectedMascot")}
          className={styles.content}
        >
          <div className={styles.hero}>
            <SketchPanel className={styles.heroPanel} eyebrow={t(mascot.speciesKey)} title={mascot.name}>
              <div className={styles.heroLabels}>
                <span>
                  {t("mascot.level")} {mascot.level}
                </span>
                {mascot.currentDelivery && (
                  <span>{t(`delivery.status.${getDeliveryStatus(mascot.currentDelivery)}`)}</span>
                )}
              </div>
              <MascotPortraitNavigator
                hasNext={Boolean(nextMascot)}
                hasPrevious={Boolean(previousMascot)}
                mascot={mascot}
                nextLabel={t("map.nextMascot")}
                previousLabel={t("map.previousMascot")}
                onNext={() => nextMascot && navigate(`/mascots/${nextMascot.id}`)}
                onPrevious={() => previousMascot && navigate(`/mascots/${previousMascot.id}`)}
              />
              <div className={styles.heroActions}>
                <StampButton onClick={handleDeliveryAction}>{deliveryActionLabel}</StampButton>
                <StampButton onClick={() => navigate("/mailbox")} variant="secondary">{t("mailbox.open")}</StampButton>
              </div>
            </SketchPanel>
          </div>

          <div className={styles.mainGrid}>
            <SketchPanel title={t("mascot.attributes")}>
              <MascotStatsPanel mascot={mascot} />
            </SketchPanel>

            <MascotTraitCard trait={mascot.trait} />

            <SketchPanel title={t("mascot.equipment")}>
              <MascotEquipmentGrid equipment={mascot.equipment} />
            </SketchPanel>

            <MascotTravelCard delivery={mascot.currentDelivery} />

            <SketchPanel title={t("mascot.customization")}>
              <div className={styles.swatches} aria-label={t("mascot.visualPreview")}>
                <span style={{ background: mascot.appearance.primaryColor }} />
                <span style={{ background: mascot.appearance.accentColor }} />
              </div>
            </SketchPanel>

            <SketchPanel title={t("mascot.skills")}>
              <MascotSkillsPanel skills={mascot.skills} />
            </SketchPanel>
          </div>

        </section>
      </div>
      <AppBottomNav />
    </PageShell>
  );
}
