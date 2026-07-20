import { describe, expect, it } from "vitest";
import { createInauguralPostcardContent, formatInauguralPostmark } from "./InauguralPostcard";

describe("InauguralPostcard", () => {
  it("formats the authoritative return date in the active locale", () => {
    expect(formatInauguralPostmark("2026-07-20T12:00:00.000Z", "pt-BR")).toBe("20 de jul. de 2026");
    expect(formatInauguralPostmark("2026-07-20T12:00:00.000Z", "en-US")).toBe("Jul 20, 2026");
  });
  it("does not invent a completion date", () => { expect(formatInauguralPostmark(undefined, "pt-BR")).toBe("—"); });
  it("adapts the tutorial data into reusable postcard content", () => {
    const labels: Record<string, string> = { "tutorial.rewards.inauguralPostcard.name": "Cartão Inaugural", "tutorial.postcard.backMessage": "Parabéns", "tutorial.eyebrow": "Primeira rota", "tutorial.postcard.deliveredBy": "Entregue por", "common.unavailable": "Indisponível", "mascot.origin": "Origem", "tutorial.locations.nest": "Ninho Postal", "mascot.destination": "Destino", "tutorial.locations.station": "Estação", "tutorial.postcard.postmark": "Primeira viagem" };
    const content = createInauguralPostcardContent({ completionAt: "2026-07-20T12:00:00.000Z", mascotName: "Nuvem", senderNickname: "Abel", locale: "pt-BR", t: (key) => labels[key] ?? key });
    expect(content).toMatchObject({ title: "Cartão Inaugural", senderName: "Abel", deliveredBy: "Entregue por Nuvem", originTitle: "Origem", originLabel: "Ninho Postal", destinationTitle: "Destino", destinationLabel: "Estação", postmarkDate: "20 de jul. de 2026" });
  });
});
