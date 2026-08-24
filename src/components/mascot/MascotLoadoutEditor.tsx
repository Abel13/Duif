import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Backpack, Check, CloudRain, Flashlight, Package, Prohibit, Wind, X } from "@phosphor-icons/react";
import { AssetImage, StampButton } from "../ui";
import { calculateLoadoutComparison, getMascotLoadout, useEquipmentData, type EquipmentInstance, type FunctionalEquipmentCatalogItem, type FunctionalEquipmentKind } from "../../game";
import { saveMascotLoadout } from "../../integrations/supabase/equipment";
import { useTranslation, type TranslationKey } from "../../i18n";
import styles from "./MascotLoadoutEditor.module.css";

export type MascotLoadoutEditorHandle = { saveDraft: () => Promise<boolean> };
type Props = { mascotId:string; disabled?:boolean; persistence?:"explicit"|"external"; mascotNames?:Record<string,string>; onSavingChange?:(saving:boolean)=>void };

export const MascotLoadoutEditor = forwardRef<MascotLoadoutEditorHandle,Props>(function MascotLoadoutEditor({mascotId,disabled=false,persistence="explicit",mascotNames={},onSavingChange},ref){
  const {t}=useTranslation(); const {data,isLoading,refresh}=useEquipmentData(); const loadout=getMascotLoadout(data,mascotId);
  const [backpackId,setBackpackId]=useState(loadout.backpackInstanceId??""); const [utilityId,setUtilityId]=useState(loadout.utilityInstanceId??"");
  const [pickerKind,setPickerKind]=useState<FunctionalEquipmentKind>(); const [saving,setSaving]=useState(false); const [error,setError]=useState(false);
  const saveInFlight=useRef<Promise<boolean>>();
  useEffect(()=>{setBackpackId(loadout.backpackInstanceId??"");setUtilityId(loadout.utilityInstanceId??"");setError(false)},[loadout.backpackInstanceId,loadout.utilityInstanceId,mascotId]);
  const byId=(id?:string)=>data.instances.find(item=>item.id===id); const backpack=byId(backpackId); const utility=byId(utilityId);
  const current=calculateLoadoutComparison(data.catalog,byId(loadout.backpackInstanceId),byId(loadout.utilityInstanceId));
  const next=calculateLoadoutComparison(data.catalog,backpack,utility); const dirty=backpackId!==(loadout.backpackInstanceId??"")||utilityId!==(loadout.utilityInstanceId??"");
  function saveDraft(){if(saveInFlight.current)return saveInFlight.current;if(!dirty)return Promise.resolve(true);const operation=(async()=>{setSaving(true);onSavingChange?.(true);setError(false);try{await saveMascotLoadout(loadout,backpackId||undefined,utilityId||undefined);await refresh();return true}catch{setError(true);return false}finally{setSaving(false);onSavingChange?.(false);saveInFlight.current=undefined}})();saveInFlight.current=operation;return operation}
  useImperativeHandle(ref,()=>({saveDraft}),[dirty,backpackId,utilityId,loadout]);
  const instances=useMemo(()=>data.instances.filter(instance=>data.catalog.some(item=>item.id===instance.catalogId&&item.kind===pickerKind)),[data.catalog,data.instances,pickerKind]);
  if(isLoading)return <p>{t("common.loading")}</p>;
  return <section className={styles.editor}>
    <p className={styles.notice}>{disabled?t("functionalEquipment.lockedDuringTravel"):t("functionalEquipment.loadoutDescription")}</p>
    <div className={styles.slots}>
      <EquipmentSlot disabled={disabled||saving} instance={backpack} item={findItem(data.catalog,backpack)} kind="backpack" onOpen={()=>setPickerKind("backpack")}/>
      <EquipmentSlot disabled={disabled||saving} instance={utility} item={findItem(data.catalog,utility)} kind="utility" onOpen={()=>setPickerKind("utility")}/>
    </div>
    <LoadoutComparison current={current} currentUtility={findItem(data.catalog,byId(loadout.utilityInstanceId))} next={next} utility={findItem(data.catalog,utility)}/>
    {error?<p className={styles.error} role="alert">{t("functionalEquipment.saveError")}</p>:null}
    {persistence==="explicit"?<StampButton disabled={disabled||saving||!dirty} onClick={()=>void saveDraft()}>{saving?t("functionalEquipment.saving"):t("functionalEquipment.saveEquipment")}</StampButton>:null}
    {pickerKind?<EquipmentPickerDialog catalog={data.catalog} currentId={pickerKind==="backpack"?backpackId:utilityId} instances={instances} kind={pickerKind} mascotId={mascotId} mascotNames={mascotNames} onClose={()=>setPickerKind(undefined)} onSelect={id=>{pickerKind==="backpack"?setBackpackId(id):setUtilityId(id);setError(false);setPickerKind(undefined)}}/>:null}
  </section>
});

