export type Visit = "primeira" | "de novo";
export type Goal = "ver" | "usar" | "explicar";
export type Layout = "abertura" | "trabalho" | "aula";

export function layoutFor(goal: Goal): Layout {
  if (goal === "usar") return "trabalho";
  if (goal === "explicar") return "aula";
  return "abertura";
}

export function firstGoal(visit: Visit): Goal {
  return visit === "de novo" ? "usar" : "ver";
}
