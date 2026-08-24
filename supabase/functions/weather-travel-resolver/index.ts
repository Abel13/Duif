import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authorizeCronRequest } from "../_shared/cron-auth.ts";
import { normalizeOpenMeteo, openMeteoUrl, weatherProviderFailureCode, type WeatherProviderFailureCode } from "../_shared/travel-weather.ts";

const jsonHeaders={"Content-Type":"application/json"};
type Cell={cell_latitude:number;cell_longitude:number;block_start:string;cached_weather_code:number|null;cached_is_day:boolean|null;cached_wind_speed_kmh:number|null;cached_wind_gust_kmh:number|null;cached_temperature_c:number|null;cached_source:"openMeteo"|"virtual"|null};

Deno.serve(async (request)=>{
  const url=Deno.env.get("SUPABASE_URL")??"", serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"", cronSecret=Deno.env.get("WEATHER_RESOLVER_CRON_SECRET")??"";
  const authorization=await authorizeCronRequest({method:request.method,providedSecret:request.headers.get("X-Duif-Cron-Secret"),expectedSecret:cronSecret,internalConfigurationReady:Boolean(url&&serviceKey)});
  if (authorization) return response({error:authorization.error},authorization.status);
  const admin=createClient(url,serviceKey,{auth:{persistSession:false}});
  const {data,error}=await admin.rpc("pending_weather_forecast_requests",{reference_time:new Date().toISOString()});
  if (error) return response({error:"forecast_cells_unavailable"},500);
  const cells=(data??[]) as Cell[]; const baseUrl=Deno.env.get("OPEN_METEO_BASE_URL")??""; const apiKey=Deno.env.get("OPEN_METEO_API_KEY")??"";
  const isLocal=/localhost|127\.0\.0\.1/.test(url); const allowPublicEndpoint=Deno.env.get("OPEN_METEO_ALLOW_PUBLIC_ENDPOINT")==="true";
  const providerEnabled=Boolean(baseUrl) && (isLocal || allowPublicEndpoint || Boolean(apiKey));
  let applied=0,failed=0,circuitOpen=false; const failureReasons:Partial<Record<WeatherProviderFailureCode,number>>={};
  for (const cell of cells) {
    if (cell.cached_weather_code!==null && cell.cached_is_day!==null && cell.cached_wind_speed_kmh!==null && cell.cached_wind_gust_kmh!==null && cell.cached_temperature_c!==null) {
      const {error:cacheError}=await admin.rpc("apply_weather_forecast",{cell_latitude:cell.cell_latitude,cell_longitude:cell.cell_longitude,block_start:cell.block_start,weather_code:cell.cached_weather_code,is_day:cell.cached_is_day,wind_speed_kmh:cell.cached_wind_speed_kmh,wind_gust_kmh:cell.cached_wind_gust_kmh,temperature_c:cell.cached_temperature_c,source:cell.cached_source??"openMeteo"});
      if (cacheError) failed++; else applied++; continue;
    }
    if (!providerEnabled) continue;
    if (failed>=3) { circuitOpen=true; break; }
    try {
      let providerUrl:string; try { providerUrl=openMeteoUrl(baseUrl,cell.cell_latitude,cell.cell_longitude,apiKey||undefined); } catch { throw new Error("invalid_base_url"); }
      const payload=await fetchWeather(providerUrl);
      const normalized=normalizeOpenMeteo(payload,cell.block_start); if (!normalized) throw new Error("invalid_provider_payload");
      const {error:applyError}=await admin.rpc("apply_weather_forecast",{cell_latitude:cell.cell_latitude,cell_longitude:cell.cell_longitude,block_start:cell.block_start,weather_code:normalized.weatherCode,is_day:normalized.isDay,wind_speed_kmh:normalized.windSpeedKmh,wind_gust_kmh:normalized.windGustKmh,temperature_c:normalized.temperatureC,source:"openMeteo"});
      if (applyError) throw new Error("forecast_apply_failed"); applied++;
    } catch(error) { const code=weatherProviderFailureCode(error); failureReasons[code]=(failureReasons[code]??0)+1; console.warn("weather_provider_failure",{code}); failed++; }
  }
  const {data:resolved,error:resolveError}=await admin.rpc("resolve_travel_progress",{reference_time:new Date().toISOString()});
  if (resolveError) return response({error:"segment_resolution_failed",applied,failed},500);
  return response({cells:cells.length,applied,failed,resolved,circuitOpen,fallback:!providerEnabled||failed>0,...(failed>0?{failureReasons}:{})});
});

async function fetchWeather(url:string) {
  let lastError:unknown;
  for (let attempt=0;attempt<2;attempt++) { const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),4500); try { const result=await fetch(url,{signal:controller.signal,headers:{Accept:"application/json"}}); if (!result.ok) throw new Error("provider_http_error"); return await result.json(); } catch(error){lastError=error instanceof DOMException&&error.name==="AbortError"?new Error("provider_timeout"):error;} finally {clearTimeout(timeout);} }
  throw lastError??new Error("provider_unavailable");
}
function response(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:jsonHeaders});}
