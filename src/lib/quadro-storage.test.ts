import assert from "node:assert/strict";
import test from "node:test";
import { applyTool, emptyBoard } from "./quadro.ts";
import { mergeBoards, parseBoard, serializeBoard } from "./quadro-storage.ts";

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

test("import appends a backup and remaps connections without changing originals", () => {
  const original = applyTool(emptyBoard(), { name: "criar_diagrama", args: { titulo: "Original" } }).board;
  const before = serializeBoard(original);
  const merged = mergeBoards(original, original);
  assert.equal(serializeBoard(original), before);
  assert.deepEqual(merged.notes.slice(0, 3), original.notes);
  assert.equal(merged.notes.length, 6);
  assert.equal(merged.boxes.length, 2);
  assert.equal(merged.arrows.length, 6);
  assert.notEqual(merged.arrows[3].de, original.arrows[0].de);
  assert.equal(merged.arrows[3].para, merged.boxes[1].id);
});

test("new notes cannot reuse an imported identifier with gaps", () => {
  let board = applyTool(emptyBoard(), { name: "criar_nota", args: { texto: "Original" } }).board;
  board.notes.push({ ...board.notes[0], id: "nota3", texto: "Importada" });
  board = applyTool(board, { name: "criar_nota", args: { texto: "Nova" } }).board;
  assert.equal(new Set(board.notes.map((n) => n.id)).size, 3);
  assert.deepEqual(parseBoard(serializeBoard(board)), board);
});
