import assert from "node:assert/strict";
import { chromium } from "playwright";

// Isolated local build only: no production writes or live attack traffic.
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  const context = await browser.newContext({ locale: "pt-BR" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  const response = await page.goto("http://127.0.0.1:8081/nuvem", { waitUntil: "networkidle" });
  assert.equal(response.status(), 200);
  const headers = response.headers();
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.match(headers["content-security-policy"] ?? "", /script-src-attr 'none'/);
  assert.match(headers["content-security-policy"], /base-uri 'none'/);
  assert.match(headers["content-security-policy"], /frame-ancestors 'self'/);
  await page.getByRole("status").filter({ hasText: "Salvo neste navegador" }).waitFor();

  const payload = '<img src="/xss-security-probe" onerror="window.__nuvenXss=1"><script>window.__nuvenXss=1</script>';
  const backup = { notes: [{ id: "probe1", kind: "nota", texto: payload, cor: "sky", x: 16, y: 16 }], boxes: [], arrows: [] };
  const requests = [];
  page.on("request", (req) => { if (req.url().includes("xss-security-probe")) requests.push(req.url()); });
  await page.locator('input[type="file"]').setInputFiles({ name: "probe.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
  const note = page.getByRole("region", { name: "Quadro de notas" }).locator("article");
  await note.filter({ hasText: payload }).waitFor();
  assert.equal(await note.locator("img,script,iframe").count(), 0, "imported markup must remain literal text");
  assert.equal(await page.evaluate(() => window.__nuvenXss), undefined);
  assert.equal(requests.length, 0);

  // A second defence: inline event handlers are rejected by the real CSP.
  await page.evaluate(() => {
    const button = document.createElement("button");
    button.setAttribute("onclick", "window.__nuvenInline=1");
    document.body.append(button);
    button.click();
    button.remove();
  });
  assert.equal(await page.evaluate(() => window.__nuvenInline), undefined);
  assert.deepEqual(errors, []);
  await context.close();

  // Synthetic hostile parent is fulfilled locally; no external site is contacted.
  const framing = await browser.newContext();
  await framing.route("http://localhost:8082/**", (route) => route.fulfill({ contentType: "text/html", body: '<iframe src="http://127.0.0.1:8081/nuvem"></iframe>' }));
  const parent = await framing.newPage();
  const denied = parent.waitForEvent("console", { predicate: (msg) => msg.text().includes("frame-ancestors"), timeout: 15000 });
  await parent.goto("http://localhost:8082/", { waitUntil: "load" });
  await denied;
  await framing.close();
  console.log("Security checks passed: real response headers, stored-XSS escaping, inline-handler blocking and hostile-frame blocking.");
} finally {
  await browser.close();
}
