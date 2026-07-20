import { FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AssetImage, StampButton } from "../../components/ui";
import { assetKeys, type OfficialAssetKey } from "../../game";
import type { MascotArchetype } from "../../game/types";
import { useTranslation, type TranslationKey } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { fetchStarterMascotCatalog } from "../../integrations/supabase/catalog";
import {
  isValidMascotName,
  isValidPlayerDisplayName,
  limitPlayerNameInput,
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
  const [error, setError] = useState<"name" | "taken" | "request" | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setVisibleIndex(onboarding ? onboardingIntroIndex(onboarding.stage) : 0);
  }, [onboarding?.stage]);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [visibleIndex]);

  const progress = useMemo(() => t("onboarding.progress")
    .replace("{current}", String(Math.min(visibleIndex + 1, totalSteps)))
    .replace("{total}", String(totalSteps)), [t, visibleIndex]);

  if (!onboarding) return null;

  if (persistedIndex >= totalSteps) {
    return <MascotChoice />;
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
    } catch (requestError) {
      setError(typeof requestError === "object" && requestError !== null && "code" in requestError && requestError.code === "23505" ? "taken" : "request");
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
            onChange={(event) => setDisplayName(limitPlayerNameInput(event.target.value))}
            value={displayName}
          />
        </label>
        <small id="display-name-hint">{error === "name" ? t("onboarding.displayName.error") : error === "taken" ? t("onboarding.displayName.taken") : t("onboarding.displayName.hint")}</small>
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

function MascotChoice() {
  const navigate=useNavigate();
  const { locale, setLocale, t } = useTranslation();
  const { onboarding, provisionInitialMascot, saveInitialMascotDraft, signOut } = useAuth();
  const [archetypes, setArchetypes] = useState<MascotArchetype[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [name, setName] = useState(onboarding?.mascot_name ?? "");
  const [mode, setMode] = useState<"choice" | "review" | "ready">(
    onboarding?.stage === "tutorial" ? "ready" : onboarding?.selected_mascot_template_id ? "review" : "choice",
  );
  const [state, setState] = useState<"loading" | "ready" | "error" | "saving">("loading");
  const titleRef = useRef<HTMLHeadingElement>(null);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    let current = true;
    fetchStarterMascotCatalog().then((items) => {
      if (!current) return;
      setArchetypes(items);
      const savedIndex = items.findIndex((item) => item.id === onboarding?.selected_mascot_template_id);
      setSelectedIndex(savedIndex >= 0 ? savedIndex : 0);
      setState(items.length === 3 ? "ready" : "error");
    }).catch(() => current && setState("error"));
    return () => { current = false; };
  }, [onboarding?.selected_mascot_template_id]);

  const selected = archetypes[selectedIndex];
  useEffect(() => { titleRef.current?.focus({ preventScroll: true }); }, [mode, selectedIndex]);

  function rotate(direction: number) {
    if (!archetypes.length || state === "saving") return;
    setSelectedIndex((current) => (current + direction + archetypes.length) % archetypes.length);
  }

  async function review(event: FormEvent) {
    event.preventDefault();
    if (!selected || !isValidMascotName(name)) return setState("error");
    setState("saving");
    try {
      await saveInitialMascotDraft(selected.id, name);
      setMode("review");
      setState("ready");
    } catch { setState("error"); }
  }

  async function confirm() {
    setState("saving");
    try {
      await provisionInitialMascot();
      setMode("ready");
      setState("ready");
    } catch { setState("error"); }
  }
  function beginTutorial(){navigate("/onboarding/tutorial");}

  return <OnboardingShell locale={locale} onLocaleChange={setLocale} onSignOut={signOut}>
    <section className={`${styles.card} ${styles.mascotCard}`}>
      <span className={styles.eyebrow}>{t("onboarding.eyebrow")}</span>
      <h1 ref={titleRef} tabIndex={-1}>{t(mode === "choice" ? "onboarding.mascotChoice.title" : mode === "review" ? "onboarding.mascotChoice.reviewTitle" : "onboarding.mascotChoice.readyTitle")}</h1>
      <p>{mode === "ready"
        ? t("onboarding.mascotChoice.readyDescription").replace("{name}", onboarding?.mascot_name ?? name)
        : t(mode === "review" ? "onboarding.mascotChoice.reviewDescription" : "onboarding.mascotChoice.description")}</p>

      {state === "loading" && <p aria-live="polite">{t("onboarding.mascotChoice.loading")}</p>}
      {state === "error" && !selected && <p className={styles.error}>{t("onboarding.mascotChoice.unavailable")}</p>}
      {selected && <>
        {mode === "choice" ? <div className={styles.carousel} onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => {
          const end = event.changedTouches[0]?.clientX; if (touchStart.current !== null && end !== undefined && Math.abs(end - touchStart.current) > 44) rotate(end > touchStart.current ? -1 : 1); touchStart.current = null;
        }}>
          <button aria-label={t("onboarding.mascotChoice.previous")} className={styles.carouselArrow} onClick={() => rotate(-1)} type="button">‹</button>
          {[-1, 0, 1].map((offset) => {
            const item = archetypes[(selectedIndex + offset + archetypes.length) % archetypes.length];
            return item && <AssetImage alt={t(item.speciesKey)} assetKey={item.appearance.portraitAssetKey} className={offset === 0 ? styles.selectedPortrait : styles.sidePortrait} key={`${item.id}-${offset}`}><span className={styles.fallbackMark} /></AssetImage>;
          })}
          <button aria-label={t("onboarding.mascotChoice.nextMascot")} className={styles.carouselArrow} onClick={() => rotate(1)} type="button">›</button>
        </div> : <AssetImage alt={t(selected.speciesKey)} assetKey={selected.appearance.portraitAssetKey} className={styles.reviewPortrait}><span className={styles.fallbackMark} /></AssetImage>}
        {mode !== "choice" && <strong className={styles.chosenName}>{onboarding?.mascot_name ?? name}</strong>}
        <strong className={styles.species}>{t(selected.speciesKey)}</strong>

        <div className={styles.mascotFacts}>
          <section><h2>{t("onboarding.mascotChoice.attributes")}</h2><dl>{Object.entries(selected.attributes).map(([key, value]) => <div key={key}><dt>{t(`mascot.${key}` as TranslationKey)}</dt><dd>{value}/10</dd></div>)}</dl></section>
          <section><h2>{t("onboarding.mascotChoice.trait")}</h2><strong>{t(selected.trait.nameKey)}</strong><p>{t(selected.trait.descriptionKey)}</p></section>
          <section><h2>{t("onboarding.mascotChoice.skills")}</h2><ul>{selected.skills.slice(0, 2).map((skill) => <li key={skill.id}>{t(skill.nameKey)}</li>)}</ul></section>
          <section><h2>{t("onboarding.mascotChoice.equipment")}</h2><ul>{selected.equipment.map((item) => <li key={item.id}>{t(item.nameKey)}</li>)}</ul></section>
        </div>

        {mode === "choice" && <form className={styles.nameForm} onSubmit={review}>
          <label><span>{t("onboarding.mascotChoice.nameLabel")}</span><input aria-invalid={state === "error"} maxLength={48} value={name} onChange={(event) => { setName(limitPlayerNameInput(event.target.value)); setState("ready"); }} /></label>
          <small>{state === "error" ? t("onboarding.mascotChoice.nameError") : t("onboarding.mascotChoice.nameHint")}</small>
          <div className={styles.actions}><StampButton disabled={state === "saving"} type="submit">{state === "saving" ? t("onboarding.saving") : t("onboarding.mascotChoice.review")}</StampButton></div>
        </form>}
        {mode === "review" && <div className={styles.actions}><StampButton disabled={state === "saving"} onClick={() => setMode("choice")} variant="secondary">{t("onboarding.back")}</StampButton><StampButton disabled={state === "saving"} onClick={() => void confirm()}>{state === "saving" ? t("onboarding.mascotChoice.preparing") : t("onboarding.mascotChoice.confirm")}</StampButton></div>}
        {mode === "ready" && <div className={styles.actions}><StampButton disabled={state==="saving"} onClick={()=>void beginTutorial()}>{state==="saving"?t("onboarding.saving"):t("tutorial.start.action")}</StampButton></div>}
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
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    const viewport = window.visualViewport;
    if (!page || !viewport) return;

    let scrollBeforeKeyboard: number | null = null;
    let keyboardWasVisible = false;
    let deferredRestore: number | undefined;

    const isEditable = (target: EventTarget | null) => target instanceof HTMLElement
      && target.matches("input, textarea, select, [contenteditable='true']");

    const restoreScrollPosition = () => {
      if (scrollBeforeKeyboard === null) return;
      page.scrollTop = scrollBeforeKeyboard;
      window.scrollTo(0, 0);
    };

    const onFocusIn = (event: FocusEvent) => {
      if (isEditable(event.target)) scrollBeforeKeyboard = page.scrollTop;
    };

    const onViewportResize = () => {
      const keyboardIsVisible = viewport.height < window.innerHeight - 100;
      if (keyboardIsVisible) {
        keyboardWasVisible = true;
        return;
      }

      if (!keyboardWasVisible || scrollBeforeKeyboard === null) return;
      keyboardWasVisible = false;
      requestAnimationFrame(restoreScrollPosition);
      deferredRestore = window.setTimeout(restoreScrollPosition, 80);
    };

    page.addEventListener("focusin", onFocusIn);
    viewport.addEventListener("resize", onViewportResize);
    return () => {
      page.removeEventListener("focusin", onFocusIn);
      viewport.removeEventListener("resize", onViewportResize);
      if (deferredRestore !== undefined) window.clearTimeout(deferredRestore);
    };
  }, []);

  return <main className={styles.page} ref={pageRef}>
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
