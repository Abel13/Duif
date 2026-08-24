import { useEffect, useMemo, useState } from "react";

import { AppBottomNav, PageShell } from "../../components/layout";
import { EquipmentArtwork } from "../../components/mascot/MascotLoadoutEditor";
import { AssetImage, InauguralPostcardDialog, ItemCard, SketchPanel } from "../../components/ui";
import {
  filterInventoryItemsByCategory,
  getInventoryCategoryCounts,
  getInventorySummary,
  groupInventoryItems,
  inventoryCategories,
  useInventoryData,
  type InventoryCategory,
  type GroupedInventoryItem,
  groupEquipmentInstances,
  useEquipmentData,
} from "../../game";
import { assetKeys } from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { fetchTutorialReturnArrival } from "../../integrations/supabase/tutorial";
import { repairEquipment } from "../../integrations/supabase/equipment";
import styles from "./InventoryAlbumPage.module.css";

const emptySlotCount = 4;

export function InventoryAlbumPage() {
  const { t } = useTranslation();
  const { onboarding, acknowledgeInauguralPostcardHint } = useAuth();
  const { mascots } = useMascotCatalog();
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>("all");
  const [postcardOpen, setPostcardOpen] = useState(false); const [completionAt,setCompletionAt]=useState<string | null>();
  const { items: inventoryItems } = useInventoryData();
  const { data: equipmentData, refresh: refreshEquipment } = useEquipmentData();
  const [repairingId,setRepairingId]=useState<string>();
  const [repairError,setRepairError]=useState(false);
  const groupedItems = useMemo(() => groupInventoryItems(inventoryItems), [inventoryItems]);
  const items = useMemo(
    () => filterInventoryItemsByCategory(groupedItems, selectedCategory),
    [groupedItems, selectedCategory],
  );
  const categoryCounts = useMemo(
    () => getInventoryCategoryCounts(inventoryItems),
    [inventoryItems],
  );
  const summary = useMemo(() => getInventorySummary(items), [items]);
  const hasInaugural=inventoryItems.some((item)=>item.thumbnailAssetKey===assetKeys.postcards.inauguralFront);
  useEffect(()=>{if(hasInaugural&&onboarding?.tutorial_delivery_id) void fetchTutorialReturnArrival(onboarding.tutorial_delivery_id).then(setCompletionAt).catch(()=>undefined);},[hasInaugural,onboarding?.tutorial_delivery_id]);

  async function handleRepair(instanceId: string) {
    setRepairingId(instanceId); setRepairError(false);
    try { await repairEquipment(instanceId); await refreshEquipment(); }
    catch { setRepairError(true); }
    finally { setRepairingId(undefined); }
  }

  return (
    <PageShell hasBottomNav>
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("inventory.eyebrow")} title={t("inventory.title")}>
          <p className={styles.subtitle}>{t("inventory.subtitle")}</p>
        </SketchPanel>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <SketchPanel title={t("inventory.categoriesLabel")} variant="note">
              <div className={styles.filters} aria-label={t("inventory.categoriesLabel")}>
                {inventoryCategories.map((category) => {
                  const label = t(`inventory.categories.${category}`);
                  const count = categoryCounts[category];
                  const isSelected = category === selectedCategory;

                  return (
                    <button
                      aria-label={`${label}: ${count}`}
                      aria-pressed={isSelected}
                      className={styles.filterButton}
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      type="button"
                    >
                      <span>{label}</span>
                      <strong>{count}</strong>
                    </button>
                  );
                })}
              </div>
            </SketchPanel>

            <SketchPanel title={t("inventory.raritySummary")}>
              <dl className={styles.summary}>
                <SummaryRow label={t("inventory.distinctTotal")} value={`${summary.distinctTotal}`} />
                <SummaryRow label={t("inventory.acquiredTotal")} value={`${summary.acquiredTotal}`} />
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
              <InventoryCard item={item} key={item.groupKey} onOpenPostcard={()=>setPostcardOpen(true)} />
            ))}
            {Array.from({ length: emptySlotCount }, (_, index) => (
              <EmptySlot key={`empty-slot-${index}`} />
            ))}
          </section>
        </div>
        <SketchPanel title={t("functionalEquipment.shopTitle")}>
          <div className={styles.equipmentGroups}>{Array.from(groupEquipmentInstances(equipmentData.instances).entries()).map(([catalogId,instances])=>{
            const catalog=equipmentData.catalog.find(item=>item.id===catalogId); if(!catalog)return null;
            return <article className={styles.equipmentGroup} key={catalogId}><EquipmentArtwork item={catalog}/><div><h3>{t(catalog.nameKey)}</h3><p>{instances.length} {t("functionalEquipment.instances")}</p><ul>{instances.map(instance=><li key={instance.id}><span>{instance.usesRemaining===undefined?t("functionalEquipment.available"):`${instance.usesRemaining}/${catalog.maxUses} ${t("functionalEquipment.uses")}`}</span>{instance.equippedMascotId?<small>{t("functionalEquipment.equippedBy")}: {mascots.find(m=>m.id===instance.equippedMascotId)?.name??t("common.unavailable")}</small>:null}{instance.usesRemaining===0?<button disabled={repairingId===instance.id} onClick={()=>void handleRepair(instance.id)} type="button">{repairingId===instance.id?t("functionalEquipment.repairing"):t("functionalEquipment.repair")}</button>:null}</li>)}</ul></div></article>;
          })}</div>
          {repairError?<p className={styles.repairError}>{t("functionalEquipment.repairError")}</p>:null}
        </SketchPanel>
      </div>
      <AppBottomNav />
      <InauguralPostcardDialog completionAt={completionAt} hintSeen={Boolean(onboarding?.inaugural_postcard_hint_seen_at)} mascotName={mascots[0]?.name} onClose={()=>setPostcardOpen(false)} onFirstFlip={acknowledgeInauguralPostcardHint} open={postcardOpen} senderNickname={onboarding?.display_name ?? undefined}/>
    </PageShell>
  );
}

