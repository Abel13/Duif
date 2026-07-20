import { useEffect, useMemo, useState } from "react";

import { TravelMap } from "../../components/map/TravelMap";
import { AssetImage, StampButton } from "../../components/ui";
import { assetKeys, getPetMapPosition, interpolateCoordinates, type MapFocusTarget, type MapMotionPreference, type OfficialAssetKey, type RouteRewardDiscovery } from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { useTranslation, type TranslationKey } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { fetchTutorialDelivery, getNextTutorialInstruction, isTutorialInstructionAvailable, type TutorialInstructionStep } from "../../integrations/supabase/tutorial";
import type { Delivery } from "../../game";
import styles from "./TutorialDeliveryPage.module.css";

export function TutorialDeliveryPage() {
  const {t}=useTranslation();
  const {acknowledgeTutorialInstruction,collectTutorialDelivery,onboarding,startOrResumeTutorialDelivery}=useAuth();
  const {mascots}=useMascotCatalog(); const mascot=mascots[0];
  const [delivery,setDelivery]=useState<Delivery>(); const [now,setNow]=useState(()=>new Date());
  const [busy,setBusy]=useState(false); const [error,setError]=useState(false);
  const [mapFocus,setMapFocus]=useState<MapFocusTarget>({kind:"overview"});
  const [hasUsedCameraControl,setHasUsedCameraControl]=useState(false);
  const motionPreference:MapMotionPreference=typeof window!=="undefined"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full";

  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(timer);},[]);
  useEffect(()=>{
    if(!delivery&&onboarding?.tutorial_delivery_id&&mascot) void fetchTutorialDelivery(onboarding.tutorial_delivery_id,mascot.id).then(setDelivery).catch(()=>setError(true));
  },[delivery,mascot,onboarding?.tutorial_delivery_id]);

  const nextStep=getNextTutorialInstruction(onboarding?.tutorial_instruction_step??null);
  const instructionReady=Boolean(delivery&&nextStep&&isTutorialInstructionAvailable(nextStep,delivery,now));
  const position=delivery?getPetMapPosition(delivery,now):undefined;
  const reward=useMemo<RouteRewardDiscovery|undefined>(()=>delivery?{
    coordinates:interpolateCoordinates(delivery.origin,delivery.destination,.5),descriptionKey:"tutorial.rewards.inauguralPostcard.description" as TranslationKey,
    discovered:Boolean(position&&position.outboundProgress>=.5),distanceFromRouteKm:0,id:"tutorial-inaugural-postcard",kind:"postcard",rarity:"common",
    regionKind:"event",regionLabel:"tutorial.locations.route",routeProgress:.5,thumbnailAssetKey:"shop.thumbnail.coastalTownPostcard",titleKey:"tutorial.rewards.inauguralPostcard.name" as TranslationKey,
  }:undefined,[delivery,position?.outboundProgress]);
  async function start(){setBusy(true);setError(false);try{const result=await startOrResumeTutorialDelivery();setDelivery(result.delivery);}catch{setError(true);}finally{setBusy(false);}}
  async function acknowledge(){if(!nextStep)return;setBusy(true);setError(false);try{await acknowledgeTutorialInstruction(nextStep);}catch{setError(true);}finally{setBusy(false);}}
  async function collect(){setBusy(true);setError(false);try{await collectTutorialDelivery();}catch{setError(true);}finally{setBusy(false);}}

  if(onboarding?.stage==="nestSetup") return <main className={styles.intro}><section className={styles.paper}><span>{t("tutorial.eyebrow")}</span><h1>{t("tutorial.completed.title")}</h1><p>{t("tutorial.completed.description")}</p><div className={styles.cargo}><strong>{t("tutorial.rewards.inauguralPostcard.name")}</strong><strong>{t("tutorial.rewards.firstRouteStamp.name")}</strong></div><p>{t("tutorial.completed.nestNext")}</p></section></main>;

  if(!delivery&&onboarding?.tutorial_delivery_id) return <main className={styles.intro}><section className={styles.paper}><p>{t("common.loading")}</p></section></main>;
  if(!delivery) return <main className={styles.intro}><section className={styles.paper}><span>{t("tutorial.eyebrow")}</span><h1>{t("tutorial.start.title")}</h1><p>{t("tutorial.start.description")}</p>{mascot&&<AssetImage alt={mascot.name} assetKey={mascot.appearance.portraitAssetKey} className={styles.portrait}><i /></AssetImage>}<StampButton disabled={busy||!mascot} onClick={()=>void start()}>{busy?t("onboarding.saving"):t("tutorial.start.action")}</StampButton>{error&&<p className={styles.error}>{t("onboarding.genericError")}</p>}</section></main>;

  const collecting=onboarding?.tutorial_instruction_step==="collection";
  return <main className={styles.page}>
    <div className={styles.boostBadge}>{t("tutorial.boost.badge")}</div>
    <div className={styles.map}>
      <TravelMap delivery={delivery} deliveryCompleted={false} destinationLabel={t("tutorial.locations.station")} destinationTitle={t("mascot.destination")} fallbackLabel={t("map.unavailable")} focusTarget={mapFocus} followMascot={false} motionPreference={motionPreference} originLabel={t("tutorial.locations.nest")} originTitle={t("mascot.origin")} petLabel={mascot?.name??""} petPortraitAssetKey={mascot?.appearance.portraitAssetKey} petPosition={position!.coordinates} placeLabels={[]} postalTraffic={[]} rewardLabels={reward?{[reward.id]:t(reward.titleKey)}:{}} rewardStates={reward?{[reward.id]:reward.discovered?"carried":"future"}:{}} rewards={reward?[reward]:[]} selection={null} onFollowChange={()=>undefined} onPetSelect={()=>undefined} onRewardDiscoveries={()=>undefined} onRewardSelect={()=>undefined} onTrafficSelect={()=>undefined} onViewportChange={()=>undefined}/>
    </div>
    <TutorialCameraControls
      highlightMascot={!hasUsedCameraControl}
      onFocus={(target)=>{setHasUsedCameraControl(true);setMapFocus(target);}}
    />
    <section className={styles.guide} aria-live="polite">
      <span>{t("tutorial.eyebrow")}</span>
      {collecting?<><h1>{t("tutorial.collection.title")}</h1><p>{t("tutorial.collection.description")}</p><StampButton disabled={busy} onClick={()=>void collect()}>{busy?t("rewards.collecting"):t("tutorial.collection.action")}</StampButton></>:nextStep&&instructionReady?<><h1>{t(`tutorial.steps.${nextStep}.title` as TranslationKey)}</h1><p>{t(`tutorial.steps.${nextStep}.description` as TranslationKey)}</p><StampButton disabled={busy} onClick={()=>void acknowledge()}>{busy?t("onboarding.saving"):t("tutorial.continue")}</StampButton></>:<><h1>{t("tutorial.traveling.title")}</h1><p>{t("tutorial.traveling.description")}</p></>}
      {error&&<p className={styles.error}>{t("onboarding.genericError")}</p>}
    </section>
  </main>;
}

