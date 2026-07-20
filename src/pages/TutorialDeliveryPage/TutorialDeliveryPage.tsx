import { useEffect, useMemo, useRef, useState } from "react";

import { TravelMap } from "../../components/map/TravelMap";
import { AssetImage, StampButton } from "../../components/ui";
import { assetKeys, getDeliveryStatus, getPetMapPosition, interpolateCoordinates, type MapFocusTarget, type MapMotionPreference, type OfficialAssetKey, type RouteRewardDiscovery } from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { useTranslation, type TranslationKey } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { fetchTutorialDelivery, getNextTutorialInstruction, isTutorialInstructionAvailable, type TutorialInstructionStep } from "../../integrations/supabase/tutorial";
import type { Delivery } from "../../game";
import styles from "./TutorialDeliveryPage.module.css";

type TutorialCameraControlKind = "overview" | "mascot" | "origin" | "destination";
const tutorialCameraGuideOrder: readonly TutorialCameraControlKind[] = ["mascot", "destination", "origin", "overview"];

export function TutorialDeliveryPage() {
  const {t}=useTranslation();
  const {acknowledgeTutorialInstruction,collectTutorialDelivery,onboarding,startOrResumeTutorialDelivery}=useAuth();
  const {mascots}=useMascotCatalog(); const mascot=mascots[0];
  const [delivery,setDelivery]=useState<Delivery>(); const [now,setNow]=useState(()=>new Date());
  const [busy,setBusy]=useState(false); const [error,setError]=useState(false);
  const [mapFocus,setMapFocus]=useState<MapFocusTarget>({kind:"overview"});
  const [followMascot,setFollowMascot]=useState(false);
  const [cameraGuideStep,setCameraGuideStep]=useState(0);
  const [isWaitingForNextCameraGuide,setIsWaitingForNextCameraGuide]=useState(false);
  const cameraGuideTimer=useRef<number>();
  const motionPreference:MapMotionPreference=typeof window!=="undefined"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full";

  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(timer);},[]);
  useEffect(()=>()=>{if(cameraGuideTimer.current!==undefined) window.clearTimeout(cameraGuideTimer.current);},[]);
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
  const highlightedControl=isWaitingForNextCameraGuide?undefined:tutorialCameraGuideOrder[cameraGuideStep];
  const deliveryStatus=getDeliveryStatus(delivery,now);
  return <main className={styles.page}>
    <div aria-label={t("tutorial.boost.badge")} className={styles.activeItem} role="img" title={t("tutorial.boost.badge")}>
      <AssetImage alt="" assetKey={assetKeys.activeItems.firstJourneyBoost} className={styles.activeItemArtwork} loading="eager"><i /></AssetImage>
    </div>
    <p className={styles.travelStatus} role="status">
      <strong>{mascot?.name}</strong>
      <span>{t(`delivery.status.${deliveryStatus}` as TranslationKey)}</span>
    </p>
    <div className={styles.map}>
      <TravelMap delivery={delivery} deliveryCompleted={false} destinationLabel={t("tutorial.locations.station")} destinationTitle={t("mascot.destination")} fallbackLabel={t("map.unavailable")} focusTarget={mapFocus} followMascot={followMascot} motionPreference={motionPreference} originLabel={t("tutorial.locations.nest")} originTitle={t("mascot.origin")} petLabel={mascot?.name??""} petPortraitAssetKey={mascot?.appearance.portraitAssetKey} petPosition={position!.coordinates} placeLabels={[]} postalTraffic={[]} rewardLabels={reward?{[reward.id]:t(reward.titleKey)}:{}} rewardStates={reward?{[reward.id]:reward.discovered?"carried":"future"}:{}} rewards={reward?[reward]:[]} selection={null} onFollowChange={setFollowMascot} onPetSelect={()=>undefined} onRewardDiscoveries={()=>undefined} onRewardSelect={()=>undefined} onTrafficSelect={()=>undefined} onViewportChange={()=>undefined}/>
    </div>
    <TutorialCameraControls
      highlightedControl={highlightedControl}
      followMascot={followMascot}
      onFocus={(target)=>{
        setMapFocus({kind:target});
        if(target==="mascot") setFollowMascot((following)=>!following);
        else setFollowMascot(false);
        if(target!==highlightedControl||isWaitingForNextCameraGuide) return;
        setIsWaitingForNextCameraGuide(true);
        cameraGuideTimer.current=window.setTimeout(()=>{
          setCameraGuideStep((step)=>Math.min(step+1,tutorialCameraGuideOrder.length));
          setIsWaitingForNextCameraGuide(false);
        },5000);
      }}
    />
    <section className={styles.guide} aria-live="polite">
      <span>{t("tutorial.eyebrow")}</span>
      {collecting?<><h1>{t("tutorial.collection.title")}</h1><p>{t("tutorial.collection.description")}</p><StampButton disabled={busy} onClick={()=>void collect()}>{busy?t("rewards.collecting"):t("tutorial.collection.action")}</StampButton></>:nextStep&&instructionReady?<><h1>{t(`tutorial.steps.${nextStep}.title` as TranslationKey)}</h1><p>{t(`tutorial.steps.${nextStep}.description` as TranslationKey)}</p><StampButton disabled={busy} onClick={()=>void acknowledge()}>{busy?t("onboarding.saving"):t("tutorial.continue")}</StampButton></>:<><h1>{t("tutorial.traveling.title")}</h1><p>{t("tutorial.traveling.description")}</p></>}
      {error&&<p className={styles.error}>{t("onboarding.genericError")}</p>}
    </section>
  </main>;
}

