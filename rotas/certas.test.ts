import assert from "node:assert/strict";
import test from "node:test";
import { rotaCerta, rotasCertas } from "./certas.ts";

test("só as rotas certas passam", () => {
  for (const rota of rotasCertas) assert.equal(rotaCerta(rota), true);
  assert.equal(rotaCerta("/nuvem?x=1"), true);
  assert.equal(rotaCerta("/admin"), false);
  assert.equal(rotaCerta("/.env"), false);
});