function TutorialCameraControls({highlightMascot,onFocus}:{highlightMascot:boolean;onFocus:(target:MapFocusTarget)=>void}){
  const {t}=useTranslation();
  const controls:readonly {asset:OfficialAssetKey;kind:"overview"|"mascot"|"origin"|"destination";label:TranslationKey}[]=[
    {asset:assetKeys.mapControls.overview,kind:"overview",label:"map.overview"},
    {asset:assetKeys.mapControls.mascot,kind:"mascot",label:"map.focusMascot"},
    {asset:assetKeys.mapControls.origin,kind:"origin",label:"map.focusOrigin"},
    {asset:assetKeys.mapControls.destination,kind:"destination",label:"map.focusDestination"},
  ];
  return <div className={styles.cameraGuide}>
    {highlightMascot&&<p id="tutorial-camera-hint">{t("tutorial.controls.hint")}</p>}
    <nav aria-label={t("map.cameraControls")} className={styles.cameraControls}>
      {controls.map((control)=><button
        aria-describedby={highlightMascot&&control.kind==="mascot"?"tutorial-camera-hint":undefined}
        aria-label={t(control.label)}
        className={highlightMascot&&control.kind==="mascot"?styles.recommendedControl:undefined}
        key={control.kind}
        onClick={()=>onFocus({kind:control.kind})}
        title={t(control.label)}
        type="button"
      >
        <AssetImage alt="" assetKey={control.asset} className={styles.cameraControlIcon} loading="eager"><i /></AssetImage>
        {highlightMascot&&control.kind==="mascot"&&<small>{t("tutorial.controls.startHere")}</small>}
      </button>)}
    </nav>
  </div>;
}
