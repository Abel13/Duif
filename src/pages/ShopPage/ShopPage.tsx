import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { CoffeeBean, SketchLogo } from "@phosphor-icons/react";

import { AppBottomNav, PageShell } from "../../components/layout";
import { EquipmentArtwork } from "../../components/mascot/MascotLoadoutEditor";
import { AssetImage, SketchPanel, StampButton } from "../../components/ui";
import {
  assetKeys,
  filterShopItemsByCategory,
  shopCatalog,
  shopCategories,
  type ShopCatalogItem,
  type ShopCategory,
  useEquipmentData,
} from "../../game";
import { purchaseEquipment } from "../../integrations/supabase/equipment";
import { useTranslation } from "../../i18n";
import styles from "./ShopPage.module.css";

export function ShopPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>("all");
  const [selectedItem, setSelectedItem] = useState<ShopCatalogItem | null>(null);
  const [buyingKey, setBuyingKey] = useState<string>();
  const [purchaseError, setPurchaseError] = useState(false);
  const { data: equipmentData, refresh: refreshEquipment } = useEquipmentData();
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const items = useMemo(
    () => filterShopItemsByCategory(shopCatalog, selectedCategory),
    [selectedCategory],
  );

  function openItem(item: ShopCatalogItem, trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger;
    setSelectedItem(item);
  }

  function handleDialogClosed() {
    setSelectedItem(null);
    requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }

  async function handleEquipmentPurchase(catalogKey: string) {
    setBuyingKey(catalogKey);
    setPurchaseError(false);
    try { await purchaseEquipment(catalogKey); await refreshEquipment(); }
    catch { setPurchaseError(true); }
    finally { setBuyingKey(undefined); }
  }

  return (
    <PageShell hasBottomNav>
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("shop.eyebrow")} title={t("shop.title")}>
          <p className={styles.subtitle}>{t("shop.subtitle")}</p>
          <p className={styles.notice}>{t("shop.prototypeNotice")}</p>
        </SketchPanel>

        <section className={styles.catalog} aria-labelledby="shop-catalog-title">
          <div className={styles.functionalHeader}><div><h2>{t("functionalEquipment.shopTitle")}</h2><p>{t("functionalEquipment.shopDescription")}</p></div><strong>{t("functionalEquipment.balance")}: {equipmentData.seedBalance}</strong></div>
          <div className={styles.grid}>
            {equipmentData.catalog.map((item) => <article className={styles.card} key={item.id}>
              <EquipmentArtwork item={item} />
              <div className={styles.cardBody}><p className={styles.category}>{t(`functionalEquipment.kinds.${item.kind}`)}</p><h3>{t(item.nameKey)}</h3><p>{t(item.descriptionKey)}</p><p className={styles.price}><CurrencyIcon currency="seeds"/><strong>{item.seedPrice}</strong></p></div>
              <button className={styles.cardAction} disabled={buyingKey===item.catalogKey || equipmentData.seedBalance<item.seedPrice} onClick={()=>void handleEquipmentPurchase(item.catalogKey)} type="button">{buyingKey===item.catalogKey?t("functionalEquipment.buying"):t("functionalEquipment.buy")}</button>
            </article>)}
          </div>
          {purchaseError?<p className={styles.purchaseError}>{t("functionalEquipment.purchaseError")}</p>:null}
          <div className={styles.filterHeader}>
            <h2 id="shop-catalog-title">{t("shop.categoriesLabel")}</h2>
            <div className={styles.filters} aria-label={t("shop.categoriesLabel")}>
              {shopCategories.map((category) => (
                <button
                  aria-pressed={selectedCategory === category}
                  className={styles.filterButton}
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {t(`shop.categories.${category}`)}
                </button>
              ))}
            </div>
          </div>

          {items.length > 0 ? (
            <div className={styles.grid}>
              {items.map((item) => (
                <ShopItemCard item={item} key={item.id} onOpen={openItem} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>{t("shop.emptyTitle")}</h3>
              <p>{t("shop.emptyDescription")}</p>
            </div>
          )}
        </section>
      </div>

      {selectedItem && (
        <ShopItemDialog item={selectedItem} onClosed={handleDialogClosed} />
      )}
      <AppBottomNav />
    </PageShell>
  );
}

function ShopItemCard({
  item,
  onOpen,
}: {
  item: ShopCatalogItem;
  onOpen: (item: ShopCatalogItem, trigger: HTMLButtonElement) => void;
}) {
  const { t } = useTranslation();
  const itemName = t(item.nameKey);

  return (
    <article className={styles.card}>
      <AssetImage
        alt={itemName}
        className={`${styles.cardImage} ${item.category === "postcards" ? styles.postcardImage : ""}`}
        height={item.category === "postcards" ? 800 : 256}
        assetKey={item.thumbnailAssetKey}
        width={item.category === "postcards" ? 1200 : 256}
      >
        <span className={styles.assetFallback} aria-hidden="true" />
      </AssetImage>
      <div className={styles.cardBody}>
        <p className={styles.category}>{t(`shop.categories.${item.category}`)}</p>
        <h3>{itemName}</h3>
        <p>{t(item.descriptionKey)}</p>
        <p className={styles.price}>
          <span>{t("shop.prototypePrice")}</span>
          <CurrencyIcon currency={item.currency} />
          <strong>{item.price}</strong>
        </p>
      </div>
      <button
        aria-label={`${t("shop.viewDetails")}: ${itemName}`}
        className={styles.cardAction}
        onClick={(event) => onOpen(item, event.currentTarget)}
        type="button"
      >
        {t("shop.viewDetails")}
      </button>
    </article>
  );
}

function ShopItemDialog({
  item,
  onClosed,
}: {
  item: ShopCatalogItem;
  onClosed: () => void;
}) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const itemName = t(item.nameKey);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  return (
    <dialog
      aria-labelledby="shop-dialog-title"
      className={styles.dialog}
      onClick={handleBackdropClick}
      onClose={onClosed}
      ref={dialogRef}
    >
      <div className={styles.dialogPaper}>
        <p className={styles.dialogEyebrow}>{t("shop.detailsTitle")}</p>
        <h2 id="shop-dialog-title">{itemName}</h2>

        <div className={styles.dialogVisual} data-preview-kind={item.previewKind}>
          {item.previewKind === "mascot" && (
            <AssetImage
              alt={t("appearance.nuvemPortrait")}
              className={styles.mascotImage}
              height={640}
              assetKey={assetKeys.mascots.nuvem}
              width={640}
            >
              <span className={styles.assetFallback} aria-hidden="true" />
            </AssetImage>
          )}
          <AssetImage
            alt={itemName}
            className={`${styles.dialogItemImage} ${item.category === "postcards" ? styles.postcardImage : ""}`}
            height={item.category === "postcards" ? 800 : 256}
            assetKey={item.thumbnailAssetKey}
            width={item.category === "postcards" ? 1200 : 256}
          >
            <span className={styles.assetFallback} aria-hidden="true" />
          </AssetImage>
        </div>

        {item.previewKind === "mascot" && (
          <div className={styles.previewNote}>
            <strong>{t("shop.mascotPreview")}</strong>
            <span>{t("shop.mascotPreviewNote")}</span>
          </div>
        )}

        <p className={styles.dialogDescription}>{t(item.descriptionKey)}</p>
        <dl className={styles.dialogMeta}>
          <div>
            <dt>{t("inventory.category")}</dt>
            <dd>{t(`shop.categories.${item.category}`)}</dd>
          </div>
          <div>
            <dt>{t("shop.prototypePrice")}</dt>
            <dd className={styles.dialogPrice}>
              <CurrencyIcon currency={item.currency} />
              <span>{item.price}</span>
            </dd>
          </div>
        </dl>

        <StampButton className={styles.closeButton} onClick={closeDialog} variant="secondary">
          {t("shop.close")}
        </StampButton>
      </div>
    </dialog>
  );
}

function CurrencyIcon({ currency }: { currency: ShopCatalogItem["currency"] }) {
  const { t } = useTranslation();
  const label = t(`shop.currencies.${currency}`);
  const Icon = currency === "seeds" ? CoffeeBean : SketchLogo;

  return (
    <span className={styles.currencyMark} title={label}>
      <Icon
        aria-hidden="true"
        className={styles.currencyIcon}
        data-currency={currency}
        size={24}
        weight="duotone"
      />
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
}
