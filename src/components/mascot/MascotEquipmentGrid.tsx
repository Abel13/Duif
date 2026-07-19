import type { EquipmentItem } from "../../game";
import { useTranslation } from "../../i18n";
import { AssetImage, ItemCard } from "../ui";
import styles from "./MascotEquipmentGrid.module.css";

type MascotEquipmentGridProps = {
  equipment: EquipmentItem[];
};

export function MascotEquipmentGrid({ equipment }: MascotEquipmentGridProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.grid}>
      {equipment.map((item) => (
        <ItemCard
          description={item.descriptionKey ? t(item.descriptionKey) : undefined}
          key={item.id}
          label={t(`equipment.rarity.${item.rarity}`)}
          meta={item.equipped ? t("mascot.equipped") : t("mascot.notEquipped")}
          selected={item.equipped}
          title={t(item.nameKey)}
        >
          <AssetImage
            alt={t(item.nameKey)}
            className={styles.assetFrame}
            height={160}
            assetKey={item.iconAssetKey}
            width={160}
          >
            <div className={styles.fallbackIcon} data-rarity={item.rarity}>
              <span>{t(item.nameKey).slice(0, 1)}</span>
            </div>
          </AssetImage>
        </ItemCard>
      ))}
    </div>
  );
}
