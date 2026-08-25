export type ReturnReplyRoute = {
  destinationLabel: string;
  originLabel: string;
};

/**
 * The return-reply context already represents the reverse leg of the trip.
 * Keep that direction intact when presenting the envelope to its author.
 */
export function getReturnReplyRoute(originLabel: string, destinationLabel: string): ReturnReplyRoute {
  return { originLabel, destinationLabel };
}
