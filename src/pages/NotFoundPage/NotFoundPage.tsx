import { Link, useLocation } from "react-router-dom";

import { AppBottomNav, PageShell } from "../../components/layout";
import { SketchPanel } from "../../components/ui";
import { useTranslation } from "../../i18n";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <PageShell hasBottomNav>
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("notFound.eyebrow")} title={t("notFound.title")} variant="note">
          <div className={styles.content}>
            <div className={styles.mark} aria-hidden="true">
              404
            </div>
            <p className={styles.description}>{t("notFound.description")}</p>
            <p className={styles.path}>{location.pathname}</p>
            <Link className={styles.action} to="/mascots">
              {t("notFound.backToNest")}
            </Link>
          </div>
        </SketchPanel>
      </div>
      <AppBottomNav />
    </PageShell>
  );
}
