import assert from "node:assert/strict";
import test from "node:test";
import { copy, sayVerdict } from "./nuvem-lang.ts";

test("Brazil stays in Portuguese and the verdict word changes with the language", () => {
  assert.equal(copy.pt.title, "O futuro não se prevê.");
  assert.equal(sayVerdict("pt", "Espere"), "Espere");
  assert.equal(sayVerdict("en", "Espere"), "Wait");
  assert.equal(sayVerdict("es", "Não faça"), "No lo hagas");
});
