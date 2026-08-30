import { describe, expect, it } from "vitest";
import { fallbackMissionCopy, parseMissionOutput } from "./exclusive-missions";

const candidates = [{ id: "1", name: "Santos", countryCode: "BR", distanceKm: 72 }];

describe("exclusive mission generation contract", () => {
  it("accepts only a candidate and fully localized bounded copy", () => {
    expect(parseMissionOutput({ candidateId: "1", "pt-BR": { title: "Bilhete", story: "Uma tarefa postal." }, "en-US": { title: "Note", story: "A postal task." } }, candidates))
      .toMatchObject({ candidate: candidates[0] });
    expect(parseMissionOutput({ candidateId: "2", "pt-BR": { title: "Bilhete", story: "Uma tarefa." }, "en-US": { title: "Note", story: "A task." } }, candidates)).toBeNull();
  });

  it("creates a localized fallback without destination claims", () => {
    expect(fallbackMissionCopy("Nuvem", candidates[0])).toEqual({
      "pt-BR": { title: "Um recado para Santos", story: "Nuvem recebeu uma pequena tarefa do correio de campo. Leve a encomenda até Santos e registre o caminho de volta ao ninho." },
      "en-US": { title: "A note for Santos", story: "Nuvem has received a small field-post task. Carry the parcel to Santos and make a note of the way back to the nest." },
    });
  });
});
