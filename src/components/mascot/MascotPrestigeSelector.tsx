import { useState } from "react";
import type { Mascot } from "../../game";
import { useTranslation } from "../../i18n";
import { selectMascotPrestigeBorder } from "../../integrations/supabase/flightProgression";
import styles from "./MascotPrestigeSelector.module.css";
import { MascotPrestigeMedallion } from "./MascotPrestigeMedallion";

type MascotPrestigeSelectorProps = {
  mascot: Mascot;
  onChanged: () => void;
};

export function MascotPrestigeSelector({ mascot, onChanged }: MascotPrestigeSelectorProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const state = mascot.flightState;

  if (!state) return <p>{t("common.unavailable")}</p>;

  const handleSelect = async (catalogKey: string) => {
    setBusy(true);
    setError(false);
    try {
      await selectMascotPrestigeBorder(mascot.id, catalogKey);
      onChanged();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.selector}>
      <p>{state.functionalCapReached ? t("mascot.flightCapReached" as never) : t("mascot.nextFlightMilestone" as never)}</p>
      <div className={styles.grid}>
        {state.borders.map((border) => (
          <button
            aria-pressed={border.selected}
            disabled={!border.unlocked || busy}
            key={border.catalogKey}
            onClick={() => void handleSelect(border.catalogKey)}
            type="button"
          >
            <MascotPrestigeMedallion alt={t(border.nameKey)} borderAssetKey={border.assetKey} portraitAssetKey={mascot.appearance.portraitAssetKey} size="medium" />
            <strong>{t(border.nameKey)}</strong>
            <small>{t(border.descriptionKey)}</small>
            {!border.unlocked ? <em>{t("mascot.unlockAtLevel" as never).replace("{level}", String(border.minimumLevel))}</em> : null}
          </button>
        ))}
      </div>
      {error ? <p className={styles.error}>{t("common.unavailable")}</p> : null}
    </div>
  );
}
