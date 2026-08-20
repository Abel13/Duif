export type PostmarkModelId = "classic" | "route" | "wing";
export type PostmarkColorId = "brown" | "blue" | "red" | "green" | "gold" | "plum" | "charcoal" | "teal";

export type PostmarkCustomization = {
  model: PostmarkModelId;
  color: PostmarkColorId;
};

export const postmarkModels = [
  { id: "classic", level: 1 },
  { id: "route", level: 5 },
  { id: "wing", level: 10 },
] as const;

export const postmarkColors = [
  { id: "brown", level: 1, value: "#8b5e3c" },
  { id: "blue", level: 3, value: "#577e98" },
  { id: "red", level: 5, value: "#a44a3f" },
  { id: "green", level: 7, value: "#647b55" },
  { id: "gold", level: 10, value: "#a67c2f" },
  { id: "plum", level: 13, value: "#76516f" },
  { id: "charcoal", level: 16, value: "#3f3c37" },
  { id: "teal", level: 20, value: "#397b78" },
] as const;

export const defaultPostmarkCustomization: PostmarkCustomization = { model: "classic", color: "brown" };

export function isPostmarkCustomizationUnlocked(customization: PostmarkCustomization, level: number) {
  const model = postmarkModels.find((option) => option.id === customization.model);
  const color = postmarkColors.find((option) => option.id === customization.color);
  return Boolean(model && color && model.level <= level && color.level <= level);
}
