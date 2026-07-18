import { describe, expect, it } from "vitest";

import { starterMascots } from "../../game/mockData";
import type { MascotTemplateRow } from "./catalogMappers";
import {
  STARTER_MASCOT_IDS,
  mapMascotTemplateRowToMascot,
  mapStarterMascotTemplateRows,
  selectStarterMascotTemplateRows,
} from "./catalogMappers";

const baseRow: MascotTemplateRow = {
  appearance: {
    accentColor: "#6f91a8",
    portraitAssetPath: "/assets/mascots/portraits/nuvem.webp",
    portraitPlaceholderKey: "appearance.nuvemPortrait",
    primaryColor: "#f7f1e3",
  },
  attributes: {
    luck: 6,
    orientation: 9,
    speed: 7,
    stamina: 8,
  },
  base_level: 3,
  base_xp: 180,
  created_at: "2026-07-09T20:00:00.000Z",
  equipment: [
    {
      descriptionKey: "equipment.canvasPostalBag.description",
      equipped: true,
      iconAssetPath: "/assets/equipment/icons/canvas-postal-bag.webp",
      id: "equipment-nuvem-canvas-bag",
      nameKey: "equipment.canvasPostalBag.name",
      rarity: "common",
      type: "bag",
    },
  ],
  id: "00000000-0000-4000-8000-000000000201",
  mock_key: "mascot-nuvem",
  name: "Nuvem",
  next_level_xp: 260,
  skills: [
    {
      descriptionKey: "skills.longRoute.description",
      id: "skill-nuvem-long-route",
      level: 2,
      nameKey: "skills.longRoute.name",
    },
  ],
  species_key: "species.carrierPigeon",
  trait: {
    descriptionKey: "traits.steadyRoute.description",
    effect: "deliveryReward",
    id: "trait-steady-route",
    nameKey: "traits.steadyRoute.name",
  },
};

describe("Supabase catalog mappers", () => {
  it("maps a mascot template row to the current Mascot model", () => {
    const mascot = mapMascotTemplateRowToMascot(baseRow);

    expect(mascot).toMatchObject({
      id: "mascot-nuvem",
      name: "Nuvem",
      level: 3,
      xp: 180,
      nextLevelXp: 260,
      speciesKey: "species.carrierPigeon",
      attributes: {
        speed: 7,
        stamina: 8,
        orientation: 9,
        luck: 6,
      },
    });
    expect(mascot.currentDelivery?.id).toBe("delivery-nuvem-maringa");
    expect(mascot.equipment[0]?.id).toBe("equipment-nuvem-canvas-bag");
  });

  it("falls back to safe mascot data when JSON fields are missing or invalid", () => {
    const fallbackMascot = starterMascots[0];
    const mascot = mapMascotTemplateRowToMascot(
      {
        ...baseRow,
        appearance: null,
        attributes: null,
        equipment: null,
        skills: null,
        trait: null,
      },
      fallbackMascot,
    );

    expect(mascot.attributes).toEqual(fallbackMascot.attributes);
    expect(mascot.appearance).toEqual(fallbackMascot.appearance);
    expect(mascot.trait).toEqual(fallbackMascot.trait);
    expect(mascot.equipment).toEqual(fallbackMascot.equipment);
    expect(mascot.skills).toEqual(fallbackMascot.skills);
  });

  it("filters and sorts only starter mascot template rows", () => {
    const rows = [
      { ...baseRow, mock_key: "friend-mascot-aurora" },
      { ...baseRow, mock_key: "mascot-pipoca", name: "Pipoca" },
      { ...baseRow, mock_key: "mascot-nuvem", name: "Nuvem" },
      { ...baseRow, mock_key: "mascot-trovao", name: "Trovão" },
    ];

    expect(selectStarterMascotTemplateRows(rows).map((row) => row.mock_key)).toEqual([
      ...STARTER_MASCOT_IDS,
    ]);
  });

  it("returns all three starter mascots and fills missing rows from mocks", () => {
    const mascots = mapStarterMascotTemplateRows([baseRow]);

    expect(mascots.map((mascot) => mascot.id)).toEqual([...STARTER_MASCOT_IDS]);
    expect(mascots[1]?.name).toBe("Trovão");
    expect(mascots[2]?.name).toBe("Pipoca");
  });
});
