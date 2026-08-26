import type { PostalJobOffer } from "../../integrations/supabase/postalJobs";

export type OfferLoadState =
  | { status: "loading" }
  | { status: "ready"; offer: PostalJobOffer }
  | { status: "error" };

export type PostalJobOfferStates = Record<string, OfferLoadState>;

export function initialPostalJobOfferStates(mascotIds: string[]): PostalJobOfferStates {
  return Object.fromEntries(mascotIds.map((mascotId) => [mascotId, { status: "loading" }]));
}

export function markPostalJobOfferLoading(current: PostalJobOfferStates, mascotId: string): PostalJobOfferStates {
  return { ...current, [mascotId]: { status: "loading" } };
}

export function markPostalJobOfferReady(current: PostalJobOfferStates, mascotId: string, offer: PostalJobOffer): PostalJobOfferStates {
  return { ...current, [mascotId]: { status: "ready", offer } };
}

export function markPostalJobOfferFailed(current: PostalJobOfferStates, mascotId: string): PostalJobOfferStates {
  return { ...current, [mascotId]: { status: "error" } };
}
