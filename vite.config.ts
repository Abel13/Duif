import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "DUIF",
        short_name: "DUIF",
        description: "Um app postal de mascotes mensageiros.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#f7f1e3",
        background_color: "#f7f1e3",
        icons: [
          {
            src: "/assets/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/assets/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/assets/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,webp,png,json}"],
        // VitePWA adds manifest icons to the precache itself. Excluding them
        // here prevents Workbox from receiving the same URL both with and
        // without a revision, which otherwise aborts service-worker install.
        globIgnores: [
          "assets/icons/icon-192.png",
          "assets/icons/icon-512.png",
          "assets/icons/icon-maskable-512.png",
        ],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "duif-static-assets",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
});
