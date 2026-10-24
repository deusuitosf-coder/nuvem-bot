import assert from "node:assert/strict";
import { chromium } from "playwright";

// Public UI only: no accounts, provider calls, email or payments are submitted.
const origin = "http://127.0.0.1:8081";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, locale: "pt-BR" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    const paths = ["/", "/conta", "/documentos", "/nuvem", "/contato", "/termos", "/privacidade"];
    const links = new Set();
    for (const path of paths) {
      const response = await page.goto(origin + path, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, path);
      assert.ok((await page.locator("body").innerText()).length > 100, path);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${width}px overflow at ${path}`);
      for (const href of await page.locator("a[href]").evaluateAll(es => es.map(e => e.getAttribute("href")))) {
        if (href.startsWith("/")) links.add(href.split("#")[0]);
        if (href.startsWith("#")) assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, `Missing anchor ${path}${href}`);
      }
      for (const href of ["/contato", "/termos", "/privacidade"]) assert.ok(await page.locator(`a[href="${href}"]`).count() > 0, `${path} missing ${href}`);
      if (path === "/") {
        await page.getByRole("link", { name: "Criar conta", exact: true }).click();
        await page.getByRole("button", { name: "Cadastrar e confirmar e-mail", exact: true }).waitFor();
        await page.getByRole("link", { name: "Entrar", exact: true }).click();
        await page.getByRole("button", { name: "Entrar na minha conta", exact: true }).waitFor();
        await page.screenshot({ path: `/workspace/screenshots/public-home-${width}.png`, fullPage: false });
      }
      if (path === "/contato") assert.ok(await page.locator('a[href="mailto:contato@nuvembot.net"]').count() > 0);
      console.log(`OK ${width}px ${path}`);
    }
    for (const path of links) {
      const response = await context.request.get(origin + path);
      assert.equal(response.status(), 200, `Broken internal link ${path}`);
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
} finally { await browser.close(); }
