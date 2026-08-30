import { describe, expect, it } from "vitest";
import { fallbackMissionCopy, getMissionQuestContext, parseMissionOutput } from "./exclusive-missions";

const candidates = [{ id: "1", name: "Santos", countryCode: "BR", distanceKm: 72 }];
const context = getMissionQuestContext("job-farol-lente", "job-contact-farol", "postalJobs.cargo.lens");

describe("exclusive mission generation contract", () => {
  it("accepts only a candidate and fully localized quest grounded in its cargo", () => {
    expect(parseMissionOutput({ candidateId: "1", "pt-BR": { title: "Lente", briefing: "Aline precisa de uma lente polida depois que o sinal falhou no posto.", outboundObjective: "Entregue a lente polida ao responsável em Santos.", returnRecord: "A lente foi encaixada e a contramarca deve voltar ao ninho." }, "en-US": { title: "Lens", briefing: "Aline needs a polished lens after the signal failed at the post.", outboundObjective: "Deliver the polished lens to the steward in Santos.", returnRecord: "The lens was fitted and the countermark must return to the nest." } }, candidates, context))
      .toMatchObject({ candidate: candidates[0] });
    expect(parseMissionOutput({ candidateId: "2", "pt-BR": { title: "Bilhete", briefing: "Aline precisa de uma lente polida que ficou separada do posto postal.", outboundObjective: "Entregue a lente polida ao responsável pela estação em Santos.", returnRecord: "A lente foi registrada e a contramarca deve voltar ao ninho." }, "en-US": { title: "Note", briefing: "Aline needs a polished lens that was set aside at the postal post.", outboundObjective: "Deliver the polished lens to the station steward in Santos.", returnRecord: "The lens was registered and the countermark must return to the nest." } }, candidates, context)).toBeNull();
  });

  it("rejects a route narrative and creates a structured fallback without city claims", () => {
    expect(parseMissionOutput({ candidateId: "1", "pt-BR": { title: "Carta serena", briefing: "Josefino segue por paisagens tranquilas e confere os envelopes durante o caminho.", outboundObjective: "Continue o voo sereno até Santos com a encomenda.", returnRecord: "O caminho de volta foi registrado com calma no ninho." }, "en-US": { title: "Serene letter", briefing: "Josefino follows peaceful landscapes and checks the envelopes along the way.", outboundObjective: "Continue the calm flight to Santos with the parcel.", returnRecord: "The way back was calmly recorded at the nest." } }, candidates, context)).toBeNull();
    const fallback = fallbackMissionCopy(context, candidates[0]);
    expect(fallback["pt-BR"]).toMatchObject({ title: "A lente antes do turno" });
    expect(fallback["pt-BR"].briefing).toContain("lente polida");
    expect(fallback["pt-BR"].outboundObjective).toContain("Santos");
    expect(fallback["en-US"].returnRecord).toContain("mechanism");
  });
});
