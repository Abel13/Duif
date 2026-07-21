import type { TranslationKey } from "../i18n";
import type { Delivery } from "./types";

export type PostalLocationParts = {
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

function nonEmpty(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

/** Formats the public city-level location used by friends and delivery snapshots. */
export function formatPostalLocationLabel({ city, state, country }: PostalLocationParts) {
  const locality = [nonEmpty(city), nonEmpty(state)].filter(Boolean).join(", ");
  const countryLabel = nonEmpty(country);

  return [locality, countryLabel].filter(Boolean).join(" • ");
}

export function resolveDeliveryPlaceLabel(
  delivery: Delivery,
  place: "origin" | "destination",
  translate: (key: TranslationKey) => string,
) {
  const snapshot = place === "origin"
    ? delivery.originPlaceLabel
    : delivery.destinationPlaceLabel;

  return nonEmpty(snapshot) ?? translate(delivery[place].labelKey);
}
