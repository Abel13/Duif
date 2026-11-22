import { getSupabaseClient } from "./client";
export type GlobalGift={id:string;seedQuantity:number};
export async function listPendingGlobalGifts(){const c=getSupabaseClient();if(!c)return [];const {data,error}=await c.rpc("list_pending_global_gifts");if(error)throw error;return (data??[]).map((x)=>({id:x.id,seedQuantity:x.seed_quantity}));}
export async function claimGlobalGift(id:string){const c=getSupabaseClient();if(!c)throw new Error("Supabase unavailable");const {error}=await c.rpc("claim_global_gift",{gift_id:id});if(error)throw error;}
