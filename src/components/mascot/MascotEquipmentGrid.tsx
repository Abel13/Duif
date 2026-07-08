import type { EquipmentItem } from "../../game";
import { useTranslation } from "../../i18n";
import { ItemCard } from "../ui";
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
        />
      ))}
    </div>
  );
}
