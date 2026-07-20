import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { StampButton } from "../../components/ui";
import { quantizeNestCoordinate, type NestSearchResult, type NestSelection } from "../../game/nest";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { searchNestCities } from "../../integrations/supabase/nest";
import styles from "./NestSetupPage.module.css";

const style: maplibregl.StyleSpecification={version:8,sources:{osm:{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"© OpenStreetMap contributors"}},layers:[{id:"paper",type:"background",paint:{"background-color":"#eadfca"}},{id:"osm",type:"raster",source:"osm",paint:{"raster-opacity":.62,"raster-saturation":-.7}}]};

export function NestSetupPage(){
  const {t}=useTranslation(); const navigate=useNavigate(); const {completeNestSetup}=useAuth();
  const mapNode=useRef<HTMLDivElement>(null); const map=useRef<maplibregl.Map>(); const marker=useRef<maplibregl.Marker>();
  const [query,setQuery]=useState("");const [results,setResults]=useState<NestSearchResult[]>([]);const [selectedCity,setSelectedCity]=useState<NestSearchResult>();const [selection,setSelection]=useState<NestSelection>();const [busy,setBusy]=useState(false);const [error,setError]=useState(false);
  useEffect(()=>{if(!mapNode.current)return;const instance=new maplibregl.Map({container:mapNode.current,style,center:[0,15],zoom:1.5,attributionControl:false});instance.addControl(new maplibregl.NavigationControl({showCompass:false}),"top-right");instance.on("click",(event)=>choose({latitude:event.lngLat.lat,longitude:event.lngLat.lng}));map.current=instance;return()=>instance.remove();},[]);
  function choose(value:NestSelection){setSelection(value);if(!map.current)return;if(!marker.current) marker.current=new maplibregl.Marker({color:"#a44a3f"}).setLngLat([value.longitude,value.latitude]).addTo(map.current);else marker.current.setLngLat([value.longitude,value.latitude]);}
  async function search(){setBusy(true);setError(false);try{setResults(await searchNestCities(query.trim()));}catch{setError(true);}finally{setBusy(false);}}
  async function confirm(){if(!selection||!selectedCity)return;setBusy(true);setError(false);try{await completeNestSetup(selection,selectedCity.id);navigate("/map",{replace:true});}catch{setError(true);}finally{setBusy(false);}}
  const approximate=selection?quantizeNestCoordinate(selection):undefined;
  return <main className={styles.page}><section className={styles.paper}><span>{t("nest.eyebrow")}</span><h1>{t("nest.title")}</h1><p>{t("nest.description")}</p><form className={styles.search} onSubmit={(event)=>{event.preventDefault();void search();}}><label><span>{t("nest.searchLabel")}</span><input maxLength={120} onChange={(event)=>setQuery(event.target.value)} placeholder={t("nest.searchPlaceholder")} value={query}/></label><StampButton disabled={busy||query.trim().length<2} type="submit">{t("nest.searchAction")}</StampButton></form>{results.length>0&&<ul className={styles.results}>{results.map((result)=><li key={result.id}><button onClick={()=>{setSelectedCity(result);map.current?.flyTo({center:[result.longitude,result.latitude],zoom:11});setResults([]);}} type="button">{result.label}</button></li>)}</ul>}{selectedCity&&<p className={styles.selection}>{t("nest.selectedCity").replace("{city}",selectedCity.label)}</p>}<div aria-label={t("nest.mapLabel")} className={styles.map} ref={mapNode}/><p className={styles.note}>{t("nest.privacyNote")}</p>{approximate&&<p className={styles.selection}>{t("nest.selectionReady")}</p>}<StampButton disabled={busy||!selection||!selectedCity} onClick={()=>void confirm()}>{busy?t("onboarding.saving"):t("nest.confirmAction")}</StampButton>{error&&<p className={styles.error}>{t("onboarding.genericError")}</p>}</section></main>;
}
