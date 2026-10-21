import { useEffect, useState } from "react";
import { cloudClient } from "@/lib/nuven-cloud";
export function CloudAnalysis() {
  const [text, setText] = useState("");
  const [remaining, setRemaining] = useState<{ ideas: number; documents: number; storage_bytes?: number; storage_limit_bytes?: number } | null>(null);
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() { const { data } = await cloudClient().rpc("nuven_remaining_uses"); setRemaining(data); }
  useEffect(() => { refresh(); }, []);
  return <section className="mt-10 border-t border-line pt-8">
    <h2 className="font-display text-3xl text-navy">Explore sua ideia com IA</h2>
    <p className="mt-4 leading-relaxed text-muted">A análise organiza o texto em resumo, pontos de atenção e próximos passos. Não prevê o mercado. O processamento depende da ativação do provedor; nenhuma resposta é simulada.</p>
    {remaining && <p className="mt-3 text-sm text-sky">Testes gratuitos restantes: {remaining.ideas} de ideias e {remaining.documents} de documentos.</p>}
    {remaining?.storage_limit_bytes !== undefined && <p className="mt-3 text-sm text-muted">Armazenamento dos seus projetos: {((remaining.storage_bytes ?? 0) / 1048576).toFixed(2)} MB de {(remaining.storage_limit_bytes / 1048576).toFixed(0)} MB. Medição do conteúdo JSON; não inclui índices ou backups.</p>}
    <label className="mt-5 block text-sm text-navy">Sua ideia ou estratégia<textarea rows={5} maxLength={6000} value={text} onChange={e => setText(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-surface p-4 text-base text-ink" /></label>
    <button disabled={busy || !text.trim()} className="mt-4 min-h-12 rounded-xl bg-navy px-6 text-surface disabled:opacity-50" onClick={async () => { setBusy(true); setMessage(""); try {
      const { data, error } = await cloudClient().functions.invoke("nuven-service", { body: { action: "analyze", kind: "idea", text } });
      if (error) { const detail = await error.context?.json().catch(() => null); throw new Error(detail?.error ?? "A IA não está disponível agora."); }
      if (data.error) throw new Error(data.error);
      setResult(data.text);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível analisar agora."); } finally { await refresh(); setBusy(false); } }}>{busy ? "Analisando…" : "Analisar minha ideia"}</button>
    {message && <p role="status" className="mt-4 text-sm text-muted">{message}</p>}
    {result && <p className="mt-6 whitespace-pre-wrap rounded-xl bg-mist p-5 leading-relaxed text-navy">{result}</p>}
    <a href="/documentos" className="mt-5 inline-flex min-h-11 items-center text-sky underline">Abrir documentos PDF e TXT</a>
  </section>;
}
