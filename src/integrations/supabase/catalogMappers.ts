import type { TranslationKey } from "../../i18n";
import type {
  EquipmentItem, EquipmentRarity, EquipmentType, MascotAppearance, MascotArchetype,
  MascotAttributeSet, MascotTrait, Skill,
} from "../../game/types";
import type { Database, Json } from "./database.types";

export const STARTER_MASCOT_IDS = ["mascot-nuvem", "mascot-trovao", "mascot-pipoca"] as const;
export type StarterMascotId = (typeof STARTER_MASCOT_IDS)[number];
export type MascotTemplateRow = Database["public"]["Tables"]["mascot_templates"]["Row"];

const equipmentTypes = new Set<EquipmentType>(["bag","scarf","cap","badge","goggles","charm"]);
const rarities = new Set<EquipmentRarity>(["common","uncommon","rare"]);
const traitEffects = new Set<MascotTrait["effect"]>(["rareFind","fastReturn","deliveryReward","eventDiscovery","friendshipBonus"]);

export class CatalogContractError extends Error {}

function record(value: Json | unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new CatalogContractError(`Invalid ${label}`);
  return value as Record<string, unknown>;
}
export function requireString(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim().length === 0) throw new CatalogContractError(`Invalid ${label}`);
  return value;
}
export function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}
export function readNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
export function readTranslationKey(value: unknown, fallback: TranslationKey) {
  return readString(value, fallback) as TranslationKey;
}
export function requireTranslationKey(value: unknown, label: string) {
  return requireString(value, label) as TranslationKey;
}
export function mapAttributes(value: Json, fallback?: MascotAttributeSet): MascotAttributeSet {
  const item = record(value,"attributes");
  const number = (key: keyof MascotAttributeSet) => {
    const candidate=item[key];
    if(typeof candidate!=="number"||!Number.isFinite(candidate)) {
      if(fallback) return fallback[key];
      throw new CatalogContractError(`Invalid attribute ${key}`);
    }
    return candidate;
  };
  return {speed:number("speed"),stamina:number("stamina"),orientation:number("orientation"),luck:number("luck")};
}
export function mapTrait(value: Json, fallback?: MascotTrait): MascotTrait {
  const item=record(value,"trait"); const effect=requireString(item.effect,"trait effect");
  if(!traitEffects.has(effect as MascotTrait["effect"])) {
    if(fallback) return fallback;
    throw new CatalogContractError("Invalid trait effect");
  }
  return {id:requireString(item.id,"trait id"),nameKey:requireTranslationKey(item.nameKey,"trait name key"),
    descriptionKey:requireTranslationKey(item.descriptionKey,"trait description key"),effect:effect as MascotTrait["effect"]};
}
function mapEquipmentItem(value:unknown):EquipmentItem {
  const item=record(value,"equipment"); const type=requireString(item.type,"equipment type"); const rarity=requireString(item.rarity,"equipment rarity");
  if(!equipmentTypes.has(type as EquipmentType)||!rarities.has(rarity as EquipmentRarity)) throw new CatalogContractError("Invalid equipment contract");
  return {id:requireString(item.id,"equipment id"),nameKey:requireTranslationKey(item.nameKey,"equipment name key"),
    descriptionKey:item.descriptionKey===undefined?undefined:requireTranslationKey(item.descriptionKey,"equipment description key"),
    type:type as EquipmentType,rarity:rarity as EquipmentRarity,equipped:typeof item.equipped==="boolean"?item.equipped:false,
    iconAssetPath:typeof item.iconAssetPath==="string"?item.iconAssetPath:undefined};
}
export function mapEquipment(value:Json, fallback?:EquipmentItem[]):EquipmentItem[]{
  if(!Array.isArray(value)) {if(fallback)return fallback; throw new CatalogContractError("Invalid equipment list");}
  return value.map(mapEquipmentItem);
}
function mapSkill(value:unknown):Skill {const item=record(value,"skill");
  if(typeof item.level!=="number"||!Number.isFinite(item.level))throw new CatalogContractError("Invalid skill level");
  return {id:requireString(item.id,"skill id"),nameKey:requireTranslationKey(item.nameKey,"skill name key"),
    descriptionKey:requireTranslationKey(item.descriptionKey,"skill description key"),level:item.level};}
export function mapSkills(value:Json,fallback?:Skill[]):Skill[]{
  if(!Array.isArray(value)){if(fallback)return fallback;throw new CatalogContractError("Invalid skills list");} return value.map(mapSkill);
}
export function mapAppearance(value:Json,fallback?:MascotAppearance):MascotAppearance{
  const item=record(value,"appearance");
  return {primaryColor:requireString(item.primaryColor,"primary color"),accentColor:requireString(item.accentColor,"accent color"),
    portraitPlaceholderKey:requireTranslationKey(item.portraitPlaceholderKey,"portrait key"),
    portraitAssetPath:typeof item.portraitAssetPath==="string"?item.portraitAssetPath:fallback?.portraitAssetPath};
}
export function selectStarterMascotTemplateRows(rows:MascotTemplateRow[]){
  const ids=new Set<string>(STARTER_MASCOT_IDS); return rows.filter(row=>row.status==="active"&&ids.has(row.catalog_key))
    .sort((a,b)=>STARTER_MASCOT_IDS.indexOf(a.catalog_key as StarterMascotId)-STARTER_MASCOT_IDS.indexOf(b.catalog_key as StarterMascotId));
}
export function mapMascotTemplateRowToArchetype(row:MascotTemplateRow):MascotArchetype{
  if(row.status!=="active")throw new CatalogContractError("Archetype is not active");
  return {id:row.id,catalogKey:row.catalog_key,speciesKey:requireTranslationKey(row.species_key,"species key"),
    suggestedNameKey:requireTranslationKey(row.suggested_name_key,"suggested name key"),baseLevel:row.base_level,baseXp:row.base_xp,
    nextLevelXp:row.next_level_xp,attributes:mapAttributes(row.attributes),trait:mapTrait(row.trait),equipment:mapEquipment(row.equipment),
    skills:mapSkills(row.skills),appearance:mapAppearance(row.appearance)};
}
export function mapStarterMascotTemplateRows(rows:MascotTemplateRow[]){return selectStarterMascotTemplateRows(rows).map(mapMascotTemplateRowToArchetype);}
