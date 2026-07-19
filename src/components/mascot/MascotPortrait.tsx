import type { CSSProperties } from "react";

import { assetKeys, type Mascot } from "../../game";
import { useOfficialAssets } from "../../integrations/supabase/OfficialAssetProvider";
import { useTranslation } from "../../i18n";
import { AssetImage } from "../ui";
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

  return (
    <section className={styles.portrait} style={portraitStyle} aria-label={t("mascot.visualPreview")}>
      <span className={styles.postmark} aria-hidden="true" />
      <div className={styles.sheet}>
        <AssetImage
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
        </AssetImage>
        {!hasPortraitAsset && (
          <p className={styles.caption}>{t(mascot.appearance.portraitPlaceholderKey)}</p>
        )}
      </div>
    </section>
  );
}
