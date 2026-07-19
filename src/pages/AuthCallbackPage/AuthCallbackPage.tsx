import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { PageShell } from "../../components/layout";
import { SketchPanel } from "../../components/ui";
import { sanitizeIntendedRoute } from "../../integrations/supabase/authContracts";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { useTranslation } from "../../i18n";
import styles from "../AuthPage/AuthPage.module.css";

export function AuthCallbackPage() {
  const { t } = useTranslation();
  const { exchangeAuthCode } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setHasError(true);
      return;
    }
    exchangeAuthCode(code).then((result) => {
      window.history.replaceState({}, "", "/auth/callback");
      if (!result.ok) setHasError(true);
      else navigate(sanitizeIntendedRoute(searchParams.get("next")), { replace: true });
    });
  }, [exchangeAuthCode, navigate, searchParams]);

  return <PageShell><div className={styles.page}><div className={styles.shell}>
    <SketchPanel eyebrow={t("auth.eyebrow")} title={t("auth.callbackTitle")} variant="note">
      <div aria-live="polite" className={styles.statusBlock} role="status">
        <strong>{hasError ? t("auth.invalidLinkTitle") : t("auth.confirmingEmail")}</strong>
        <span>{hasError ? t("auth.invalidLinkDescription") : t("auth.callbackDescription")}</span>
      </div>
      {hasError && <Link className={styles.backLink} to="/auth?mode=signup">{t("auth.backToLogin")}</Link>}
    </SketchPanel>
  </div></div></PageShell>;
}
