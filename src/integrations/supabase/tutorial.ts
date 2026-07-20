import type { Delivery, InventoryItem } from "../../game";
import { mapDeliveryRowToDelivery, type DeliveryRow } from "./authenticatedMascots";
import { getSupabaseClient } from "./client";
import type { Database, Json } from "./database.types";
import { mapInventoryItemRow, type InventoryItemRow } from "./inventoryMappers";

export type TutorialInstructionStep = Database["public"]["Enums"]["tutorial_instruction_step"];
export type TutorialOnboarding = Database["public"]["Tables"]["account_onboarding"]["Row"];
export type TutorialDeliveryState = { delivery: Delivery; mascotId: string; onboarding: TutorialOnboarding };
export type TutorialCollectionResult = {
  onboarding: TutorialOnboarding;
  delivery: Delivery;
  primaryInventoryItem: InventoryItem;
  routeInventoryItem: InventoryItem;
};

const steps: readonly TutorialInstructionStep[] = ["preparing","outbound","discovery","destination","returning","returned","collection"];

function object(value: Json | unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

export function getNextTutorialInstruction(current: TutorialInstructionStep | null) {
  if (!current) return steps[0];
  return steps[steps.indexOf(current) + 1];
}

export function getTutorialInstructionAvailableAt(step: TutorialInstructionStep, delivery: Delivery) {
  const outboundStart = Date.parse(delivery.outboundStartAt);
  const outboundArrival = Date.parse(delivery.outboundArrivalAt);
  const returnStart = Date.parse(delivery.returnStartAt ?? "");
  const returnArrival = Date.parse(delivery.returnArrivalAt ?? "");
  const value = step === "preparing" ? Number.NEGATIVE_INFINITY
    : step === "outbound" ? outboundStart
    : step === "discovery" ? outboundStart + (outboundArrival - outboundStart) / 2
    : step === "destination" ? outboundArrival
    : step === "returning" ? returnStart
    : returnArrival;
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

export function isTutorialInstructionAvailable(step: TutorialInstructionStep, delivery: Delivery, now = new Date()) {
  return now.getTime() >= getTutorialInstructionAvailableAt(step, delivery);
}

function mapState(data: Json): TutorialDeliveryState {
  const payload = object(data); const delivery = object(payload?.delivery); const mascot = object(payload?.mascot); const onboarding=object(payload?.onboarding);
  if (!delivery || !onboarding || typeof mascot?.id !== "string") throw new Error("Invalid tutorial delivery response");
  return { delivery: mapDeliveryRowToDelivery(delivery as unknown as DeliveryRow, mascot.id), mascotId: mascot.id, onboarding:onboarding as unknown as TutorialOnboarding };
}

export async function startOrResumeTutorialDelivery() {
  const supabase=getSupabaseClient(); if(!supabase) throw new Error("Supabase is not configured");
  const {data,error}=await supabase.rpc("start_or_resume_tutorial_delivery");
  if(error||!data) throw error??new Error("Tutorial could not be started"); return mapState(data);
}

export async function fetchTutorialDelivery(deliveryId:string, mascotId:string) {
  const supabase=getSupabaseClient(); if(!supabase) return undefined;
  const {data,error}=await supabase.from("deliveries").select("*").eq("id",deliveryId).eq("is_tutorial",true).maybeSingle();
  if(error) throw error; return data?mapDeliveryRowToDelivery(data,mascotId):undefined;
}

export async function acknowledgeTutorialInstruction(step:TutorialInstructionStep) {
  const supabase=getSupabaseClient(); if(!supabase) throw new Error("Supabase is not configured");
  const {data,error}=await supabase.rpc("acknowledge_tutorial_instruction",{requested_step:step});
  if(error||!data) throw error??new Error("Tutorial instruction could not be saved"); return data;
}

export async function collectTutorialDelivery():Promise<TutorialCollectionResult> {
  const supabase=getSupabaseClient(); if(!supabase) throw new Error("Supabase is not configured");
  const {data,error}=await supabase.rpc("collect_tutorial_delivery"); const payload=object(data);
  const delivery=object(payload?.delivery); const primary=object(payload?.primaryInventoryItem); const route=object(payload?.routeInventoryItem); const onboarding=object(payload?.onboarding);
  if(error||!delivery||!primary||!route||!onboarding) throw error??new Error("Tutorial cargo could not be collected");
  return {onboarding:onboarding as unknown as TutorialOnboarding,delivery:mapDeliveryRowToDelivery(delivery as unknown as DeliveryRow,delivery.mascot_id as string),primaryInventoryItem:mapInventoryItemRow(primary as unknown as InventoryItemRow),routeInventoryItem:mapInventoryItemRow(route as unknown as InventoryItemRow)};
}
