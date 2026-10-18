import assert from "node:assert/strict";
import test from "node:test";
import { applyTool, emptyBoard, plan, runTurn } from "./quadro.ts";

test("três notas sobre o cliente entram no quadro", () => {
  const turn = runTurn("Crie 3 notas sobre problemas do cliente.", emptyBoard());
  assert.deepEqual(turn.tools, ["criar_nota", "criar_nota", "criar_nota"]);
  assert.equal(turn.board.notes.length, 3);
  assert.match(turn.said, /nota/i);
});

test("faturamento fictício não vira previsão de caixa", () => {
  const turn = runTurn("Analise faturamento de R$ 10.000 com 100 clientes e aumento de 15%.", emptyBoard());
  assert.deepEqual(turn.tools, ["calcular_faturamento"]);
  assert.match(turn.said, /11\.500/);
  assert.match(turn.said, /Espere/);
  assert.match(turn.said, /não prevê o caixa/i);
});

test("cada ferramenta altera o quadro ou responde", () => {
  let board = emptyBoard();
  board = applyTool(board, { name: "criar_nota", args: { texto: "Uma nota" } }).board;
  board = applyTool(board, { name: "editar_nota", args: { id: "nota 1", texto: "Nota nova" } }).board;
  assert.equal(board.notes[0]?.texto, "Nota nova");
  board = applyTool(board, { name: "mover_nota", args: { id: "nota 1", x: 10, y: 20 } }).board;
  assert.equal(board.notes[0]?.x, 10);
  board = applyTool(board, { name: "criar_caixa", args: { titulo: "Decisão" } }).board;
  board = applyTool(board, { name: "criar_seta", args: { de: "nota 1", para: "caixa 1" } }).board;
  assert.equal(board.arrows.length, 1);
  const organized = applyTool(board, { name: "organizar_ideias", args: {} });
  assert.match(organized.said, /Organizei/);
  const summary = applyTool(organized.board, { name: "resumir_quadro", args: {} });
  assert.match(summary.said, /Nota nova/);
  const diagram = applyTool(emptyBoard(), { name: "criar_diagrama", args: { titulo: "Preço" } });
  assert.equal(diagram.board.notes.length, 3);
  assert.equal(diagram.board.arrows.length, 3);
});

test("pedido fora da lista não chama ferramenta", () => {
  const turn = runTurn("qual é o seu nome", emptyBoard());
  assert.deepEqual(turn.tools, []);
  assert.equal(plan("organizar ideias").length, 1);
});
