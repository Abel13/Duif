/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html"), {
    denylist: [/^\/api\//, /^\/functions\//],
  }),
);

type PushPayload = {
  title?: string;
  body?: string;
  deepLink?: string;
};

self.addEventListener("push", (event) => {
  let payload: PushPayload = {};
  try {
    payload = event.data ? (event.data.json() as PushPayload) : {};
  } catch {
    payload = { body: event.data?.text() };
  }

  const title = typeof payload.title === "string" && payload.title.trim()
    ? payload.title
    : "DUIF";
  const body = typeof payload.body === "string" ? payload.body : "";
  const deepLink = sanitizeDeepLink(payload.deepLink);

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { deepLink },
      lang: "pt-BR",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const deepLink = sanitizeDeepLink(
    typeof event.notification.data?.deepLink === "string"
      ? event.notification.data.deepLink
      : "/nest",
  );

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windowClients) {
      if ("focus" in client) {
        await client.focus();
        if ("navigate" in client) {
          await (client as WindowClient).navigate(deepLink);
        }
        return;
      }
    }
    await self.clients.openWindow(deepLink);
  })());
});

function sanitizeDeepLink(candidate: unknown) {
  if (typeof candidate !== "string") return "/nest";
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/nest";
  if (candidate.startsWith("/auth")) return "/nest";
  return candidate;
}
