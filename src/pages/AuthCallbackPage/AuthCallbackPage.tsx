import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { PageShell, shouldReturnToInstalledApp } from "../../components/layout";
import { SketchPanel } from "../../components/ui";
import { parsePkceCallbackUrl } from "../../integrations/supabase/authContracts";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { useTranslation } from "../../i18n";
import styles from "../AuthPage/AuthPage.module.css";

export function AuthCallbackPage() {
  const { t } = useTranslation();
  const { exchangeAuthCode } = useAuth();
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);
  const [isConfirmedInBrowser, setIsConfirmedInBrowser] = useState(false);
  const hasProcessedCallback = useRef(false);

  useEffect(() => {
    if (hasProcessedCallback.current) return;
    hasProcessedCallback.current = true;

    const callback = parsePkceCallbackUrl(window.location.href);
    window.history.replaceState({}, "", "/auth/callback");
    if (!callback) {
      setHasError(true);
      return;
    }
    exchangeAuthCode(callback.code).then((result) => {
      if (!result.ok) setHasError(true);
      else if (shouldReturnToInstalledApp()) setIsConfirmedInBrowser(true);
      else navigate(callback.next, { replace: true });
    });
  }, [exchangeAuthCode, navigate]);

  return <PageShell><div className={styles.page}><div className={styles.shell}>
    <SketchPanel eyebrow={t("auth.eyebrow")} title={t("auth.callbackTitle")} variant="note">
      <div aria-live="polite" className={styles.statusBlock} role="status">
        <strong>{hasError
          ? t("auth.invalidLinkTitle")
          : isConfirmedInBrowser
            ? t("auth.confirmedTitle")
            : t("auth.confirmingEmail")}</strong>
        <span>{hasError
          ? t("auth.invalidLinkDescription")
          : isConfirmedInBrowser
            ? t("auth.confirmedDescription")
            : t("auth.callbackDescription")}</span>
      </div>
      {isConfirmedInBrowser && <p className={styles.success}>{t("auth.returnToInstalledApp")}</p>}
      {hasError && <Link className={styles.backLink} to="/auth?mode=signup">{t("auth.backToLogin")}</Link>}
    </SketchPanel>
  </div></div></PageShell>;
}
