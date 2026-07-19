import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AuthField } from "../../components/auth";
import { PageShell } from "../../components/layout";
import { SketchPanel, StampButton } from "../../components/ui";
import { meetsPasswordPolicy } from "../../integrations/supabase/authContracts";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { useTranslation } from "../../i18n";
import styles from "../AuthPage/AuthPage.module.css";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const { completePasswordReset, exchangeAuthCode, isPasswordRecovery } = useAuth();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isLinkValid, setIsLinkValid] = useState(isPasswordRecovery);
  const [isLoadingLink, setIsLoadingLink] = useState(!isPasswordRecovery);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isPasswordRecovery) {
      setIsLinkValid(true);
      setIsLoadingLink(false);
    }
  }, [isPasswordRecovery]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setIsLoadingLink(false);
      return;
    }
    exchangeAuthCode(code, "recovery").then((result) => {
      window.history.replaceState({}, "", "/auth/reset-password");
      setIsLinkValid(result.ok);
      setIsLoadingLink(false);
    });
  }, [exchangeAuthCode, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasError(false);
    if (!meetsPasswordPolicy(password) || password !== confirmation) {
      setHasError(true);
      return;
    }
    setIsSubmitting(true);
    const result = await completePasswordReset(password);
    setIsSubmitting(false);
    if (result.ok) setIsComplete(true);
    else setHasError(true);
  }

  return <PageShell><div className={styles.page}><div className={styles.shell}>
    <SketchPanel eyebrow={t("auth.eyebrow")} title={t("auth.resetTitle")} variant="note">
      {isLoadingLink ? <div className={styles.statusBlock} role="status">{t("auth.loadingSession")}</div>
        : isComplete ? <div className={styles.form}><p className={styles.success}>{t("auth.resetSuccess")}</p><Link className={styles.backLink} to="/auth">{t("auth.backToLogin")}</Link></div>
        : !isLinkValid ? <div className={styles.form}><div className={styles.statusBlock} role="alert"><strong>{t("auth.invalidLinkTitle")}</strong><span>{t("auth.invalidLinkDescription")}</span></div><Link className={styles.backLink} to="/auth">{t("auth.requestNewLink")}</Link></div>
        : <form className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.description}>{t("auth.resetDescription")}</p>
          <AuthField autoComplete="new-password" label={t("auth.newPassword")} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          <AuthField autoComplete="new-password" error={confirmation && password !== confirmation ? t("auth.passwordMismatch") : undefined} label={t("auth.confirmPassword")} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
          {hasError && <p aria-live="polite" className={styles.error}>{t("auth.errorMessage")}</p>}
          <StampButton disabled={isSubmitting} type="submit">{isSubmitting ? t("auth.submitting") : t("auth.updatePassword")}</StampButton>
        </form>}
    </SketchPanel>
  </div></div></PageShell>;
}
