import test from "node:test";
import assert from "node:assert/strict";
import { aiProvider } from "../../supabase/functions/nuven-service/ai-provider.ts";

test("DeepSeek uses a fixed endpoint, bounded output and no thinking", () => {
  const env: Record<string,string> = { NUVEN_AI_PROVIDER: "deepseek", DEEPSEEK_API_KEY: "fixture", NUVEN_AI_MODEL: "unbounded-model" };
  const p = aiProvider(name => env[name]);
  assert.equal(p.key, "fixture");
  assert.equal(p.url, "https://api.deepseek.com/chat/completions");
  assert.deepEqual(p.parameters, { model: "deepseek-flash", max_tokens: 700, thinking: { type: "disabled" } });
});
test("existing OpenAI configuration is preserved and missing keys stay absent", () => {
  const p = aiProvider(() => undefined);
  assert.equal(p.key, undefined);
  assert.equal(p.url, "https://api.openai.com/v1/chat/completions");
  assert.throws(() => aiProvider(name => name === "NUVEN_AI_PROVIDER" ? "unknown" : undefined), /inválido/);
});
