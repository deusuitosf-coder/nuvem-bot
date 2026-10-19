import assert from "node:assert/strict";
import test from "node:test";
import { quoteDraft, quoteText, type QuoteInput } from "./quote.ts";
const base: QuoteInput = { company: "Minha empresa", service: "simples", units: 1, documents: 0, pages: 0, complexity: "padrao", deadline: "", description: "Organizar o escopo" };
test("simple services use the approved unit price", () => {
  assert.equal(quoteDraft({ ...base, units: 3 }).minimum, 300);
  assert.equal(quoteDraft(base).customized, false);
});
test("document and complex projects are explicitly starting estimates", () => {
  const q = quoteDraft({ ...base, service: "documentos", documents: 3, pages: 15 });
  assert.equal(q.minimum, 800);
  assert.equal(q.customized, true);
  assert.match(quoteText(q), /valor final depende/);
  assert.match(quoteText(q), /Não é contratação/);
  assert.equal(quoteDraft({ ...base, complexity: "complexo" }).minimum, 800);
});
test("invalid inputs cannot generate a misleading estimate", () => {
  for (const units of [0, -1, 1.5, NaN, Infinity, 101]) assert.throws(() => quoteDraft({ ...base, units }));
  assert.throws(() => quoteDraft({ ...base, description: " " }));
  assert.throws(() => quoteDraft({ ...base, service: "documentos", documents: 2, pages: 1 }));
});
