export type NestCoordinate = { latitude: number; longitude: number };
export type NestSearchResult = NestCoordinate & { id: string; label: string };
export type NestSelection = NestCoordinate;

export const nestGridKilometers = 2;
const latitudeKilometersPerDegree = 111.32;

export function quantizeNestCoordinate(selection: NestSelection): NestCoordinate | undefined {
  if (!Number.isFinite(selection.latitude) || !Number.isFinite(selection.longitude)
    || selection.latitude < -90 || selection.latitude > 90 || selection.longitude < -180 || selection.longitude > 180) return undefined;
  const latStep = nestGridKilometers / latitudeKilometersPerDegree;
  const longitudeStep = nestGridKilometers / (latitudeKilometersPerDegree * Math.max(Math.cos(selection.latitude * Math.PI / 180), .05));
  return {
    latitude: Math.round(selection.latitude / latStep) * latStep,
    longitude: Math.round(selection.longitude / longitudeStep) * longitudeStep,
  };
}
