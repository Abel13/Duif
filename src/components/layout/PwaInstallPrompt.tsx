import { type ReactNode, useEffect, useMemo, useState } from "react";

import { useTranslation, type TranslationKey } from "../../i18n";
import {
  consumePwaDestination,
  isEmbeddedBrowser,
  isIosDevice,
  isMobileOrTablet,
  isPwaGateEnabled,
  isPwaRouteException,
  resolvePwaInstallGateState,
  storePwaDestination,
  type PwaDeviceSnapshot,
} from "./pwaInstall";
import styles from "./PwaInstallPrompt.module.css";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function readDeviceSnapshot(): PwaDeviceSnapshot {
  return {
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    noHover: window.matchMedia("(hover: none)").matches,
    maxTouchPoints: navigator.maxTouchPoints,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
  };
}

function isInstalled() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches
    || navigatorWithStandalone.standalone === true;
}

export function PwaInstallGate({ children }: { children: ReactNode }) {
  const enabled = isPwaGateEnabled(import.meta.env.VITE_DUIF_REQUIRE_PWA_INSTALL);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [displayInstalled, setDisplayInstalled] = useState(isInstalled);
  const [installCompletedInBrowser, setInstallCompletedInBrowser] = useState(false);
  const [restorationReady, setRestorationReady] = useState(false);
  const device = useMemo(readDeviceSnapshot, []);
  const routeException = isPwaRouteException(window.location.pathname);

  const gateState = resolvePwaInstallGateState({
    enabled,
    eligibleDevice: isMobileOrTablet(device),
    installed: displayInstalled,
    routeException,
    promptAvailable: Boolean(installEvent),
    ios: isIosDevice(device),
    embeddedBrowser: isEmbeddedBrowser(device.userAgent),
    installCompletedInBrowser,
  });

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateDisplayMode = () => setDisplayInstalled(isInstalled());
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const markInstalled = () => {
      setInstallEvent(null);
      setInstallCompletedInBrowser(true);
      updateDisplayMode();
    };

    displayMode.addEventListener?.("change", updateDisplayMode);
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      displayMode.removeEventListener?.("change", updateDisplayMode);
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  useEffect(() => {
    if (!["bypass", "installed"].includes(gateState)) {
      storePwaDestination(
        window.localStorage,
        `${window.location.pathname}${window.location.search}${window.location.hash}`,
      );
      setRestorationReady(true);
      return;
    }

    if (gateState === "installed" && window.location.pathname === "/") {
      const destination = consumePwaDestination(window.localStorage);
      if (destination && destination !== "/") {
        window.location.replace(destination);
        return;
      }
    }
    setRestorationReady(true);
  }, [gateState]);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === "accepted") setInstallCompletedInBrowser(true);
  }

  if ((gateState === "bypass" || gateState === "installed") && restorationReady) return children;
  if (gateState === "bypass" || gateState === "installed") return null;

  return <PwaInstallScreen gateState={gateState} onInstall={install} />;
}

function PwaInstallScreen({
  gateState,
  onInstall,
}: {
  gateState: Exclude<ReturnType<typeof resolvePwaInstallGateState>, "bypass" | "installed">;
  onInstall: () => Promise<void>;
}) {
  const { locale, setLocale, t } = useTranslation();
  const descriptionKey: TranslationKey = gateState === "unsupportedBrowser"
    ? "pwaInstall.unsupportedDescription"
    : gateState === "installedInBrowser"
      ? "pwaInstall.openInstalledDescription"
      : gateState === "iosInstructions"
        ? "pwaInstall.iosDescription"
        : gateState === "manualInstructions"
          ? "pwaInstall.browserDescription"
          : "pwaInstall.installDescription";

  return (
    <main className={styles.gate}>
      <section aria-labelledby="pwa-install-title" className={styles.sheet}>
        <label className={styles.localeSelector}>
          <span>{t("auth.languageLabel")}</span>
          <select onChange={(event) => setLocale(event.target.value as "pt-BR" | "en-US")} value={locale}>
            <option value="pt-BR">{t("auth.languages.ptBR")}</option>
            <option value="en-US">{t("auth.languages.enUS")}</option>
          </select>
        </label>
        <img alt="" className={styles.logo} src="/assets/icons/icon-192.png" />
        <span className={styles.eyebrow}>{t("pwaInstall.eyebrow")}</span>
        <h1 id="pwa-install-title">{t("pwaInstall.title")}</h1>
        <p className={styles.description}>{t(descriptionKey)}</p>

        {gateState === "iosInstructions" && <ol className={styles.steps}>
          <li><span>1</span>{t("pwaInstall.iosStepShare")}</li>
          <li><span>2</span>{t("pwaInstall.iosStepAdd")}</li>
          <li><span>3</span>{t("pwaInstall.iosStepOpen")}</li>
        </ol>}
        {gateState === "manualInstructions" && <ol className={styles.steps}>
          <li><span>1</span>{t("pwaInstall.browserStepMenu")}</li>
          <li><span>2</span>{t("pwaInstall.browserStepInstall")}</li>
          <li><span>3</span>{t("pwaInstall.browserStepOpen")}</li>
        </ol>}
        {gateState === "promptAvailable" && (
          <button className={styles.installButton} onClick={() => void onInstall()} type="button">
            {t("pwaInstall.install")}
          </button>
        )}
        <p aria-live="polite" className={styles.requiredNote} role="status">
          {t("pwaInstall.requiredNote")}
        </p>
      </section>
    </main>
  );
}

export function shouldReturnToInstalledApp() {
  if (!isPwaGateEnabled(import.meta.env.VITE_DUIF_REQUIRE_PWA_INSTALL) || isInstalled()) return false;
  return isMobileOrTablet(readDeviceSnapshot());
}
