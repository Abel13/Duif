import { useMemo, useState } from "react";

import { MascotBottomNav } from "../../components/mascot/MascotBottomNav";
import { ItemCard, PaperTab, SketchPanel } from "../../components/ui";
import {
  getInventoryItemsByCategory,
  getInventorySummary,
  inventoryCategories,
  type InventoryCategory,
  type InventoryItem,
} from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./InventoryAlbumPage.module.css";

const emptySlotCount = 4;

export function InventoryAlbumPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>("all");
  const items = useMemo(() => getInventoryItemsByCategory(selectedCategory), [selectedCategory]);
  const summary = useMemo(() => getInventorySummary(items), [items]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("inventory.eyebrow")} title={t("inventory.title")}>
          <p className={styles.subtitle}>{t("inventory.subtitle")}</p>
        </SketchPanel>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <SketchPanel title={t("inventory.categoriesLabel")} variant="note">
              <div className={styles.tabs} role="list">
                {inventoryCategories.map((category) => (
                  <PaperTab
                    active={category === selectedCategory}
                    aria-label={t(`inventory.categories.${category}`)}
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {t(`inventory.categories.${category}`)}
                  </PaperTab>
                ))}
              </div>
            </SketchPanel>

            <SketchPanel title={t("inventory.raritySummary")}>
              <dl className={styles.summary}>
                <SummaryRow label={t("inventory.collectedTotal")} value={`${summary.total}`} />
                <SummaryRow label={t("inventory.equippedTotal")} value={`${summary.equipped}`} />
                <SummaryRow
                  label={t("equipment.rarity.common")}
                  value={`${summary.rarityCounts.common}`}
                />
                <SummaryRow
                  label={t("equipment.rarity.uncommon")}
                  value={`${summary.rarityCounts.uncommon}`}
                />
                <SummaryRow
                  label={t("equipment.rarity.rare")}
                  value={`${summary.rarityCounts.rare}`}
                />
              </dl>
            </SketchPanel>
          </aside>

          <section className={styles.album} aria-label={t("inventory.title")}>
            {items.map((item) => (
              <InventoryCard item={item} key={item.id} />
            ))}
            {Array.from({ length: emptySlotCount }, (_, index) => (
              <EmptySlot key={`empty-slot-${index}`} />
            ))}
          </section>
        </div>
        <MascotBottomNav />
      </div>
    </main>
  );
}

function InventoryCard({ item }: { item: InventoryItem }) {
  const { t } = useTranslation();
  const metaParts = [
    t(`inventory.categories.${item.category}`),
    item.equipped ? t("mascot.equipped") : t("mascot.notEquipped"),
  ];

  return (
    <ItemCard
      label={t(`equipment.rarity.${item.rarity}`)}
      title={t(item.nameKey)}
      description={t(item.descriptionKey)}
      meta={metaParts.join(" / ")}
      selected={item.equipped}
    >
      <div className={styles.itemStamp} data-rarity={item.rarity}>
        <span>{t("inventory.source")}</span>
        <strong>{item.sourceKey ? t(item.sourceKey) : t("common.unavailable")}</strong>
      </div>
    </ItemCard>
  );
}

function EmptySlot() {
  const { t } = useTranslation();

  return (
    <article className={styles.emptySlot}>
      <div className={styles.emptyMark} aria-hidden="true" />
      <h3>{t("inventory.emptySlotTitle")}</h3>
      <p>{t("inventory.emptySlotDescription")}</p>
    </article>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
