import type { TranslationKey } from "../../i18n";
import { getMascotById, starterMascots } from "../../game/mockData";
import type {
  EquipmentItem,
  EquipmentRarity,
  EquipmentType,
  Mascot,
  MascotAppearance,
  MascotAttributeSet,
  MascotTrait,
  Skill,
} from "../../game/types";
import type { Database, Json } from "./database.types";

export const STARTER_MASCOT_IDS = [
  "mascot-nuvem",
  "mascot-trovao",
  "mascot-pipoca",
] as const;

export type StarterMascotId = (typeof STARTER_MASCOT_IDS)[number];
export type MascotTemplateRow = Database["public"]["Tables"]["mascot_templates"]["Row"];

const equipmentTypes = new Set<EquipmentType>(["bag", "scarf", "cap", "badge", "goggles", "charm"]);
const rarities = new Set<EquipmentRarity>(["common", "uncommon", "rare"]);
const traitEffects = new Set<MascotTrait["effect"]>([
  "rareFind",
  "fastReturn",
  "deliveryReward",
  "eventDiscovery",
  "friendshipBonus",
]);

function isRecord(value: Json | unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readTranslationKey(value: unknown, fallback: TranslationKey) {
  return readString(value, fallback) as TranslationKey;
}

function mapAttributes(value: Json, fallback: MascotAttributeSet): MascotAttributeSet {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    luck: readNumber(value.luck, fallback.luck),
    orientation: readNumber(value.orientation, fallback.orientation),
    speed: readNumber(value.speed, fallback.speed),
    stamina: readNumber(value.stamina, fallback.stamina),
  };
}

function mapTrait(value: Json, fallback: MascotTrait): MascotTrait {
  if (!isRecord(value)) {
    return fallback;
  }

  const effect = readString(value.effect, fallback.effect);

  return {
    descriptionKey: readTranslationKey(value.descriptionKey, fallback.descriptionKey),
    effect: traitEffects.has(effect as MascotTrait["effect"])
      ? (effect as MascotTrait["effect"])
      : fallback.effect,
    id: readString(value.id, fallback.id),
    nameKey: readTranslationKey(value.nameKey, fallback.nameKey),
  };
}

function mapEquipmentItem(value: unknown, fallback?: EquipmentItem): EquipmentItem | undefined {
  if (!isRecord(value)) {
    return fallback;
  }

  const type = readString(value.type, fallback?.type ?? "bag");
  const rarity = readString(value.rarity, fallback?.rarity ?? "common");

  return {
    descriptionKey:
      typeof value.descriptionKey === "string"
        ? (value.descriptionKey as TranslationKey)
        : fallback?.descriptionKey,
    equipped: readBoolean(value.equipped, fallback?.equipped ?? false),
    iconAssetPath:
      typeof value.iconAssetPath === "string" ? value.iconAssetPath : fallback?.iconAssetPath,
    id: readString(value.id, fallback?.id ?? "equipment-fallback"),
    nameKey: readTranslationKey(value.nameKey, fallback?.nameKey ?? "equipment.canvasPostalBag.name"),
    rarity: rarities.has(rarity as EquipmentRarity) ? (rarity as EquipmentRarity) : "common",
    type: equipmentTypes.has(type as EquipmentType) ? (type as EquipmentType) : "bag",
  };
}

function mapEquipment(value: Json, fallback: EquipmentItem[]): EquipmentItem[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const mappedEquipment = value
    .map((item, index) => mapEquipmentItem(item, fallback[index]))
    .filter((item): item is EquipmentItem => Boolean(item));

  return mappedEquipment.length > 0 ? mappedEquipment : fallback;
}

function mapSkill(value: unknown, fallback?: Skill): Skill | undefined {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    descriptionKey: readTranslationKey(value.descriptionKey, fallback?.descriptionKey ?? "skills.longRoute.description"),
    id: readString(value.id, fallback?.id ?? "skill-fallback"),
    level: readNumber(value.level, fallback?.level ?? 1),
    nameKey: readTranslationKey(value.nameKey, fallback?.nameKey ?? "skills.longRoute.name"),
  };
}

function mapSkills(value: Json, fallback: Skill[]): Skill[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const mappedSkills = value
    .map((skill, index) => mapSkill(skill, fallback[index]))
    .filter((skill): skill is Skill => Boolean(skill));

  return mappedSkills.length > 0 ? mappedSkills : fallback;
}

function mapAppearance(value: Json, fallback: MascotAppearance): MascotAppearance {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    accentColor: readString(value.accentColor, fallback.accentColor),
    portraitAssetPath:
      typeof value.portraitAssetPath === "string"
        ? value.portraitAssetPath
        : fallback.portraitAssetPath,
    portraitPlaceholderKey: readTranslationKey(
      value.portraitPlaceholderKey,
      fallback.portraitPlaceholderKey,
    ),
    primaryColor: readString(value.primaryColor, fallback.primaryColor),
  };
}

export function selectStarterMascotTemplateRows(rows: MascotTemplateRow[]) {
  const starterIds = new Set<string>(STARTER_MASCOT_IDS);

  return rows
    .filter((row) => starterIds.has(row.mock_key))
    .sort(
      (firstRow, secondRow) =>
        STARTER_MASCOT_IDS.indexOf(firstRow.mock_key as StarterMascotId) -
        STARTER_MASCOT_IDS.indexOf(secondRow.mock_key as StarterMascotId),
    );
}

export function mapMascotTemplateRowToMascot(
  row: MascotTemplateRow,
  fallbackMascot = getMascotById(row.mock_key) ?? starterMascots[0],
): Mascot {
  return {
    appearance: mapAppearance(row.appearance, fallbackMascot.appearance),
    attributes: mapAttributes(row.attributes, fallbackMascot.attributes),
    currentDelivery: fallbackMascot.currentDelivery,
    equipment: mapEquipment(row.equipment, fallbackMascot.equipment),
    id: readString(row.mock_key, fallbackMascot.id),
    level: readNumber(row.base_level, fallbackMascot.level),
    name: readString(row.name, fallbackMascot.name),
    nextLevelXp: readNumber(row.next_level_xp, fallbackMascot.nextLevelXp),
    skills: mapSkills(row.skills, fallbackMascot.skills),
    speciesKey: readTranslationKey(row.species_key, fallbackMascot.speciesKey),
    trait: mapTrait(row.trait, fallbackMascot.trait),
    xp: readNumber(row.base_xp, fallbackMascot.xp),
  };
}

export function mapStarterMascotTemplateRows(rows: MascotTemplateRow[]) {
  const selectedRows = selectStarterMascotTemplateRows(rows);
  const rowsById = new Map(selectedRows.map((row) => [row.mock_key, row]));

  return STARTER_MASCOT_IDS.map((mascotId) => {
    const fallbackMascot = getMascotById(mascotId) ?? starterMascots[0];
    const row = rowsById.get(mascotId);

    return row ? mapMascotTemplateRowToMascot(row, fallbackMascot) : fallbackMascot;
  });
}
