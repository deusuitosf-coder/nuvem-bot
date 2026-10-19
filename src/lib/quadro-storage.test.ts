import assert from "node:assert/strict";
import test from "node:test";
import { applyTool, emptyBoard } from "./quadro.ts";
import { parseBoard, serializeBoard } from "./quadro-storage.ts";

test("backup preserves notes, boxes and connections", () => {
  let board = applyTool(emptyBoard(), { name: "criar_diagrama", args: { titulo: "Plano" } }).board;
  board = applyTool(board, { name: "editar_nota", args: { id: "nota 1", texto: "Meu projeto" } }).board;
  assert.deepEqual(parseBoard(serializeBoard(board)), board);
});
test("invalid data is rejected instead of dropping existing content", () => {
  assert.throws(() => parseBoard("{"));
  assert.throws(() => parseBoard('{"notes":[],"boxes":[],"arrows":[{"kind":"seta","id":"s1","de":"missing","para":"missing2"}]}'));
  const board = applyTool(emptyBoard(), { name: "criar_nota", args: { texto: "Teste" } }).board;
  board.notes.push({ ...board.notes[0] });
  assert.throws(() => serializeBoard(board), /repetido/);
});
test("non-finite and negative positions cannot enter a backup", () => {
  const board = applyTool(emptyBoard(), { name: "criar_nota", args: { texto: "Teste", x: -1 } }).board;
  assert.throws(() => serializeBoard(board));
  board.notes[0].x = Infinity;
  assert.throws(() => serializeBoard(board));
});
