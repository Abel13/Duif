import type { ReceivedCorrespondence, ReceivedLetter } from "../../game";
import type { TranslationKey } from "../../i18n";

import { getSupabaseClient } from "./client";

export type ReceivedLetterRow = {
  arrived_at: string;
  delivery_id: string;
  letter_text: string;
  origin_label: string;
  sender_name: string;
  sender_profile_id: string;
  stamp_kind: string;
  stamp_name_key: string | null;
  postmark_key: string;
};

function isReceivedLetterRow(value: unknown): value is ReceivedLetterRow {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return ["arrived_at", "delivery_id", "letter_text", "origin_label", "sender_name", "sender_profile_id", "stamp_kind", "postmark_key"]
    .every((key) => typeof row[key] === "string" && row[key].trim().length > 0);
}

export function mapReceivedLetterRow(row: ReceivedLetterRow): ReceivedLetter {
  return {
    arrivedAt: row.arrived_at,
    deliveryId: row.delivery_id,
    letterText: row.letter_text,
    originLabel: row.origin_label,
    senderName: row.sender_name,
    senderProfileId: row.sender_profile_id,
    stampKind: row.stamp_kind === "inventory" ? "inventory" : "default",
    stampNameKey: row.stamp_name_key ? row.stamp_name_key as TranslationKey : undefined,
    postmarkKey: row.postmark_key,
  };
}

export function parseReceivedLetterRows(rows: unknown[]): ReceivedLetter[] {
  return rows.filter(isReceivedLetterRow).map(mapReceivedLetterRow);
}

export async function fetchReceivedLetters(): Promise<ReceivedLetter[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase unavailable");
  const { data, error } = await supabase.rpc("list_received_letters");
  if (error || !Array.isArray(data)) throw error ?? new Error("Invalid mailbox response");
  return parseReceivedLetterRows(data);
}

export type ReceivedCorrespondenceRow = {
  arrived_at: string;
  correspondence_type: string;
  delivery_id: string;
  direction: string;
  is_opened: boolean;
  letter_text: string | null;
  origin_label: string | null;
  postcard_asset_key: string | null;
  postcard_catalog_key: string | null;
  postcard_message: string | null;
  postcard_name_key: string | null;
  return_reply_confirmed: boolean;
  return_reply_deadline: string | null;
  sender_name: string | null;
  sender_profile_id: string | null;
  stamp_asset_key: string | null;
  sticker_ids: string[];
  sticker_asset_keys: string[];
  postmark_key: string | null;
  postmark_model: string | null;
  postmark_color: string | null;
  postmark_city: string | null;
  postmark_country: string | null;
  postmark_date: string | null;
};

export function mapReceivedCorrespondence(row: ReceivedCorrespondenceRow): ReceivedCorrespondence {
  return {
    arrivedAt: row.arrived_at,
    correspondenceType: row.correspondence_type === "postcard" || row.correspondence_type === "sticker" ? row.correspondence_type : "letter",
    deliveryId: row.delivery_id,
    direction: row.direction === "return" ? "return" : "outbound",
    isOpened: row.is_opened,
    letterText: row.letter_text ?? undefined,
    originLabel: row.origin_label ?? undefined,
    postcardAssetKey: row.postcard_asset_key as ReceivedCorrespondence["postcardAssetKey"],
    postcardCatalogKey: row.postcard_catalog_key ?? undefined,
    postcardMessage: row.postcard_message ?? undefined,
    postcardNameKey: row.postcard_name_key as ReceivedCorrespondence["postcardNameKey"],
    stampAssetKey: row.stamp_asset_key as ReceivedCorrespondence["stampAssetKey"],
    postmarkKey: row.postmark_key ?? undefined,
    postmark: row.postmark_city && row.postmark_country && row.postmark_date ? {
      city: row.postmark_city,
      country: row.postmark_country,
      date: row.postmark_date,
      model: row.postmark_model === "route" || row.postmark_model === "wing" ? row.postmark_model : "classic",
      color: row.postmark_color === "blue" || row.postmark_color === "red" || row.postmark_color === "green" || row.postmark_color === "gold" || row.postmark_color === "plum" || row.postmark_color === "charcoal" || row.postmark_color === "teal" ? row.postmark_color : "brown",
    } : undefined,
    returnReplyConfirmed: row.return_reply_confirmed,
    returnReplyDeadline: row.return_reply_deadline ?? undefined,
    senderName: row.sender_name ?? undefined,
    senderProfileId: row.sender_profile_id ?? undefined,
    stickerIds: row.sticker_ids,
    stickerAssetKeys: row.sticker_asset_keys as ReceivedCorrespondence["stickerAssetKeys"],
  };
}

export async function fetchReceivedCorrespondence(): Promise<ReceivedCorrespondence[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase unavailable");
  const { data, error } = await supabase.rpc("list_received_correspondence");
  if (error || !data) throw error ?? new Error("Invalid mailbox response");
  return (data as ReceivedCorrespondenceRow[]).map(mapReceivedCorrespondence);
}

export async function openReceivedCorrespondence(deliveryId: string, direction: "outbound" | "return") {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase unavailable");
  const { data, error } = await supabase.rpc("open_received_correspondence", { target_delivery_id: deliveryId, target_direction: direction });
  if (error || !data?.[0]) throw error ?? new Error("Correspondence unavailable");
  return mapReceivedCorrespondence(data[0] as ReceivedCorrespondenceRow);
}

export async function confirmReturnReply(deliveryId: string, letterText: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase unavailable");
  const { error } = await supabase.rpc("confirm_delivery_return_reply", { target_delivery_id: deliveryId, letter_text_value: letterText });
  if (error) throw error;
}