const findItem=(catalog:FunctionalEquipmentCatalogItem[],instance?:EquipmentInstance)=>catalog.find(item=>item.id===instance?.catalogId);
export function EquipmentSlot({disabled,instance,item,kind,onOpen}:{disabled:boolean;instance?:EquipmentInstance;item?:FunctionalEquipmentCatalogItem;kind:FunctionalEquipmentKind;onOpen:()=>void}){
  const {t}=useTranslation();return <button className={styles.slot} disabled={disabled} onClick={onOpen} type="button"><span className={styles.slotLabel}>{t(kind==="backpack"?"functionalEquipment.backpackSlot":"functionalEquipment.utilitySlot")}</span><span className={styles.slotBody}>{item?<EquipmentArtwork item={item}/>:<span className={styles.emptyArtwork} aria-hidden="true">{kind==="backpack"?<Backpack/>:<Flashlight/>}</span>}<span className={styles.slotCopy}><strong>{item?t(item.nameKey):t("functionalEquipment.none")}</strong><small>{item?equipmentEffect(item,instance,t):t("functionalEquipment.chooseEquipment")}</small></span></span>{disabled?<span className={styles.locked}>{t("functionalEquipment.locked")}</span>:<span className={styles.change}>{t(item?"functionalEquipment.change":"functionalEquipment.choose")}</span>}</button>
}

