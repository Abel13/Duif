/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_DUIF_REQUIRE_PWA_INSTALL?: string;
  readonly VITE_MAP_VECTOR_TILES_URL?: string;
  readonly VITE_MAP_GLYPHS_URL?: string;
}
