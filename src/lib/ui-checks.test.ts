import assert from "node:assert/strict";
import test from "node:test";
import { messageAllowed, plainText, savedReports, screenMessage, SAFE_FALLBACK } from "./guardrails.ts";
import { isPublicMessage, logicChecks, SAFE_EMAIL_ERROR, validateEmail } from "./ui-checks.ts";

test("rejeita preenchimento vazio e inválido com a mesma frase segura", () => {
  const empty = validateEmail("");
  const junk = validateEmail("nao-e-email");
  assert.equal(empty.ok, false);
  assert.equal(junk.ok, false);
  if (!empty.ok && !junk.ok) {
    assert.equal(empty.message, SAFE_EMAIL_ERROR);
    assert.equal(junk.message, SAFE_EMAIL_ERROR);
  }
});

test("aceita e-mail com espaços nas pontas", () => {
  assert.deepEqual(validateEmail("  marina@empresa.com  "), { ok: true });
});

test("nenhuma mensagem pública cita stack, sql ou token", () => {
  assert.equal(isPublicMessage(SAFE_EMAIL_ERROR), true);
  assert.equal(isPublicMessage("TypeError: secret token"), false);
  assert.equal(isPublicMessage(""), false);
  assert.equal(isPublicMessage("please hack this"), false);
});

test("bloqueia pedido de apagar dado e devolve frase segura", () => {
  assert.equal(messageAllowed("drop table users"), false);
  assert.equal(screenMessage("sudo rm -rf /"), SAFE_FALLBACK);
  assert.equal(screenMessage("Conta iniciada."), "Conta iniciada.");
});

test("texto da pessoa não vira HTML nem comando", () => {
  assert.equal(plainText("preço <b>15</b>", 20), "preço b15/b");
  assert.equal(plainText("abc", 2), "ab");
  assert.deepEqual(savedReports([{ at: "hoje", label: "ok" }, { at: 1, label: "não" }]), [{ at: "hoje", label: "ok" }]);
});

test("suíte lógica fecha sem falha", () => {
  const failed = logicChecks().filter((item) => !item.ok);
  assert.deepEqual(failed, []);
});
