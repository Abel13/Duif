import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { AuthField } from "../../components/auth";
import { PageShell } from "../../components/layout";
import { SketchPanel, StampButton } from "../../components/ui";
import { maskEmail, meetsPasswordPolicy } from "../../integrations/supabase/authContracts";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { useTranslation } from "../../i18n";
import styles from "./AuthPage.module.css";

type AuthMode = "signIn" | "signUp" | "recover";

export function AuthPage() {
  const { locale, setLocale, t } = useTranslation();
  const { isConfigured, isLoading, isServiceAvailable, journeyState, pendingVerificationEmail,
    dismissVerification, requestPasswordReset, resendConfirmation, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const [mode, setMode] = useState<AuthMode>(requestedMode === "signup" ? "signUp" : "signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<"error" | "sent" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage(null);
    setPassword("");
    setPasswordConfirmation("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (mode === "signUp" && (!meetsPasswordPolicy(password) || password !== passwordConfirmation)) {
      setMessage("error");
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === "recover") {
        await requestPasswordReset(email);
        setMessage("sent");
        setCooldown(60);
      } else if (mode === "signUp") {
        await signUp(email, password, searchParams.get("next"));
      } else {
        const result = await signIn(email, password);
        if (!result.ok) setMessage("error");
      }
    } catch {
      setMessage(mode === "signIn" ? "error" : "sent");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!pendingVerificationEmail || cooldown > 0) return;
    setIsSubmitting(true);
    await resendConfirmation(pendingVerificationEmail).catch(() => undefined);
    setCooldown(60);
    setIsSubmitting(false);
  }

  const unavailable = !isConfigured || !isServiceAvailable;

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={styles.shell}>
          <label className={styles.localeSelector}>
            <span>{t("auth.languageLabel")}</span>
            <select onChange={(event) => setLocale(event.target.value as "pt-BR" | "en-US")} value={locale}>
              <option value="pt-BR">{t("auth.languages.ptBR")}</option>
              <option value="en-US">{t("auth.languages.enUS")}</option>
            </select>
          </label>

          <SketchPanel eyebrow={t("auth.eyebrow")} title={t("auth.title")} variant="note">
            {unavailable && <AuthNotice title={t("auth.unavailableTitle")} body={t("auth.unavailableDescription")} />}
            {isLoading && !unavailable && <AuthNotice body={t("auth.loadingSession")} />}

            {!isLoading && !unavailable && journeyState === "verificationPending" && pendingVerificationEmail ? (
              <section className={styles.verification}>
                <div className={styles.mailMark} aria-hidden="true">@</div>
                <h2>{t("auth.verificationTitle")}</h2>
                <p>{t("auth.verificationDescription")}</p>
                <strong>{maskEmail(pendingVerificationEmail)}</strong>
                <StampButton disabled={isSubmitting || cooldown > 0} onClick={handleResend}>
                  {cooldown > 0 ? `${t("auth.resendIn")} ${cooldown}s` : t("auth.resendConfirmation")}
                </StampButton>
                <button className={styles.textAction} onClick={() => { dismissVerification(); changeMode("signIn"); }} type="button">
                  {t("auth.backToLogin")}
                </button>
              </section>
            ) : !isLoading && !unavailable ? (
              <>
                <p className={styles.description}>{mode === "recover" ? t("auth.recoveryDescription") : t("auth.subtitle")}</p>
                {mode !== "recover" && (
                  <div aria-label={t("auth.modeLabel")} className={styles.modeTabs} role="group">
                    <button aria-pressed={mode === "signIn"} className={mode === "signIn" ? styles.activeMode : undefined} onClick={() => changeMode("signIn")} type="button">{t("auth.signIn")}</button>
                    <button aria-pressed={mode === "signUp"} className={mode === "signUp" ? styles.activeMode : undefined} onClick={() => changeMode("signUp")} type="button">{t("auth.signUp")}</button>
                  </div>
                )}
                <form className={styles.form} onSubmit={handleSubmit}>
                  <AuthField autoComplete="email" label={t("auth.email")} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
                  {mode !== "recover" && <AuthField autoComplete={mode === "signIn" ? "current-password" : "new-password"} label={t("auth.password")} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />}
                  {mode === "signUp" && (
                    <>
                      <AuthField autoComplete="new-password" error={passwordConfirmation && password !== passwordConfirmation ? t("auth.passwordMismatch") : undefined} label={t("auth.confirmPassword")} onChange={(event) => setPasswordConfirmation(event.target.value)} required type="password" value={passwordConfirmation} />
                      <PasswordRequirements password={password} />
                    </>
                  )}
                  {message && <p aria-live="polite" className={message === "error" ? styles.error : styles.success}>{message === "error" ? t("auth.errorMessage") : t("auth.genericEmailSent")}</p>}
                  <StampButton disabled={isSubmitting || (mode === "recover" && cooldown > 0)} type="submit">
                    {isSubmitting ? t("auth.submitting") : mode === "recover" ? t("auth.sendRecovery") : mode === "signUp" ? t("auth.signUp") : t("auth.signIn")}
                  </StampButton>
                  {mode === "signIn" && <button className={styles.textAction} onClick={() => changeMode("recover")} type="button">{t("auth.forgotPassword")}</button>}
                  {mode === "recover" && <button className={styles.textAction} onClick={() => changeMode("signIn")} type="button">{t("auth.backToLogin")}</button>}
                </form>
              </>
            ) : null}
          </SketchPanel>
        </div>
      </div>
    </PageShell>
  );
}

function PasswordRequirements({ password }: { password: string }) {
  const { t } = useTranslation();
  const requirements = [
    [password.length >= 8, t("auth.passwordLength")],
    [/[A-Za-z]/.test(password), t("auth.passwordLetter")],
    [/\d/.test(password), t("auth.passwordNumber")],
  ] as const;
  return <ul aria-label={t("auth.passwordRequirements")} className={styles.requirements}>
    {requirements.map(([met, label]) => <li className={met ? styles.met : undefined} key={label}>{label}</li>)}
  </ul>;
}

function AuthNotice({ body, title }: { body: string; title?: string }) {
  return <div className={styles.statusBlock} role="status">{title && <strong>{title}</strong>}<span>{body}</span></div>;
}
