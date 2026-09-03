import { Link } from "react-router-dom";

import { useTranslation } from "../../i18n";
import styles from "./AdminLayout.module.css";

export function AdminHubPage() {
  const { t } = useTranslation();
  return (
    <main className={styles.page}>
      <h1 className={styles.brand}>{t("adminPanel.title")}</h1>
      <p className={styles.intro}>{t("adminPanel.description")}</p>
      <div className={styles.cards}>
        <Link className={styles.card} to="/admin/assets">
          <strong>{t("adminPanel.cards.assetsTitle")}</strong>
          <span>{t("adminPanel.cards.assetsDescription")}</span>
        </Link>
        <Link className={styles.card} to="/admin/geonames">
          <strong>{t("adminPanel.cards.geonamesTitle")}</strong>
          <span>{t("adminPanel.cards.geonamesDescription")}</span>
        </Link>
        <Link className={styles.card} to="/admin/encounters">
          <strong>{t("adminPanel.cards.encountersTitle")}</strong>
          <span>{t("adminPanel.cards.encountersDescription")}</span>
        </Link>
      </div>
    </main>
  );
}
