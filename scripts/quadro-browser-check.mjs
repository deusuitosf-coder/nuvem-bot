import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const key = "nuven-bot:quadro:v1";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("http://127.0.0.1:8081/", { waitUntil: "networkidle" });
    await page.getByRole("status").filter({ hasText: "Salvo neste navegador" }).waitFor();
    await page.locator("#quadro-chat").fill("Crie uma nota: Projeto seguro");
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    const notes = page.getByRole("region", { name: "Quadro de notas" }).locator("article");
    await notes.filter({ hasText: "Projeto seguro" }).waitFor();
    assert.equal(await notes.count(), 1);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("status").filter({ hasText: "Salvo neste navegador" }).waitFor();
    assert.equal(await notes.count(), 1, "note must survive reload");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exportar quadro JSON" }).click(),
    ]);
    const backup = await readFile(await download.path());
    assert.equal(JSON.parse(backup).notes[0].texto, "Projeto seguro");
    await page.locator('input[type="file"]').setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: backup });
    await page.waitForFunction(() => document.querySelectorAll('[aria-label="Quadro de notas"] article').length === 2);
    assert.equal(await notes.count(), 2, "import must append rather than replace");
    await page.locator('input[type="file"]').setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from("{invalid") });
    await page.getByRole("status").filter({ hasText: "Backup inválido" }).waitFor();
    assert.equal(await notes.count(), 2, "bad backup must preserve current notes");
    await page.evaluate((storageKey) => localStorage.setItem(storageKey, "{corrupt"), key);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("status").filter({ hasText: "conteúdo armazenado foi preservado" }).waitFor();
    assert.equal(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key), "{corrupt");
    assert.deepEqual(errors, [], "no uncaught browser errors");
    await context.close();
    console.log(`Board create/reload/export/import/reject/corruption checks passed at ${viewport.width}px`);
  }
} finally {
  await browser.close();
}