function InventoryCard({ item, onOpenPostcard }: { item: GroupedInventoryItem; onOpenPostcard: () => void }) {
  const { t } = useTranslation();
  const metaParts = [
    t(`inventory.categories.${item.category}`),
    item.equipped ? t("mascot.equipped") : t("mascot.notEquipped"),
  ];

  const isInaugural=item.thumbnailAssetKey===assetKeys.postcards.inauguralFront;
  return (
    <ItemCard
      label={t(`equipment.rarity.${item.rarity}`)}
      title={t(item.nameKey)}
      description={t(item.descriptionKey)}
      meta={metaParts.join(" / ")}
      selected={item.equipped}
    >
      <div className={styles.assetWrap}>
      {isInaugural ? <button aria-label={t("tutorial.postcard.open")} className={styles.postcardButton} onClick={onOpenPostcard} type="button"><AssetImage
        alt={t(item.nameKey)}
        className={`${styles.assetFrame} ${styles.postcardFrame}`}
        height={192}
        assetKey={item.thumbnailAssetKey}
        width={192}
      >
        <div className={styles.itemStamp} data-rarity={item.rarity}>
          <span>{t("inventory.source")}</span>
          <strong>{item.sourceKey ? t(item.sourceKey) : t("common.unavailable")}</strong>
        </div>
      </AssetImage></button> : <AssetImage
        alt={t(item.nameKey)} className={styles.assetFrame} height={192} assetKey={item.thumbnailAssetKey} width={192}
      ><div className={styles.itemStamp} data-rarity={item.rarity}><span>{t("inventory.source")}</span><strong>{item.sourceKey ? t(item.sourceKey) : t("common.unavailable")}</strong></div></AssetImage>}
      {item.quantity > 1 ? <span className={styles.quantityBadge}>{`×${item.quantity}`}</span> : null}
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
