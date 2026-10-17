import assert from "node:assert/strict";
import test from "node:test";
import { simulate } from "./sim-engine.ts";

const base = { decision: "Aumentar o preço", change: 15, sensitive: 40, complaint: "", rival: "" };

test("the same input always gives the same result", () => {
  assert.deepEqual(simulate(base), simulate(base));
});

test("one thousand agents and four rounds", () => {
  const result = simulate(base);
  assert.equal(result.agents, 1000);
  assert.equal(result.rounds, 4);
  assert.equal(result.adhesion + result.resistance + result.rejection, 100);
});

test("four rounds leave a feed", () => {
  const result = simulate(base);
  assert.equal(result.feed.length, 4);
  const last = result.feed[3];
  assert.ok(last);
  assert.equal(last.posts.length, 7);
});
  test("four rounds move the undecided", () => {
  const result = simulate(base);
  assert.notEqual(result.adhesion, result.startAdhesion);
});

test("a sector keeps the count and changes the words", () => {
  const same = simulate(base);
  const market = simulate({ ...base, sector: "mercado" });
  assert.equal(market.adhesion, same.adhesion);
  assert.equal(market.lines.some((item) => item.name === "Formador"), true);
  assert.equal(market.lines.some((item) => item.line.startsWith("Vou espalhar:")), true);
});

test("the launch curve follows each round", () => {
  const result = simulate({ ...base, sector: "lancamento" });
  const last = result.feed[3];
  assert.ok(last);
  assert.equal(last.adhesion, result.adhesion);
  assert.equal(result.feed[0]?.posts.some((post) => post.line === "Eu experimento."), true);
});

test("health and a press note use their own sentences", () => {
  const health = simulate({ ...base, sector: "saude" });
  const note = simulate({ ...base, sector: "comunicacao" });
  assert.equal(health.feed[0]?.posts.some((post) => post.line === "Eu sigo a orientação."), true);
  assert.equal(note.lines.some((post) => post.line.includes("dúvida") || post.line.includes("rejeição") || post.line.includes("passa")), true);
});

test("a harder price rise rejects more", () => {
  const calm = simulate({ ...base, change: 0, sensitive: 10 });
  const hard = simulate({ ...base, change: 40, sensitive: 80, complaint: "atraso", rival: "a outra loja" });
  assert.ok(hard.rejection > calm.rejection);
});