function TutorialCameraControls({followMascot,highlightedControl,onFocus}:{followMascot:boolean;highlightedControl:TutorialCameraControlKind|undefined;onFocus:(target:TutorialCameraControlKind)=>void}){
  const {t}=useTranslation();
  const controls:readonly {asset:OfficialAssetKey;kind:TutorialCameraControlKind;label:TranslationKey;instruction:TranslationKey}[]=[
    {asset:assetKeys.mapControls.overview,kind:"overview",label:"map.overview",instruction:"tutorial.controls.instructions.overview"},
    {asset:assetKeys.mapControls.mascot,kind:"mascot",label:"map.focusMascot",instruction:"tutorial.controls.instructions.mascot"},
    {asset:assetKeys.mapControls.origin,kind:"origin",label:"map.focusOrigin",instruction:"tutorial.controls.instructions.origin"},
    {asset:assetKeys.mapControls.destination,kind:"destination",label:"map.focusDestination",instruction:"tutorial.controls.instructions.destination"},
  ];
  const highlightedInstruction=controls.find((control)=>control.kind===highlightedControl)?.instruction;
  return <div className={styles.cameraGuide}>
    {highlightedInstruction&&<p aria-live="polite" id="tutorial-camera-hint">{t(highlightedInstruction)}</p>}
    <nav aria-label={t("map.cameraControls")} className={styles.cameraControls}>
      {controls.map((control)=><button
        aria-describedby={highlightedControl===control.kind?"tutorial-camera-hint":undefined}
        aria-label={t(control.kind==="mascot"?(followMascot?"map.stopFollowing":"map.followMascot"):control.label)}
        aria-pressed={control.kind==="mascot"?followMascot:undefined}
        className={highlightedControl===control.kind?styles.recommendedControl:undefined}
        key={control.kind}
        onClick={()=>onFocus(control.kind)}
        title={t(control.kind==="mascot"?(followMascot?"map.stopFollowing":"map.followMascot"):control.label)}
        type="button"
      >
        <AssetImage alt="" assetKey={control.asset} className={styles.cameraControlIcon} loading="eager"><i /></AssetImage>
        {highlightedControl===control.kind&&<small>{t("tutorial.controls.startHere")}</small>}
      </button>)}
    </nav>
  </div>;
}
