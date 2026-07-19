import type { TranslationKey } from "../i18n";

export const assetKeys = {
  mascots: {
    nuvem: "mascot.portrait.nuvem",
    trovao: "mascot.portrait.trovao",
    pipoca: "mascot.portrait.pipoca",
    aurora: "mascot.portrait.aurora",
    maple: "mascot.portrait.maple",
    bento: "mascot.portrait.bento",
    oliva: "mascot.portrait.oliva",
  },
  equipment: {
    canvasPostalBag: "equipment.icon.canvasPostalBag",
    blueRouteScarf: "equipment.icon.blueRouteScarf",
    flightGoggles: "equipment.icon.flightGoggles",
    urgentBadge: "equipment.icon.urgentBadge",
  },
  rewards: {
    wornRouteStamp: "reward.thumbnail.wornRouteStamp",
    blueAirmailLabel: "reward.thumbnail.blueAirmailLabel",
    goldenCompassPin: "reward.thumbnail.goldenCompassPin",
    atlanticBadge: "reward.thumbnail.atlanticBadge",
  },
  navigation: {
    nest: "navigation.icon.nest", collection: "navigation.icon.collection",
    map: "navigation.icon.map", friends: "navigation.icon.friends", shop: "navigation.icon.shop",
  },
  currency: { stamp: "currency.icon.stamp", crystal: "currency.icon.crystal" },
  mapControls: {
    overview: "map.control.overview", mascot: "map.control.mascot",
    origin: "map.control.origin", destination: "map.control.destination",
  },
  mapPins: { nest: "map.pin.nest", destination: "map.pin.destination" },
  shop: {
    crimsonCourierScarf: "shop.thumbnail.crimsonCourierScarf",
    meadowPostCap: "shop.thumbnail.meadowPostCap",
    sunnyRouteSticker: "shop.thumbnail.sunnyRouteSticker",
    blueEnvelopeSticker: "shop.thumbnail.blueEnvelopeSticker",
    coastalTownPostcard: "shop.thumbnail.coastalTownPostcard",
    lanternFestivalPostcard: "shop.thumbnail.lanternFestivalPostcard",
    brassNestPlaque: "shop.thumbnail.brassNestPlaque",
    airmailProfileRibbon: "shop.thumbnail.airmailProfileRibbon",
  },
  textures: { postalPaperWash: "texture.postalPaperWash" },
  postalMarks: { postalCancel: "postalMark.postalCancel", routeDoodle: "postalMark.routeDoodle" },
} as const;

type NestedValues<T> = T extends string ? T : { [K in keyof T]: NestedValues<T[K]> }[keyof T];
export type OfficialAssetKey = NestedValues<typeof assetKeys>;
export type OfficialAssetType =
  | "mascotPortrait" | "equipmentIcon" | "rewardThumbnail" | "collectibleThumbnail"
  | "navigationIcon" | "mapControl" | "mapPin" | "currencyIcon" | "shopArtwork"
  | "texture" | "postalMark";

export type OfficialAssetVersion = {
  key: OfficialAssetKey;
  type: OfficialAssetType;
  version: number;
  source: "packaged";
  path: string;
  mimeType: string;
  width: number;
  height: number;
  byteSize: number;
  altTextKey?: TranslationKey;
  isDecorative: boolean;
};
export type OfficialAssetManifest = ReadonlyMap<OfficialAssetKey, OfficialAssetVersion>;
let activeManifest: OfficialAssetManifest = new Map();

export type OfficialAssetManifestRow = {
  version: unknown; source: unknown; status: unknown; packaged_path: unknown;
  mime_type: unknown; width: unknown; height: unknown; byte_size: unknown;
  alt_text_key: unknown; is_decorative: unknown;
  official_assets: { asset_key?: unknown; asset_type?: unknown } | null;
};

const assetTypes = new Set<OfficialAssetType>([
  "mascotPortrait", "equipmentIcon", "rewardThumbnail", "collectibleThumbnail",
  "navigationIcon", "mapControl", "mapPin", "currencyIcon", "shopArtwork", "texture", "postalMark",
]);
const knownKeys = new Set<string>(Object.values(assetKeys).flatMap((group) => Object.values(group)));

export function isOfficialAssetKey(value: unknown): value is OfficialAssetKey {
  return typeof value === "string" && knownKeys.has(value);
}

export function parseOfficialAssetManifest(rows: OfficialAssetManifestRow[]): OfficialAssetManifest {
  const manifest = new Map<OfficialAssetKey, OfficialAssetVersion>();
  for (const row of rows) {
    const identity = row.official_assets;
    const key = identity?.asset_key;
    const type = identity?.asset_type;
    if (row.status !== "active" || row.source !== "packaged" || typeof key !== "string"
      || !knownKeys.has(key) || typeof type !== "string" || !assetTypes.has(type as OfficialAssetType)
      || typeof row.packaged_path !== "string" || !row.packaged_path.startsWith("/assets/")
      || typeof row.version !== "number" || !Number.isInteger(row.version) || row.version < 1
      || typeof row.width !== "number" || typeof row.height !== "number" || typeof row.byte_size !== "number"
      || typeof row.mime_type !== "string" || typeof row.is_decorative !== "boolean"
      || (row.alt_text_key !== null && typeof row.alt_text_key !== "string")) {
      throw new Error("Invalid official asset manifest row");
    }
    if (manifest.has(key as OfficialAssetKey)) throw new Error(`Duplicate official asset key: ${key}`);
    manifest.set(key as OfficialAssetKey, {
      key: key as OfficialAssetKey, type: type as OfficialAssetType, version: row.version,
      source: "packaged", path: row.packaged_path, mimeType: row.mime_type,
      width: row.width, height: row.height, byteSize: row.byte_size,
      altTextKey: row.alt_text_key as TranslationKey | null ?? undefined,
      isDecorative: row.is_decorative,
    });
  }
  return manifest;
}

export function resolveOfficialAssetPath(manifest: OfficialAssetManifest, key?: OfficialAssetKey) {
  return key ? manifest.get(key)?.path : undefined;
}

export function setActiveOfficialAssetManifest(manifest: OfficialAssetManifest) {
  activeManifest = manifest;
}

export function resolveActiveOfficialAssetPath(key?: OfficialAssetKey) {
  return resolveOfficialAssetPath(activeManifest, key);
}
