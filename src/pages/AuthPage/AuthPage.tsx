import { FormEvent, useState } from "react";

import { MobileTopBar, PageShell } from "../../components/layout";
import { SketchPanel, StampButton } from "../../components/ui";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { getProfileDisplayLabel } from "../../integrations/supabase/profile";
import styles from "./AuthPage.module.css";

export function AuthPage() {
  const { locale, setLocale, t } = useTranslation();
  const { isConfigured, isLoading, isServiceAvailable, profile, session, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isSignedIn = Boolean(session);
  const profileLabel = getProfileDisplayLabel(profile);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasError(false);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setHasError(false);
    setIsSubmitting(true);

    try {
      await signOut();
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell hasTopBar>
      <MobileTopBar backLabelKey="navigation.backToNest" backTo="/" title={t("auth.title")} />
      <div className={styles.shell}>
        <label className={styles.localeSelector}>
          <span>{t("auth.languageLabel")}</span>
          <select
            aria-label={t("auth.languageLabel")}
            onChange={(event) => setLocale(event.target.value as "pt-BR" | "en-US")}
            value={locale}
          >
            <option value="pt-BR">{t("auth.languages.ptBR")}</option>
            <option value="en-US">{t("auth.languages.enUS")}</option>
          </select>
        </label>
        <SketchPanel eyebrow={t("auth.eyebrow")} title={t("auth.title")} variant="note">
          <p className={styles.description}>{t("auth.subtitle")}</p>

          {(!isConfigured || !isServiceAvailable) && (
            <div className={styles.statusBlock} role="status">
              <strong>{t("auth.unavailableTitle")}</strong>
              <span>{t("auth.unavailableDescription")}</span>
            </div>
          )}

          {isConfigured && isServiceAvailable && isLoading && (
            <div className={styles.statusBlock} role="status">
              <span>{t("auth.loadingSession")}</span>
            </div>
          )}

          {isConfigured && isServiceAvailable && !isLoading && isSignedIn && (
            <div className={styles.signedIn}>
              <div className={styles.statusBlock} role="status">
                <strong>{t("auth.signedInTitle")}</strong>
                <span>{t("auth.signedInDescription")}</span>
              </div>

              <dl className={styles.profileList}>
                <div>
                  <dt>{t("auth.email")}</dt>
                  <dd>{session?.user.email}</dd>
                </div>
                <div>
                  <dt>{t("auth.currentProfile")}</dt>
                  <dd>{profileLabel || t("common.unavailable")}</dd>
                </div>
              </dl>

              {hasError && <p className={styles.error}>{t("auth.errorMessage")}</p>}

              <div className={styles.actions}>
                <StampButton disabled={isSubmitting} onClick={handleSignOut} variant="secondary">
                  {t("auth.signOut")}
                </StampButton>
              </div>
            </div>
          )}

          {isConfigured && isServiceAvailable && !isLoading && !isSignedIn && (
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>{t("auth.email")}</span>
                <input
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className={styles.field}>
                <span>{t("auth.password")}</span>
                <input
                  autoComplete="current-password"
                  minLength={6}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>

              {hasError && <p className={styles.error}>{t("auth.errorMessage")}</p>}

              <StampButton disabled={isSubmitting} type="submit">
                {isSubmitting ? t("auth.submitting") : t("auth.signIn")}
              </StampButton>
              <p className={styles.statusBlock}>{t("auth.registrationPending")}</p>
            </form>
          )}
        </SketchPanel>
      </div>
    </PageShell>
  );
}
