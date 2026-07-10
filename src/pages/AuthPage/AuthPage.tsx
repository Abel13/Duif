import { FormEvent, useState } from "react";

import { MobileTopBar, PageShell } from "../../components/layout";
import { SketchPanel, StampButton } from "../../components/ui";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { getProfileDisplayLabel } from "../../integrations/supabase/profile";
import styles from "./AuthPage.module.css";

type AuthMode = "signIn" | "signUp";

export function AuthPage() {
  const { t } = useTranslation();
  const { isConfigured, isLoading, profile, session, signIn, signOut, signUp } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("abel@duif.local");
  const [password, setPassword] = useState("duif-dev-password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isSignedIn = Boolean(session);
  const profileLabel = getProfileDisplayLabel(profile);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasError(false);
    setIsSubmitting(true);

    try {
      if (authMode === "signIn") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
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
      <MobileTopBar backLabelKey="navigation.backToNest" backTo="/mascots/mascot-nuvem" title={t("auth.title")} />
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("auth.eyebrow")} title={t("auth.title")} variant="note">
          <p className={styles.description}>{t("auth.subtitle")}</p>

          {!isConfigured && (
            <div className={styles.statusBlock} role="status">
              <strong>{t("auth.unavailableTitle")}</strong>
              <span>{t("auth.unavailableDescription")}</span>
            </div>
          )}

          {isConfigured && isLoading && (
            <div className={styles.statusBlock} role="status">
              <span>{t("auth.loadingSession")}</span>
            </div>
          )}

          {isConfigured && !isLoading && isSignedIn && (
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

          {isConfigured && !isLoading && !isSignedIn && (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.modeTabs} role="group" aria-label={t("auth.modeLabel")}>
                <button
                  aria-pressed={authMode === "signIn"}
                  className={authMode === "signIn" ? styles.activeMode : undefined}
                  onClick={() => setAuthMode("signIn")}
                  type="button"
                >
                  {t("auth.signIn")}
                </button>
                <button
                  aria-pressed={authMode === "signUp"}
                  className={authMode === "signUp" ? styles.activeMode : undefined}
                  onClick={() => setAuthMode("signUp")}
                  type="button"
                >
                  {t("auth.signUp")}
                </button>
              </div>

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
                  autoComplete={authMode === "signIn" ? "current-password" : "new-password"}
                  minLength={6}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>

              {hasError && <p className={styles.error}>{t("auth.errorMessage")}</p>}

              <StampButton disabled={isSubmitting} type="submit">
                {isSubmitting
                  ? t("auth.submitting")
                  : authMode === "signIn"
                    ? t("auth.signIn")
                    : t("auth.signUp")}
              </StampButton>
            </form>
          )}
        </SketchPanel>
      </div>
    </PageShell>
  );
}
