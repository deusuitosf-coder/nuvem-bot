import assert from "node:assert/strict";
import test from "node:test";
import { sinalRansomware } from "./checagem.ts";

test("arquivo comum não é resgate", () => {
  assert.equal(sinalRansomware("src/routes/index.tsx", "export const page = 1").ok, true);
});

test("nota e extensão de resgate falham", () => {
  const nota = ["README", "RANSOM"].join("-") + ".txt";
  const frase = ["Your files", "have been", "encrypted"].join(" ");
  assert.equal(sinalRansomware(nota).ok, false);
  assert.equal(sinalRansomware("foto.locked").ok, false);
  assert.equal(sinalRansomware("nota.txt", frase).ok, false);
});
