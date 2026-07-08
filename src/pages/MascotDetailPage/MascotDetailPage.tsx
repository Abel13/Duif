import { Navigate, useParams } from "react-router-dom";

import {
  MascotBottomNav,
} from "../../components/mascot/MascotBottomNav";
import { MascotEquipmentGrid } from "../../components/mascot/MascotEquipmentGrid";
import { MascotPortrait } from "../../components/mascot/MascotPortrait";
import { MascotSelector } from "../../components/mascot/MascotSelector";
import { MascotSkillsPanel } from "../../components/mascot/MascotSkillsPanel";
import { MascotStatsPanel } from "../../components/mascot/MascotStatsPanel";
import { MascotTraitCard } from "../../components/mascot/MascotTraitCard";
import { MascotTravelCard } from "../../components/mascot/MascotTravelCard";
import { getMascotById, starterMascots } from "../../game";
import { useTranslation } from "../../i18n";
import { SketchPanel, StampButton } from "../../components/ui";
import styles from "./MascotDetailPage.module.css";

const defaultMascotId = "mascot-nuvem";

export function MascotDetailPage() {
  const { mascotId } = useParams();
  const mascot = getMascotById(mascotId ?? defaultMascotId);
  const { t } = useTranslation();

  if (!mascot) {
    return <Navigate replace to={`/mascots/${defaultMascotId}`} />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <MascotSelector mascots={starterMascots} selectedMascotId={mascot.id} />
        </aside>

        <section className={styles.content} aria-label={t("mascot.selectedMascot")}>
          <div className={styles.hero}>
            <SketchPanel eyebrow={t(mascot.speciesKey)} title={mascot.name}>
              <MascotPortrait mascot={mascot} />
              <div className={styles.heroActions}>
                <StampButton>{t("mascot.train")}</StampButton>
                <StampButton variant="secondary">{t("mascot.viewTrip")}</StampButton>
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

          <MascotBottomNav />
        </section>
      </div>
    </main>
  );
}