export function EquipmentPickerDialog({catalog,currentId,instances,kind,mascotId,mascotNames,onClose,onSelect}:{catalog:FunctionalEquipmentCatalogItem[];currentId:string;instances:EquipmentInstance[];kind:FunctionalEquipmentKind;mascotId:string;mascotNames:Record<string,string>;onClose:()=>void;onSelect:(id:string)=>void}){
  const {t}=useTranslation();const dialogRef=useRef<HTMLDialogElement>(null);const opener=useRef<HTMLElement|null>(typeof document==="undefined"?null:document.activeElement as HTMLElement);
  useEffect(()=>{dialogRef.current?.showModal();return()=>opener.current?.focus()},[]);if(typeof document==="undefined")return null;
  return createPortal(<dialog aria-labelledby="equipment-picker-title" className={styles.dialog} onCancel={event=>{event.preventDefault();onClose()}} ref={dialogRef}><div className={styles.dialogPaper}><header className={styles.dialogHeader}><div><small>{t("functionalEquipment.loadout")}</small><h2 id="equipment-picker-title">{t(kind==="backpack"?"functionalEquipment.chooseBackpack":"functionalEquipment.chooseUtility")}</h2></div><button aria-label={t("functionalEquipment.closePicker")} className={styles.close} onClick={onClose} type="button"><X aria-hidden="true"/></button></header><div className={styles.catalog}><PickerCard current={!currentId} label={t("functionalEquipment.none")} onSelect={()=>onSelect("")}><span className={styles.noneIcon} aria-hidden="true"><Prohibit/></span><small>{t("functionalEquipment.removeEquipment")}</small></PickerCard>{instances.map(instance=>{const item=findItem(catalog,instance);if(!item)return null;const occupied=Boolean(instance.equippedMascotId&&instance.equippedMascotId!==mascotId);const owner=instance.equippedMascotId?mascotNames[instance.equippedMascotId]:undefined;return <PickerCard current={currentId===instance.id} disabled={occupied} key={instance.id} label={t(item.nameKey)} onSelect={()=>onSelect(instance.id)}><EquipmentArtwork item={item}/><small>{equipmentEffect(item,instance,t)}</small><span className={occupied?styles.unavailable:styles.available}>{occupied?t("functionalEquipment.assignedTo").replace("{name}",owner??t("functionalEquipment.anotherMascot")):t("functionalEquipment.available")}</span></PickerCard>})}</div>{!instances.length?<p className={styles.emptyCatalog}>{t("functionalEquipment.noOwnedEquipment")}</p>:null}</div></dialog>,document.body)
}
function PickerCard({children,current,disabled,label,onSelect}:{children:ReactNode;current:boolean;disabled?:boolean;label:string;onSelect:()=>void}){return <button aria-pressed={current} className={styles.pickerCard} disabled={disabled} onClick={onSelect} type="button">{current?<Check className={styles.check} weight="bold" aria-hidden="true"/>:null}<strong>{label}</strong>{children}</button>}
type Comparison=ReturnType<typeof calculateLoadoutComparison>;
export function LoadoutComparison({current,currentUtility,next,utility}:{current:Comparison;currentUtility?:FunctionalEquipmentCatalogItem;next:Comparison;utility?:FunctionalEquipmentCatalogItem}){const {t}=useTranslation();const protection=(item?:FunctionalEquipmentCatalogItem)=>item?.effects.length?item.effects.map(effect=>`${t(`functionalEquipment.hazards.${effect.hazardKey}` as TranslationKey)} ${Math.round(effect.mitigationPoints*100)} p.p.`).join(" · "):t("functionalEquipment.noProtection");return <dl className={styles.comparison}><ComparisonRow icon={<Wind/>} label={t("functionalEquipment.speed")} current={`${Math.round(current.speedMultiplier*100)}%`} next={`${Math.round(next.speedMultiplier*100)}%`}/><ComparisonRow icon={<Package/>} label={t("functionalEquipment.cargo")} current={String(current.slotCapacity)} next={String(next.slotCapacity)} suffix={t("functionalEquipment.volumeMarks")}/><ComparisonRow icon={<CloudRain/>} label={t("functionalEquipment.protection")} current={protection(currentUtility)} next={protection(utility)}/></dl>}
function ComparisonRow({current,icon,label,next,suffix}:{current:string;icon:ReactNode;label:string;next:string;suffix?:string}){const changed=current!==next;return <div className={styles.comparisonRow} data-changed={changed||undefined}><dt>{icon}<span>{label}</span></dt><dd>{changed?<><span>{current}</span><b aria-hidden="true">→</b><strong>{next}</strong></>:<strong>{next}</strong>}{suffix?<small>{suffix}</small>:null}</dd></div>}
function equipmentEffect(item:FunctionalEquipmentCatalogItem,instance:EquipmentInstance|undefined,t:(key:TranslationKey)=>string){if(item.kind==="backpack")return `+${item.slotBonus} ${t("functionalEquipment.slots")} · −${Math.round((1-item.speedMultiplier)*100)}%`;const protections=item.effects.map(effect=>`${t(`functionalEquipment.hazards.${effect.hazardKey}` as TranslationKey)} ${Math.round(effect.mitigationPoints*100)} p.p.`).join(", ");return `${protections} · ${instance?.usesRemaining??0}/${item.maxUses??0} ${t("functionalEquipment.uses")}`}
export function EquipmentArtwork({item}:{item:FunctionalEquipmentCatalogItem}){const {t}=useTranslation();return <AssetImage alt={t(item.nameKey)} assetKey={item.assetKey} className={styles.artwork} height={192} width={192}><span aria-hidden="true"/></AssetImage>}
