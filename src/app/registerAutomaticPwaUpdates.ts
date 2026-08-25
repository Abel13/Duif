import { registerSW } from "virtual:pwa-register";

const reloadGuardKey = "duif.pwaUpdateReloaded";
const checkIntervalMs = 60 * 60 * 1_000;
const foregroundCheckAgeMs = 5 * 60 * 1_000;

export function registerAutomaticPwaUpdates() {
  if (!("serviceWorker" in navigator)) return;

  window.setTimeout(() => window.sessionStorage.removeItem(reloadGuardKey), 10_000);

  let lastCheckAt = 0;
  let registration: ServiceWorkerRegistration | undefined;
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => void updateSW(true),
    onNeedReload: () => reloadOnce(),
    onRegisteredSW: (_scriptUrl, currentRegistration) => {
      registration = currentRegistration;
      void checkForUpdate(registration, () => { lastCheckAt = Date.now(); });
    },
  });

  const checkWhenRelevant = () => {
    if (document.visibilityState !== "visible" || !navigator.onLine) return;
    if (Date.now() - lastCheckAt < foregroundCheckAgeMs) return;
    void checkForUpdate(registration, () => { lastCheckAt = Date.now(); });
  };

  const intervalId = window.setInterval(checkWhenRelevant, checkIntervalMs);
  document.addEventListener("visibilitychange", checkWhenRelevant);
  window.addEventListener("online", checkWhenRelevant);

  window.addEventListener("pagehide", () => {
    window.clearInterval(intervalId);
    document.removeEventListener("visibilitychange", checkWhenRelevant);
    window.removeEventListener("online", checkWhenRelevant);
  }, { once: true });
}

async function checkForUpdate(registration: ServiceWorkerRegistration | undefined, onChecked: () => void) {
  if (!registration) return;
  try {
    await registration.update();
  } catch {
    // Offline and transient update failures must not interrupt the application.
  } finally {
    onChecked();
  }
}

function reloadOnce() {
  if (window.sessionStorage.getItem(reloadGuardKey) === "true") return;
  window.sessionStorage.setItem(reloadGuardKey, "true");
  window.location.reload();
}
