import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { AppBottomNav, PageShell } from "../../components/layout";
import { AssetImage, SketchPanel, StampButton } from "../../components/ui";
import {
  assetKeys,
  filterShopItemsByCategory,
  mockShopCatalog,
  shopCategories,
  type ShopCatalogItem,
  type ShopCategory,
} from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./ShopPage.module.css";

export function ShopPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>("all");
  const [selectedItem, setSelectedItem] = useState<ShopCatalogItem | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const items = useMemo(
    () => filterShopItemsByCategory(mockShopCatalog, selectedCategory),
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

  return (
    <PageShell hasBottomNav>
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("shop.eyebrow")} title={t("shop.title")}>
          <p className={styles.subtitle}>{t("shop.subtitle")}</p>
          <p className={styles.notice}>{t("shop.prototypeNotice")}</p>
        </SketchPanel>

        <section className={styles.catalog} aria-labelledby="shop-catalog-title">
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
        className={styles.cardImage}
        height={256}
        assetKey={item.thumbnailAssetKey}
        width={256}
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
            className={styles.dialogItemImage}
            height={256}
            assetKey={item.thumbnailAssetKey}
            width={256}
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

  return (
    <span className={styles.currencyMark} title={label}>
      <AssetImage
        alt=""
        className={styles.currencyIcon}
        height={32}
        assetKey={currency === "free" ? assetKeys.currency.stamp : assetKeys.currency.crystal}
        width={32}
      >
        <span className={styles.currencyFallback} aria-hidden="true" />
      </AssetImage>
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
}
