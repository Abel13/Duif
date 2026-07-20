import { FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { AssetImage, StampButton } from "../../components/ui";
import { assetKeys, type OfficialAssetKey } from "../../game";
import { useTranslation, type TranslationKey } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import {
  isValidPlayerDisplayName,
  normalizePlayerDisplayName,
  onboardingIntroIndex,
  onboardingIntroStages,
} from "../../integrations/supabase/onboarding";
import styles from "./OnboardingPage.module.css";

const totalSteps = onboardingIntroStages.length;
const introCards: readonly {
  stage: typeof onboardingIntroStages[number];
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  assetKey: OfficialAssetKey;
}[] = [
  { stage: "welcome", titleKey: "onboarding.welcome.title", descriptionKey: "onboarding.welcome.description", assetKey: assetKeys.navigation.nest },
  { stage: "travel", titleKey: "onboarding.travel.title", descriptionKey: "onboarding.travel.description", assetKey: assetKeys.navigation.map },
  { stage: "discoveries", titleKey: "onboarding.discoveries.title", descriptionKey: "onboarding.discoveries.description", assetKey: assetKeys.rewards.goldenCompassPin },
  { stage: "returnCollection", titleKey: "onboarding.returnCollection.title", descriptionKey: "onboarding.returnCollection.description", assetKey: assetKeys.navigation.collection },
];

export function OnboardingPage() {
  const { locale, setLocale, t } = useTranslation();
  const { advanceOnboarding, onboarding, signOut } = useAuth();
  const persistedIndex = onboarding ? onboardingIntroIndex(onboarding.stage) : 0;
  const [visibleIndex, setVisibleIndex] = useState(persistedIndex);
  const [displayName, setDisplayName] = useState(onboarding?.display_name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<"name" | "request" | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setVisibleIndex(onboarding ? onboardingIntroIndex(onboarding.stage) : 0);
  }, [onboarding?.stage]);

  useEffect(() => {
    titleRef.current?.focus();
  }, [visibleIndex]);

  const progress = useMemo(() => t("onboarding.progress")
    .replace("{current}", String(Math.min(visibleIndex + 1, totalSteps)))
    .replace("{total}", String(totalSteps)), [t, visibleIndex]);

  if (!onboarding) return null;

  if (persistedIndex >= totalSteps) {
    return <OnboardingShell locale={locale} onLocaleChange={setLocale} onSignOut={signOut}>
      <section className={styles.card}>
        <div className={styles.handoffMark} aria-hidden="true" />
        <span className={styles.eyebrow}>{t("onboarding.eyebrow")}</span>
        <h1 ref={titleRef} tabIndex={-1}>{t("onboarding.mascotChoice.title")}</h1>
        <p>{t("onboarding.mascotChoice.description")}</p>
      </section>
    </OnboardingShell>;
  }

  const card = introCards[visibleIndex];
  const isDisplayName = visibleIndex === totalSteps - 1;

  async function advance() {
    if (isSaving || !onboarding) return;
    setError(null);
    if (visibleIndex < persistedIndex) {
      setVisibleIndex((current) => current + 1);
      return;
    }
    const expectedStage = onboardingIntroStages[visibleIndex];
    const nextStage = onboardingIntroStages[visibleIndex + 1];
    if (!expectedStage || !nextStage) return;
    setIsSaving(true);
    try {
      await advanceOnboarding(expectedStage, nextStage);
    } catch {
      setError("request");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveDisplayName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || !onboarding) return;
    setError(null);
    const normalized = normalizePlayerDisplayName(displayName);
    if (!isValidPlayerDisplayName(normalized)) {
      setError("name");
      return;
    }
    setIsSaving(true);
    try {
      await advanceOnboarding("displayName", "mascotChoice", normalized);
    } catch {
      setError("request");
    } finally {
      setIsSaving(false);
    }
  }

  return <OnboardingShell locale={locale} onLocaleChange={setLocale} onSignOut={signOut}>
    <div aria-label={progress} className={styles.progress} role="progressbar" aria-valuemax={totalSteps} aria-valuemin={1} aria-valuenow={visibleIndex + 1}>
      <span>{progress}</span>
      <div aria-hidden="true">{onboardingIntroStages.map((stage, index) => <i data-active={index <= visibleIndex || undefined} key={stage} />)}</div>
    </div>

    <section className={styles.card}>
      {!isDisplayName && card && <AssetImage alt="" assetKey={card.assetKey} className={styles.illustration}>
        <span className={styles.fallbackMark} aria-hidden="true" />
      </AssetImage>}
      <span className={styles.eyebrow}>{t("onboarding.eyebrow")}</span>
      <h1 ref={titleRef} tabIndex={-1}>{t(isDisplayName ? "onboarding.displayName.title" : card.titleKey)}</h1>
      <p>{t(isDisplayName ? "onboarding.displayName.description" : card.descriptionKey)}</p>

      {isDisplayName ? <form className={styles.nameForm} onSubmit={saveDisplayName}>
        <label>
          <span>{t("onboarding.displayName.label")}</span>
          <input
            aria-describedby="display-name-hint"
            aria-invalid={error === "name"}
            autoComplete="nickname"
            maxLength={48}
            onChange={(event) => setDisplayName(event.target.value)}
            value={displayName}
          />
        </label>
        <small id="display-name-hint">{error === "name" ? t("onboarding.displayName.error") : t("onboarding.displayName.hint")}</small>
        {error === "request" && <p aria-live="polite" className={styles.error}>{t("onboarding.genericError")}</p>}
        <div className={styles.actions}>
          <StampButton disabled={isSaving} onClick={() => setVisibleIndex((current) => Math.max(0, current - 1))} variant="secondary">{t("onboarding.back")}</StampButton>
          <StampButton disabled={isSaving} type="submit">{isSaving ? t("onboarding.saving") : t("onboarding.next")}</StampButton>
        </div>
      </form> : <>
        {error === "request" && <p aria-live="polite" className={styles.error}>{t("onboarding.genericError")}</p>}
        <div className={styles.actions}>
          {visibleIndex > 0 && <StampButton disabled={isSaving} onClick={() => setVisibleIndex((current) => current - 1)} variant="secondary">{t("onboarding.back")}</StampButton>}
          <StampButton disabled={isSaving} onClick={() => void advance()}>{isSaving ? t("onboarding.saving") : t("onboarding.next")}</StampButton>
        </div>
      </>}
    </section>
  </OnboardingShell>;
}

function OnboardingShell({ children, locale, onLocaleChange, onSignOut }: {
  children: ReactNode;
  locale: "pt-BR" | "en-US";
  onLocaleChange: (locale: "pt-BR" | "en-US") => void;
  onSignOut: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return <main className={styles.page}>
    <header className={styles.toolbar}>
      <label>
        <span>{t("onboarding.languageLabel")}</span>
        <select onChange={(event) => onLocaleChange(event.target.value as "pt-BR" | "en-US")} value={locale}>
          <option value="pt-BR">{t("auth.languages.ptBR")}</option>
          <option value="en-US">{t("auth.languages.enUS")}</option>
        </select>
      </label>
      <button onClick={() => void onSignOut()} type="button">{t("onboarding.signOut")}</button>
    </header>
    <div className={styles.content}>{children}</div>
  </main>;
}
