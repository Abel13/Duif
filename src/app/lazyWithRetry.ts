import { lazy, type ComponentType } from "react";

const RETRY_KEY = "duif.lazyChunkReloaded";

function isDynamicImportFailure(error: unknown) {
  return error instanceof TypeError && /failed to fetch dynamically imported module/i.test(error.message);
}

export function lazyWithRetry<T extends ComponentType<any>>(
  load: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const module = await load();
      window.sessionStorage.removeItem(RETRY_KEY);
      return module;
    } catch (error) {
      const alreadyReloaded = window.sessionStorage.getItem(RETRY_KEY) === "true";

      if (isDynamicImportFailure(error) && !alreadyReloaded) {
        window.sessionStorage.setItem(RETRY_KEY, "true");
        window.location.reload();
        return new Promise<never>(() => undefined);
      }

      throw error;
    }
  });
}
