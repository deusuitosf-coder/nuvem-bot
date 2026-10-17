const phrase = "a decisão vira";

export function generateProductName(source = phrase) {
  const verb = source.trim().split(/\s+/).at(-1) ?? "";
  const noun = `${verb}da`;
  return noun.charAt(0).toUpperCase() + noun.slice(1);
}
