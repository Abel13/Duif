const PUBLIC_ASSET_ROOT = "/assets";

export const assetPaths = {
  mascots: {
    portrait: (fileName: string) => `${PUBLIC_ASSET_ROOT}/mascots/portraits/${fileName}`,
  },
  friends: {
    mascot: (fileName: string) => `${PUBLIC_ASSET_ROOT}/friends/mascots/${fileName}`,
  },
  items: {
    thumbnail: (fileName: string) => `${PUBLIC_ASSET_ROOT}/items/thumbnails/${fileName}`,
  },
  equipment: {
    icon: (fileName: string) => `${PUBLIC_ASSET_ROOT}/equipment/icons/${fileName}`,
  },
  textures: {
    image: (fileName: string) => `${PUBLIC_ASSET_ROOT}/textures/${fileName}`,
  },
} as const;

export function hasAssetPath(value?: string) {
  return typeof value === "string" && value.trim().length > 0;
}
