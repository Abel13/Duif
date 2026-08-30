export type MissionCandidate = { id: string; name: string; countryCode: string; distanceKm: number };
export type MissionCopy = { "pt-BR": { title: string; story: string }; "en-US": { title: string; story: string } };

export function fallbackMissionCopy(mascotName: string, candidate: MissionCandidate): MissionCopy {
  return {
    "pt-BR": {
      title: `Um recado para ${candidate.name}`,
      story: `${mascotName} recebeu uma pequena tarefa do correio de campo. Leve a encomenda até ${candidate.name} e registre o caminho de volta ao ninho.`,
    },
    "en-US": {
      title: `A note for ${candidate.name}`,
      story: `${mascotName} has received a small field-post task. Carry the parcel to ${candidate.name} and make a note of the way back to the nest.`,
    },
  };
}

function nonEmptyString(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

export function parseMissionOutput(value: unknown, candidates: readonly MissionCandidate[]): { candidate: MissionCandidate; copy: MissionCopy } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidateId = (value as { candidateId?: unknown }).candidateId;
  const candidate = typeof candidateId === "string" ? candidates.find((item) => item.id === candidateId) : undefined;
  const copy = value as Partial<MissionCopy>;
  if (!candidate || !copy["pt-BR"] || !copy["en-US"]
    || !nonEmptyString(copy["pt-BR"].title, 90) || !nonEmptyString(copy["pt-BR"].story, 480)
    || !nonEmptyString(copy["en-US"].title, 90) || !nonEmptyString(copy["en-US"].story, 480)) return null;
  return { candidate, copy: {
    "pt-BR": { title: copy["pt-BR"].title.trim(), story: copy["pt-BR"].story.trim() },
    "en-US": { title: copy["en-US"].title.trim(), story: copy["en-US"].story.trim() },
  } };
}
