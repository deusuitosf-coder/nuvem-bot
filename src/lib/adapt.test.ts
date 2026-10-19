import assert from "node:assert/strict";
import test from "node:test";
import { firstGoal, layoutFor } from "./adapt.ts";

test("a mesma escolha devolve a mesma tela", () => {
  assert.equal(layoutFor("ver"), "abertura");
  assert.equal(layoutFor("ver"), layoutFor("ver"));
  assert.equal(layoutFor("usar"), "trabalho");
  assert.equal(layoutFor("explicar"), "aula");
});

test("quem volta começa em usar", () => {
  assert.equal(firstGoal("primeira"), "ver");
  assert.equal(firstGoal("de novo"), "usar");
});
