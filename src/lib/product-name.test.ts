import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { generateProductName } from "./product-name.ts";

test("the name comes from the phrase", () => {
  assert.equal(generateProductName("a decisão vira"), "Virada");
});

test("the name is one stable word", () => {
  const name = generateProductName();
  assert.equal(name, "Virada");
  assert.equal(generateProductName(), name);
  assert.equal(name.split(" ").length, 1);
});

test("the page title uses the generated name", () => {
  const site = JSON.parse(readFileSync(new URL("./og/site.json", import.meta.url), "utf8")) as { title: string };
  assert.equal(site.title, generateProductName());
});
