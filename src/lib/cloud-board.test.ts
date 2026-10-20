import assert from "node:assert/strict";
import test from "node:test";
import { cloudBoard, cloudChanges, cloudIdentifiers } from "./cloud-board.ts";
import { applyTool, emptyBoard } from "./quadro.ts";
test("cloud conversion remaps imported identifiers and keeps connections", () => {
  let board = applyTool(emptyBoard(), { name: "criar_nota", args: { texto: "Primeira" } }).board;
  board = applyTool(board, { name: "criar_nota", args: { texto: "Segunda" } }).board;
  board = applyTool(board, { name: "criar_seta", args: { de: board.notes[0].id, para: board.notes[1].id } }).board;
  const original = JSON.stringify(board);
  let counter = 0;
  const converted = cloudIdentifiers(board, () => "00000000-0000-4000-8000-" + String(++counter).padStart(12, "0"));
  assert.equal(JSON.stringify(board), original);
  assert.equal(converted.arrows[0].de, converted.notes[0].id);
  assert.equal(converted.arrows[0].para, converted.notes[1].id);
  assert.equal(cloudChanges(converted, converted).length, 0);
  const changed = structuredClone(converted); changed.notes[0].texto = "Uma mudança";
  assert.equal(cloudChanges(converted, changed).length, 1);
  assert.deepEqual(cloudBoard([...converted.notes, ...converted.arrows].map(data => ({ id: data.id, board_id: "project", data, updated_at: "" }))), converted);
});
