import { describe, expect, it } from "vitest";
import type { Skill } from "../../game";
import { getVisibleMascotSkills } from "./MascotSkillsPanel";

const skill = (id: string, category: Skill["category"], isSelected?: boolean): Skill => ({
  id,
  category,
  isSelected,
  level: 1,
  nameKey: "skills.solarWing.name",
  descriptionKey: "skills.solarWing.description",
});

describe("getVisibleMascotSkills", () => {
  it("shows fixed skills and only the selected individual skill", () => {
    expect(getVisibleMascotSkills([
      skill("fixed", "fixed", true),
      skill("solar", "individual", true),
      skill("aerodynamic", "individual", false),
    ]).map(({ id }) => id)).toEqual(["fixed", "solar"]);
  });
});
