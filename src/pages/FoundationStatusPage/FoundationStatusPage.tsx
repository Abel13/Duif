import { Link } from "react-router-dom";

import { PageShell } from "../../components/layout";
import { SketchPanel } from "../../components/ui";
import { useTranslation } from "../../i18n";
import styles from "./FoundationStatusPage.module.css";

export type FoundationStatus = "loading" | "unavailable" | "accountPending" | "onboardingPending";

export function FoundationStatusPage({ state }: { state: FoundationStatus }) {
  const { t } = useTranslation();
  const isUnavailable = state === "unavailable";
  const keys = {
    loading: { title: "foundation.loading.title", description: "foundation.loading.description" },
    unavailable: { title: "foundation.unavailable.title", description: "foundation.unavailable.description" },
    accountPending: { title: "foundation.accountPending.title", description: "foundation.accountPending.description" },
    onboardingPending: { title: "foundation.onboardingPending.title", description: "foundation.onboardingPending.description" },
  } as const;

  return (
    <PageShell>
      <main className={styles.shell}>
        <SketchPanel eyebrow={t("foundation.eyebrow")} title={t(keys[state].title)} variant="note">
          <div className={styles.content} role={state === "loading" ? "status" : "alert"}>
            <span className={styles.mark} aria-hidden="true" />
            <p>{t(keys[state].description)}</p>
            {isUnavailable && <Link to="/auth">{t("foundation.retry")}</Link>}
          </div>
        </SketchPanel>
      </main>
    </PageShell>
  );
}
