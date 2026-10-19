import assert from "node:assert/strict";
import test from "node:test";
import { chavesAntigas, limparConversas } from "./limpar.ts";

test("apaga as conversas antigas e não mexe na visita do Camaleão", () => {
  const removed: string[] = [];
  limparConversas({ removeItem: (key) => removed.push(key) });
  assert.deepEqual(removed, [...chavesAntigas]);
  assert.equal(removed.includes("iface-visits"), false);
});
