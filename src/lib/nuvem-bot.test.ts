import assert from "node:assert/strict";
import test from "node:test";
import { agentChecks, bends, boardFrom, boardReport, chiefText, localPages, readSeed, reportText, runSir, seedGraph, swarmGrid } from "./nuvem-bot.ts";

test("the daily agent check passes", () => {
  const checks = agentChecks();
  assert.equal(checks.every((check) => check.ok), true);
});

test("the swarm is a grid of agents", () => {
  const sites = localPages.map((name) => ({ name, ok: true, detail: "resposta 200" }));
  const grid = swarmGrid(agentChecks(), sites);
  assert.equal(grid.length, 12);
  assert.equal(new Set(grid.map((agent) => agent.name)).size, 12);
});

test("a seed becomes one decision", () => {
  assert.deepEqual(readSeed("Vamos aumentar o preço em 15%."), {
    decision: "Aumentar o preço",
    change: 15,
    sensitive: 40,
    complaint: "",
    rival: "",
  });
});

test("the map comes from the text and the agents", () => {
  const graph = seedGraph("Vamos aumentar o preço em 15%.", [
    { name: "Fiel", line: "Eu fico." },
    { name: "Influenciador", line: "Vou espalhar a dúvida." },
  ]);
  assert.equal(graph.nodes.find((node) => node.kind === "decisão")?.label, "Aumentar o preço");
  assert.equal(graph.nodes.find((node) => node.kind === "número")?.label, "15%");
  assert.equal(graph.edges.some((edge) => edge.from === "cenario" && edge.to === "decisao" && edge.label === "vira"), true);
  assert.equal(graph.edges.some((edge) => edge.from === "Influenciador" && edge.to === "Fiel"), true);
});

test("the board report is a calculated range, not one opinion", () => {
  const report = boardReport("Vamos aumentar o preço em 15%.");
  assert.equal(report.answer, "Espere");
  assert.equal(report.adhesion, 15);
  assert.ok(report.low <= report.adhesion && report.adhesion <= report.high);
  assert.equal(report.pode + report.espere + report.nao + report.cuidado, 20);
  assert.ok(report.risks.includes("preço"));
});

test("the calculator can move the same account", () => {
  const base = readSeed("O juro sobe 15%.");
  const moved = boardFrom({ ...base, change: 40, sensitive: 80 });
  assert.equal(moved.change, 40);
  assert.equal(moved.adhesion + moved.resistance + moved.rejection, 100);
  assert.notEqual(moved.answer, "Espere");
});

test("the report names the day and the result", () => {
  const text = reportText(agentChecks(), [{ name: "/", ok: true, detail: "resposta 200" }], new Date("2026-10-08T12:00:00Z"));
  assert.match(text, /nuvem\.bot — relatório/);
  assert.match(text, /Tudo certo/);
  assert.match(text, /1000 agentes/);
});

test("the chief reports the sample and does not pretend to see visitors", () => {
  const note = chiefText(agentChecks(), [], boardReport("O juro sobe 15%"));
  assert.match(note, /Chefe/);
  assert.match(note, /Espere/);
  assert.match(note, /navegador/);
});

test("SIR keeps the population and grows when R0 is above 1", () => {
  const run = runSir();
  const end = run.infectedCurve.at(-1) ?? 0;
  assert.equal(Math.round(run.r0), 3);
  assert.ok(run.peak > 10);
  assert.ok(run.recovered > end);
  assert.ok(run.recovered < 1000);
});

test("a bent path is not a straight line", () => {
  assert.equal(bends([35, 25, 15, 15, 15]), true);
  assert.equal(bends([10, 20, 30]), false);
});
