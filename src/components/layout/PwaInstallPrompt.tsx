import { useEffect, useState } from "react";

import { useTranslation } from "../../i18n";
import styles from "./PwaInstallPrompt.module.css";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const dismissedKey = "duif-pwa-install-dismissed";

export function PwaInstallPrompt() {
  const { t } = useTranslation();
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    if (!import.meta.env.PROD || isInstalled() || sessionStorage.getItem(dismissedKey)) {
      return undefined;
    }

    setIsVisible(true);

    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const hideAfterInstall = () => setIsVisible(false);

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", hideAfterInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", hideAfterInstall);
    };
  }, []);

  function dismiss() {
    sessionStorage.setItem(dismissedKey, "true");
    setIsVisible(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === "accepted") setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <aside className={styles.prompt} aria-labelledby="pwa-install-title">
      <button
        aria-label={t("pwaInstall.close")}
        className={styles.closeButton}
        onClick={dismiss}
        type="button"
      >
        ×
      </button>
      <span className={styles.eyebrow}>{t("pwaInstall.eyebrow")}</span>
      <strong id="pwa-install-title">{t("pwaInstall.title")}</strong>
      <p>{installEvent
        ? t("pwaInstall.installDescription")
        : isIos
          ? t("pwaInstall.iosDescription")
          : t("pwaInstall.browserDescription")}</p>
      <div className={styles.actions}>
        {installEvent ? (
          <button className={styles.installButton} onClick={install} type="button">
            {t("pwaInstall.install")}
          </button>
        ) : null}
        <button className={styles.laterButton} onClick={dismiss} type="button">
          {installEvent ? t("pwaInstall.later") : t("pwaInstall.understood")}
        </button>
      </div>
    </aside>
  );
}

function isInstalled() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}
