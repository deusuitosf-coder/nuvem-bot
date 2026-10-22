import assert from "node:assert/strict";
import test from "node:test";
import { readDocument } from "./read-document.ts";

test("document import rejects executable and archive types", async () => {
  for (const name of ["program.exe", "archive.zip", "document.pdf.exe", "script.js"]) {
    await assert.rejects(readDocument(new File(["safe fixture"], name)), /envie PDF/);
  }
});
test("renaming binary signatures to TXT does not bypass validation", async () => {
  for (const bytes of [[0x4d,0x5a,0,0], [0x50,0x4b,3,4], [0x7f,0x45,0x4c,0x46]]) {
    await assert.rejects(readDocument(new File([new Uint8Array(bytes)], "disguised.txt")), /não corresponde/);
  }
});
test("fake PDF fails before loading a parser", async () => {
  await assert.rejects(readDocument(new File(["<script>fixture</script>"], "fake.pdf", { type: "application/pdf" })), /PDF válido/);
});
test("TXT rejects binary nulls and malformed UTF-8", async () => {
  await assert.rejects(readDocument(new File(["hello\u0000world"], "invalid.txt")), /texto legível/);
  await assert.rejects(readDocument(new File([new Uint8Array([0xff,0xfe,0x80])], "invalid.txt")), /UTF-8/);
});
test("document size limits reject empty and oversized input", async () => {
  await assert.rejects(readDocument(new File([], "empty.txt")), /até 5 MB/);
  await assert.rejects(readDocument(new File([new Uint8Array(5000001)], "large.txt")), /até 5 MB/);
});
test("text markup stays literal content, with no evaluation", async () => {
  const text = '<script>fixture</script> Notas da reunião.';
  assert.deepEqual(await readDocument(new File([text], "notes.txt")), { text, pages: 1 });
});
