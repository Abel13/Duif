import type { ReceivedLetter } from "../../game";
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
