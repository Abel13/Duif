import type { NestCoordinate, NestSearchResult } from "../../game/nest";
import { getSupabaseClient } from "./client";
import type { AccountOnboarding } from "./onboarding";
import type { AuthProfile } from "./profile";

export async function searchNestCities(query: string): Promise<NestSearchResult[]> {
  const supabase=getSupabaseClient(); if(!supabase) throw new Error("Supabase is not configured");
  const {data,error}=await supabase.rpc("search_nest_cities",{search_query:query});
  if(error||!Array.isArray(data)) throw error??new Error("Nest search unavailable");
  return data.filter((item:unknown):item is NestSearchResult=>typeof item==="object"&&item!==null&&typeof (item as NestSearchResult).id==="string"&&typeof (item as NestSearchResult).label==="string"&&Number.isFinite((item as NestSearchResult).latitude)&&Number.isFinite((item as NestSearchResult).longitude));
}

export async function completeNestSetup(selection: NestCoordinate, cityId: string): Promise<{ profile: AuthProfile; onboarding: AccountOnboarding }> {
  const supabase=getSupabaseClient(); if(!supabase) throw new Error("Supabase is not configured");
  const {data,error}=await supabase.rpc("complete_nest_setup",{selected_latitude:selection.latitude,selected_longitude:selection.longitude,selected_city_geoname_id:Number(cityId)});
  if(error||!data||typeof data!=="object"||Array.isArray(data)) throw error??new Error("Nest setup could not be completed");
  const result=data as {profile?:AuthProfile;onboarding?:AccountOnboarding};
  if(!result.profile||!result.onboarding) throw new Error("Invalid nest setup response"); return {profile:result.profile,onboarding:result.onboarding};
}

export async function getMyNestCityLabel(): Promise<string | null> {
  const supabase=getSupabaseClient(); if(!supabase) throw new Error("Supabase is not configured");
  const {data,error}=await supabase.rpc("get_my_nest_city");
  if(error) throw error;
  return Array.isArray(data) && typeof data[0]?.label === "string" ? data[0].label : null;
}
