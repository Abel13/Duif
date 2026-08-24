import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeOpenMeteo, openMeteoUrl } from "../_shared/travel-weather.ts";

const jsonHeaders={"Content-Type":"application/json"};
type Cell={cell_latitude:number;cell_longitude:number;block_start:string;cached_weather_code:number|null;cached_is_day:boolean|null;cached_wind_speed_kmh:number|null;cached_wind_gust_kmh:number|null;cached_source:"openMeteo"|"virtual"|null};

Deno.serve(async (request)=>{
  if (request.method!=="POST") return response({error:"method_not_allowed"},405);
  const url=Deno.env.get("SUPABASE_URL")??"", serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
  const authorization=request.headers.get("Authorization")??"";
  if (!url || !serviceKey || authorization!==`Bearer ${serviceKey}`) return response({error:"unauthorized"},401);
  const admin=createClient(url,serviceKey,{auth:{persistSession:false}});
  const {data,error}=await admin.rpc("pending_weather_forecast_requests",{reference_time:new Date().toISOString()});
  if (error) return response({error:"forecast_cells_unavailable"},500);
  const cells=(data??[]) as Cell[]; const baseUrl=Deno.env.get("OPEN_METEO_BASE_URL")??""; const apiKey=Deno.env.get("OPEN_METEO_API_KEY")??"";
  const isLocal=/localhost|127\.0\.0\.1/.test(url); const allowPublicEndpoint=Deno.env.get("OPEN_METEO_ALLOW_PUBLIC_ENDPOINT")==="true";
  const providerEnabled=Boolean(baseUrl) && (isLocal || allowPublicEndpoint || Boolean(apiKey));
  let applied=0,failed=0,circuitOpen=false;
  for (const cell of cells) {
    if (cell.cached_weather_code!==null && cell.cached_is_day!==null && cell.cached_wind_speed_kmh!==null && cell.cached_wind_gust_kmh!==null) {
      const {error:cacheError}=await admin.rpc("apply_weather_forecast",{cell_latitude:cell.cell_latitude,cell_longitude:cell.cell_longitude,block_start:cell.block_start,weather_code:cell.cached_weather_code,is_day:cell.cached_is_day,wind_speed_kmh:cell.cached_wind_speed_kmh,wind_gust_kmh:cell.cached_wind_gust_kmh,source:cell.cached_source??"openMeteo"});
      if (cacheError) failed++; else applied++; continue;
    }
    if (!providerEnabled) continue;
    if (failed>=3) { circuitOpen=true; break; }
    try {
      const payload=await fetchWeather(openMeteoUrl(baseUrl,cell.cell_latitude,cell.cell_longitude,apiKey||undefined));
      const normalized=normalizeOpenMeteo(payload,cell.block_start); if (!normalized) throw new Error("invalid_provider_payload");
      const {error:applyError}=await admin.rpc("apply_weather_forecast",{cell_latitude:cell.cell_latitude,cell_longitude:cell.cell_longitude,block_start:cell.block_start,weather_code:normalized.weatherCode,is_day:normalized.isDay,wind_speed_kmh:normalized.windSpeedKmh,wind_gust_kmh:normalized.windGustKmh,source:"openMeteo"});
      if (applyError) throw new Error("forecast_apply_failed"); applied++;
    } catch { failed++; }
  }
  const {data:resolved,error:resolveError}=await admin.rpc("resolve_due_delivery_route_segments",{reference_time:new Date().toISOString()});
  if (resolveError) return response({error:"segment_resolution_failed",applied,failed},500);
  return response({cells:cells.length,applied,failed,resolved,circuitOpen,fallback:!providerEnabled||failed>0});
});

async function fetchWeather(url:string) {
  let lastError:unknown;
  for (let attempt=0;attempt<2;attempt++) { const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),4500); try { const result=await fetch(url,{signal:controller.signal,headers:{Accept:"application/json"}}); if (!result.ok) throw new Error("provider_error"); return await result.json(); } catch(error){lastError=error;} finally {clearTimeout(timeout);} }
  throw lastError;
}
function response(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:jsonHeaders});}
