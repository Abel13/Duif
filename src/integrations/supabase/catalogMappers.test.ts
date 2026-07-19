import { describe, expect, it } from "vitest";

import type { MascotTemplateRow } from "./catalogMappers";
import {
  CatalogContractError,
  STARTER_MASCOT_IDS,
  mapMascotTemplateRowToArchetype,
  mapStarterMascotTemplateRows,
  selectStarterMascotTemplateRows,
} from "./catalogMappers";

const baseRow: MascotTemplateRow = {
  appearance: {
    accentColor: "#6f91a8",
    portraitAssetKey: "mascot.portrait.nuvem",
    portraitPlaceholderKey: "appearance.nuvemPortrait",
    primaryColor: "#f7f1e3",
  },
  attributes: { luck: 6, orientation: 9, speed: 7, stamina: 8 },
  base_level: 3,
  base_xp: 180,
  catalog_key: "mascot-nuvem",
  created_at: "2026-07-09T20:00:00.000Z",
  equipment: [{
    descriptionKey: "equipment.canvasPostalBag.description",
    equipped: true,
    iconAssetKey: "equipment.icon.canvasPostalBag",
    id: "equipment-nuvem-canvas-bag",
    nameKey: "equipment.canvasPostalBag.name",
    rarity: "common",
    type: "bag",
  }],
  id: "00000000-0000-4000-8000-000000000201",
  next_level_xp: 260,
  skills: [{
    descriptionKey: "skills.longRoute.description",
    id: "skill-nuvem-long-route",
    level: 2,
    nameKey: "skills.longRoute.name",
  }],
  species_key: "species.carrierPigeon",
  status: "active",
  suggested_name_key: "archetypes.suggestedNames.nuvem",
  trait: {
    descriptionKey: "traits.steadyRoute.description",
    effect: "deliveryReward",
    id: "trait-steady-route",
    nameKey: "traits.steadyRoute.name",
  },
};

describe("Supabase catalog mappers", () => {
  it("maps an active template to an archetype without assigning a player name", () => {
    const archetype = mapMascotTemplateRowToArchetype(baseRow);

    expect(archetype).toMatchObject({
      id: baseRow.id,
      catalogKey: "mascot-nuvem",
      speciesKey: "species.carrierPigeon",
      suggestedNameKey: "archetypes.suggestedNames.nuvem",
      baseLevel: 3,
      baseXp: 180,
    });
    expect(archetype).not.toHaveProperty("name");
  });

  it("rejects invalid active catalog JSON instead of borrowing another archetype", () => {
    expect(() => mapMascotTemplateRowToArchetype({ ...baseRow, trait: null }))
      .toThrow(CatalogContractError);
  });

  it("filters archived rows and sorts the three starter archetypes", () => {
    const rows: MascotTemplateRow[] = [
      { ...baseRow, catalog_key: "friend-mascot-aurora" },
      { ...baseRow, catalog_key: "mascot-pipoca" },
      { ...baseRow, catalog_key: "mascot-nuvem" },
      { ...baseRow, catalog_key: "mascot-trovao" },
      { ...baseRow, catalog_key: "mascot-pipoca", status: "archived" },
    ];

    expect(selectStarterMascotTemplateRows(rows).map((row) => row.catalog_key)).toEqual([
      ...STARTER_MASCOT_IDS,
    ]);
  });

  it("does not fill missing catalog rows from runtime mocks", () => {
    const archetypes = mapStarterMascotTemplateRows([baseRow]);
    expect(archetypes).toHaveLength(1);
    expect(archetypes[0]?.catalogKey).toBe("mascot-nuvem");
  });
});
