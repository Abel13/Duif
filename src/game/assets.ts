const PUBLIC_ASSET_ROOT = "/assets";

export const assetPaths = {
  mascots: {
    portrait: (fileName: string) => `${PUBLIC_ASSET_ROOT}/mascots/portraits/${fileName}`,
    publicPortrait: (fileName: string) => `${PUBLIC_ASSET_ROOT}/mascots/public/${fileName}`,
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
  shop: {
    thumbnail: (fileName: string) => `${PUBLIC_ASSET_ROOT}/shop/thumbnails/${fileName}`,
  },
  currency: {
    icon: (fileName: string) => `${PUBLIC_ASSET_ROOT}/currency/${fileName}`,
  },
  mapControls: {
    icon: (fileName: string) => `${PUBLIC_ASSET_ROOT}/map/controls/${fileName}`,
  },
  mapPins: {
    image: (fileName: string) => `${PUBLIC_ASSET_ROOT}/map/pins/${fileName}`,
  },
  navigation: {
    icon: (fileName: string) => `${PUBLIC_ASSET_ROOT}/navigation/${fileName}`,
  },
  textures: {
    image: (fileName: string) => `${PUBLIC_ASSET_ROOT}/textures/${fileName}`,
  },
} as const;

export function hasAssetPath(value?: string) {
  return typeof value === "string" && value.trim().length > 0;
}
