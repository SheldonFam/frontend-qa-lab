const REGEXP_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

export function createNameMatcher(name: string): RegExp {
  const normalizedName = name.replace(/\s+/g, " ").trim();
  const escapedName = normalizedName.replace(REGEXP_SPECIAL_CHARACTERS, "\\$&");

  return new RegExp(`^${escapedName}$`, "i");
}
