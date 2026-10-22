export function aiProvider(read: (name: string) => string | undefined) {
  const name = read("NUVEN_AI_PROVIDER") ?? "openai";
  if (name !== "openai" && name !== "deepseek") throw new Error("Provedor de IA inválido.");
  const deepseek = name === "deepseek";
  const key = read(deepseek ? "DEEPSEEK_API_KEY" : "OPENAI_API_KEY");
  return {
    key,
    url: deepseek ? "https://api.deepseek.com/chat/completions" : "https://api.openai.com/v1/chat/completions",
    parameters: deepseek
      ? { model: "deepseek-flash", max_tokens: 700, thinking: { type: "disabled" } }
      : { model: read("NUVEN_AI_MODEL") ?? "gpt-4.1-mini", max_completion_tokens: 700 },
  };
}
