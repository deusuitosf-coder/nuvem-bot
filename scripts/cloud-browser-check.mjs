import assert from "node:assert/strict";
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ locale: "pt-BR", viewport: { width, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const user = { id: "10000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", email: "fixture@example.invalid", email_confirmed_at: new Date().toISOString(), created_at: new Date().toISOString(), app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {} };
    const token = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url") + "." + Buffer.from(JSON.stringify({ sub: user.id, aud: "authenticated", role: "authenticated", exp: Math.floor(Date.now()/1000)+3600 })).toString("base64url") + ".fixture";
    const projects = [];
    const items = [];
    const members = [];
    let denyInvite = false;
    await context.routeWebSocket("wss://vqcimzjyhpvdwsvronxw.supabase.co/**", ws => ws.close());
    await context.route("https://vqcimzjyhpvdwsvronxw.supabase.co/**", async route => {
      const request = route.request(), url = new URL(request.url());
      const reply = (body, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body), headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
      if (request.method() === "OPTIONS") return reply({});
      if (url.pathname.endsWith("/token")) return reply({ access_token: token, refresh_token: "fixture-refresh", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600, user });
      if (url.pathname.endsWith("/user")) return reply(user);
      if (url.pathname.endsWith("/logout")) return reply({});
      if (url.pathname.endsWith("/recover")) return reply({ message: "Too many requests" }, 429);
      if (url.pathname.endsWith("/resend")) return reply({});
      if (url.pathname.endsWith("/rpc/nuven_apply_board_changes")) {
        const { p_board_id, p_changes } = request.postDataJSON();
        for (const change of p_changes) {
          const index = items.findIndex(item => item.id === change.data.id);
          const saved = { id: change.data.id, board_id: p_board_id, data: change.data, updated_at: new Date().toISOString() };
          if (index < 0) items.push(saved); else items[index] = saved;
        }
        return reply(p_changes.length);
      }
      if (url.pathname.includes("/rpc/nuven_remaining_uses")) return reply({ ideas: 2, documents: 1 });
      if (url.pathname.includes("/functions/v1/nuven-service")) return reply({ error: "A IA ainda precisa ser ativada. Nenhum teste foi consumido." }, 503);
      if (url.pathname.endsWith("/nuvem_boards")) {
        if (request.method() === "POST") { const input = request.postDataJSON(); const p = { ...input, id: "20000000-0000-4000-8000-" + String(projects.length+1).padStart(12,"0") }; projects.push(p); return reply(p, 201); }
        return reply(url.searchParams.has("id") ? projects.filter(p => "eq." + p.id === url.searchParams.get("id")) : projects);
      }
      if (url.pathname.endsWith("/nuvem_items")) {
        if (request.method() === "POST") { for (const item of request.postDataJSON()) items.push({ ...item, updated_at: new Date().toISOString() }); return reply([], 201); }
        return reply(items.filter(item => "eq." + item.board_id === url.searchParams.get("board_id")));
      }
      if (url.pathname.endsWith("/nuvem_access")) {
        if (request.method() === "POST") { if (denyInvite) { denyInvite = false; return reply({ message: "Network unavailable" }, 503); } members.push(request.postDataJSON()); return reply([], 201); }
        if (request.method() === "DELETE") { const index = members.findIndex(m => "eq." + m.email === url.searchParams.get("email")); if (index >= 0) members.splice(index, 1); return reply([]); }
        return reply(members);
      }
      if (url.pathname.endsWith("/nuven_quote_requests")) return reply([]);
      throw new Error("Unmocked cloud route: " + request.method() + " " + url.pathname);
    });
    // Fixtures exercise UI behavior only; separate real SQL tests cover RLS.
    await page.goto("http://127.0.0.1:8081/conta", { waitUntil: "networkidle" });
    await page.getByLabel("E-mail", { exact: true }).fill(user.email);
    await page.getByRole("button", { name: "Esqueci minha senha", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Não foi possível enviar o pedido" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Esqueci minha senha", exact: true }).isEnabled(), true);
    await page.getByRole("button", { name: "Reenviar confirmação de e-mail", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Se o cadastro precisar de confirmação" }).waitFor();
    await page.getByLabel("Senha", { exact: true }).fill("Fixture-password-123");
    await page.getByRole("button", { name: "Entrar na minha conta", exact: true }).click();
    await page.getByLabel("Nome do novo projeto", { exact: true }).fill("Projeto A");
    await page.getByRole("button", { name: "Criar projeto", exact: true }).click();
    await page.getByRole("heading", { name: "Projeto A", exact: true }).waitFor();
    await page.getByLabel("Comando para este projeto", { exact: true }).fill("Crie uma nota: Apenas no projeto A");
    await page.getByRole("button", { name: "Aplicar ao projeto", exact: true }).click();
    await page.getByRole("region", { name: "Conteúdo do projeto" }).getByText("Apenas no projeto A", { exact: true }).waitFor();
    await page.getByLabel("Nome do novo projeto", { exact: true }).fill("Projeto B");
    await page.getByRole("button", { name: "Criar projeto", exact: true }).click();
    await page.getByRole("heading", { name: "Projeto B", exact: true }).waitFor();
    assert.equal(await page.getByRole("region", { name: "Conteúdo do projeto" }).getByText("Apenas no projeto A", { exact: true }).count(), 0);
    await page.getByLabel("E-mail para compartilhar", { exact: true }).fill("member@example.invalid");
    denyInvite = true;
    await page.getByRole("button", { name: "Conceder acesso", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Não foi possível conceder acesso" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Conceder acesso", exact: true }).isEnabled(), true);
    await page.getByRole("button", { name: "Conceder acesso", exact: true }).click();
    await page.getByText("member@example.invalid", { exact: true }).waitFor();
    assert.equal(members[0].role, "reader");
    await page.getByRole("button", { name: "Retirar acesso", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Acesso retirado" }).waitFor();
    assert.equal(members.length, 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.screenshot({ path: "/workspace/screenshots/cloud-" + width + ".png", fullPage: true, caret: "initial" });
    await page.goto("http://127.0.0.1:8081/documentos", { waitUntil: "networkidle" });
    await page.getByLabel("Documento PDF ou TXT", { exact: true }).setInputFiles({ name: "teste.txt", mimeType: "text/plain", buffer: Buffer.from("Um documento para organizar as etapas do projeto.") });
    await page.getByRole("status").filter({ hasText: "Texto extraído" }).waitFor();
    assert.match(await page.getByLabel("Texto do documento", { exact: true }).inputValue(), /organizar as etapas/);
    await page.getByLabel("Documento PDF ou TXT", { exact: true }).setInputFiles({ name: "teste.pdf", mimeType: "application/pdf", buffer: Buffer.from(readFileSync(new URL("./fixtures/nuven-test.pdf.base64", import.meta.url), "utf8").trim(), "base64") });
    await page.getByRole("status").filter({ hasText: "Texto extraído" }).waitFor();
    assert.match(await page.getByLabel("Texto do documento", { exact: true }).inputValue(), /Nuven PDF fixture/);
    await page.getByRole("button", { name: "Solicitar análise por IA", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Nenhum teste foi consumido" }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.screenshot({ path: "/workspace/screenshots/documents-" + width + ".png", fullPage: true, caret: "initial" });
    await page.goto("http://127.0.0.1:8081/conta", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Sair da conta", exact: true }).click();
    await page.getByRole("button", { name: "Entrar na minha conta", exact: true }).waitFor();
    assert.deepEqual(errors, []);
    await context.close();
    console.log("Account UI, project isolation, sharing, TXT and fail-closed AI checks passed at " + width + "px");
  }
} finally { await browser.close(); }
