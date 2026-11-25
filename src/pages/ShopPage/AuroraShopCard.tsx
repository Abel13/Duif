import { useEffect, useState } from "react";
import { AssetImage } from "../../components/ui";
import { assetKeys } from "../../game/assets";
import { useTranslation } from "../../i18n";
import { fetchAuroraOffer, purchaseAurora } from "../../integrations/supabase/mascotShop";
import styles from "./ShopPage.module.css";

export function AuroraShopCard({ balance, refreshBalance }: {
  balance: number;
  refreshBalance: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [offer, setOffer] = useState<Awaited<ReturnType<typeof fetchAuroraOffer>>>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    fetchAuroraOffer().then(value => { if (active) setOffer(value); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  async function buy() {
    if (!offer || busy || offer.owned) return;
    setBusy(true);
    setFailed(false);
    try {
      await purchaseAurora();
      setOffer({ ...offer, owned: true });
      await refreshBalance();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (!offer && !failed) return null;
  return <article className={styles.card}>
    <AssetImage assetKey={assetKeys.mascots.aurora} alt={t("aurora.species")} className={styles.cardImage} width={512} height={512}>
      <span className={styles.assetFallback} aria-hidden="true" />
    </AssetImage>
    <div className={styles.cardBody}>
      <p className={styles.category}>{t("aurora.species")}</p>
      <h3>{t("aurora.name")}</h3>
      <p>{t("aurora.horizon.description")}</p>
      {offer && <p className={styles.price}>{offer.price} {t("shop.currencies.seeds")}</p>}
    </div>
    {offer && <button type="button" className={styles.cardAction}
      disabled={busy || offer.owned || balance < offer.price} onClick={() => void buy()}>
      {t(offer.owned ? "aurora.owned" : busy ? "functionalEquipment.buying" : "functionalEquipment.buy")}
    </button>}
    {failed && <p role="alert">{t("functionalEquipment.purchaseError")}</p>}
  </article>;
}
