import { parseBoard } from "./quadro-storage.ts";
import { type Board } from "./quadro.ts";

export type CloudItem = { id: string; board_id: string; data: Board["notes"][number] | Board["boxes"][number] | Board["arrows"][number]; updated_at: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function cloudBoard(rows: CloudItem[]): Board {
  return parseBoard(JSON.stringify({
    notes: rows.filter(r => r.data.kind === "nota").map(r => ({ ...r.data, id: r.id })),
    boxes: rows.filter(r => r.data.kind === "caixa").map(r => ({ ...r.data, id: r.id })),
    arrows: rows.filter(r => r.data.kind === "seta").map(r => ({ ...r.data, id: r.id })),
  }));
}
export function cloudIdentifiers(board: Board, generateId: () => string): Board {
  const valid = parseBoard(JSON.stringify(board));
  const ids = new Map([...valid.notes, ...valid.boxes, ...valid.arrows].map(item => [item.id, uuid.test(item.id) ? item.id : generateId()]));
  return parseBoard(JSON.stringify({
    notes: valid.notes.map(n => ({ ...n, id: ids.get(n.id) })),
    boxes: valid.boxes.map(n => ({ ...n, id: ids.get(n.id) })),
    arrows: valid.arrows.map(n => ({ ...n, id: ids.get(n.id), de: ids.get(n.de), para: ids.get(n.para) })),
  }));
}
export function cloudChanges(before: Board, after: Board) {
  const map = new Map([...before.notes, ...before.boxes, ...before.arrows].map(item => [item.id, JSON.stringify(item)]));
  return [...after.notes, ...after.boxes, ...after.arrows].filter(item => map.get(item.id) !== JSON.stringify(item));
}
