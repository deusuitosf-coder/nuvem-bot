import type { Board } from "./quadro.ts";

export const BOARD_STORAGE_KEY = "nuven-bot:quadro:v1";
const colors = new Set(["navy", "sky", "mist", "ok", "warn"]);
const record = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const position = (x: unknown) => typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= 100000;

/** Validate stored/imported data without executing it or silently dropping elements. */
export function parseBoard(raw: string): Board {
  if (raw.length > 2_000_000) throw new Error("Quadro excede o limite de 2 MB.");
  const data: unknown = JSON.parse(raw);
  if (!record(data) || !Array.isArray(data.notes) || !Array.isArray(data.boxes) || !Array.isArray(data.arrows)) throw new Error("Formato de quadro inválido.");
  if (data.notes.length + data.boxes.length + data.arrows.length > 2000) throw new Error("Quadro excede o limite de elementos.");
  const ids = new Set<string>();
  const id = (v: unknown) => {
    if (typeof v !== "string" || !v || v.length > 100 || ids.has(v)) throw new Error("Identificador inválido ou repetido.");
    ids.add(v);
    return v;
  };
  const notes: Board["notes"] = data.notes.map((n: unknown) => {
    if (!record(n) || n.kind !== "nota" || typeof n.texto !== "string" || n.texto.length > 140 || !colors.has(String(n.cor)) || !position(n.x) || !position(n.y)) throw new Error("Nota inválida.");
    return { id: id(n.id), kind: "nota", texto: n.texto, cor: n.cor as Board["notes"][number]["cor"], x: n.x as number, y: n.y as number };
  });
  const boxes: Board["boxes"] = data.boxes.map((b: unknown) => {
    if (!record(b) || b.kind !== "caixa" || typeof b.titulo !== "string" || b.titulo.length > 80 || !position(b.x) || !position(b.y)) throw new Error("Caixa inválida.");
    return { id: id(b.id), kind: "caixa", titulo: b.titulo, x: b.x as number, y: b.y as number };
  });
  const items = new Set(ids);
  const arrows: Board["arrows"] = data.arrows.map((a: unknown) => {
    if (!record(a) || a.kind !== "seta" || typeof a.de !== "string" || typeof a.para !== "string" || a.de === a.para || !items.has(a.de) || !items.has(a.para)) throw new Error("Conexão inválida.");
    return { id: id(a.id), kind: "seta", de: a.de, para: a.para };
  });
  return { notes, boxes, arrows };
}

export function serializeBoard(board: Board): string {
  return JSON.stringify(parseBoard(JSON.stringify(board)), null, 2);
}
