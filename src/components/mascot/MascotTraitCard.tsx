import type { MascotTrait } from "../../game";
import { useTranslation } from "../../i18n";
import { SketchPanel } from "../ui";

type MascotTraitCardProps = {
  trait: MascotTrait;
};

export function MascotTraitCard({ trait }: MascotTraitCardProps) {
  const { t } = useTranslation();

  return (
    <SketchPanel eyebrow={t("mascot.specialTrait")} title={t(trait.nameKey)} variant="note">
      <p>{t(trait.descriptionKey)}</p>
    </SketchPanel>
  );
}
