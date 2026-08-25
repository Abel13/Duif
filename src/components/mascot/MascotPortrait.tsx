import type { CSSProperties } from "react";

import { assetKeys, type Mascot } from "../../game";
import { useOfficialAssets } from "../../integrations/supabase/OfficialAssetProvider";
import { useTranslation } from "../../i18n";
import { AssetImage } from "../ui";
import { MascotPrestigeMedallion } from "./MascotPrestigeMedallion";
import styles from "./MascotPortrait.module.css";

type MascotPortraitProps = {
  mascot: Mascot;
};

export function MascotPortrait({ mascot }: MascotPortraitProps) {
  const { t } = useTranslation();
  const { resolve } = useOfficialAssets();
  const postalMarkPath = resolve(assetKeys.postalMarks.postalCancel);
  const portraitStyle = {
    "--mascot-primary": mascot.appearance.primaryColor,
    "--mascot-accent": mascot.appearance.accentColor,
    "--portrait-postal-mark": postalMarkPath ? `url(${postalMarkPath})` : "none",
  } as CSSProperties;
  const hasPortraitAsset = Boolean(mascot.appearance.portraitAssetKey);
  const prestige=mascot.flightState?.borders.find((border)=>border.selected);

  return (
    <section className={styles.portrait} data-prestige={prestige?.catalogKey} style={portraitStyle} aria-label={`${t("mascot.visualPreview")}${prestige?` — ${t(prestige.nameKey)}`:""}`}>
      <span className={styles.postmark} aria-hidden="true" />
      <div className={styles.sheet}>
        {prestige?<MascotPrestigeMedallion alt={`${t(mascot.appearance.portraitPlaceholderKey)} — ${t(prestige.nameKey)}`} borderAssetKey={prestige.assetKey} className={styles.prestigeMedallion} portraitAssetKey={mascot.appearance.portraitAssetKey} size="large"/>:<AssetImage
          alt={t(mascot.appearance.portraitPlaceholderKey)}
          className={styles.assetFrame}
          height={320}
          loading="eager"
          assetKey={mascot.appearance.portraitAssetKey}
          width={320}
        >
          <div className={styles.figure}>
            <span className={styles.wing} aria-hidden="true" />
            <span className={styles.mark}>{mascot.name.slice(0, 1)}</span>
            <span className={styles.badge} aria-hidden="true" />
          </div>
        </AssetImage>}
        {!hasPortraitAsset && (
          <p className={styles.caption}>{t(mascot.appearance.portraitPlaceholderKey)}</p>
        )}
      </div>
    </section>
  );
}
