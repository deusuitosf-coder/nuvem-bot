import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "node:http";

// Isolated local build only: no production writes or live attack traffic.
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const hostileParent = createServer((_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end('<iframe src="http://127.0.0.1:8081/nuvem"></iframe>');
});
await new Promise((resolve, reject) => { hostileParent.once("error", reject); hostileParent.listen(8082, "127.0.0.1", resolve); });
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

  // An actual local parent on another origin exercises frame-ancestors.
  const framing = await browser.newContext();
  const parent = await framing.newPage();
  const cdp = await framing.newCDPSession(parent);
  await cdp.send("Audits.enable");
  const issues = [];
  cdp.on("Audits.issueAdded", ({ issue }) => issues.push(issue));
  await parent.goto("http://127.0.0.1:8082/", { waitUntil: "networkidle" });
  assert.ok(issues.some((issue) => issue.details.contentSecurityPolicyIssueDetails?.violatedDirective.startsWith("frame-ancestors")), JSON.stringify(issues));
  assert.equal(await parent.frameLocator("iframe").getByRole("heading", { name: "Quadro", exact: true }).count(), 0);
  await framing.close();
  console.log("Security checks passed: real response headers, stored-XSS escaping, inline-handler blocking and hostile-frame blocking.");
} finally {
  await browser.close();
  await new Promise((resolve) => hostileParent.close(resolve));
}
