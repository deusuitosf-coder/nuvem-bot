import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cloudClient } from "@/lib/nuven-cloud";
import { readDocument } from "@/lib/read-document";

export const Route = createFileRoute("/documentos")({
  head: () => ({ meta: [{ title: "Documentos — Nuven Bot" }] }), component: Documents,
});
function Documents() {
  const [text, setText] = useState("");
  const [pages, setPages] = useState(1);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  return <main className="mx-auto max-w-3xl px-5 py-8 font-sans text-ink">
    <header className="flex flex-wrap items-center justify-between gap-4"><a href="/" className="font-display text-3xl text-navy">Nuven Bot</a><a href="/conta" className="min-h-11 content-center text-sky underline">Minha conta e projetos</a></header>
    <h1 className="mt-10 font-display text-4xl text-navy">Documentos, com o escopo claro.</h1>
    <p className="mt-5 leading-relaxed text-muted">Leia o texto de um PDF ou TXT neste aparelho. A leitura do arquivo acontece no navegador. Apenas ao pedir análise por IA o texto é enviado para processamento. Evite documentos com dados pessoais sensíveis.</p>
    <p className="mt-4 rounded-xl bg-mist p-4 text-navy">Análise por IA: 1 teste gratuito por conta confirmada, com até 3 páginas e 6.000 caracteres. A IA depende de ativação pelo responsável. Falhas de configuração não consomem o teste.</p>
    <label className="mt-8 block text-sm font-medium text-navy">Documento PDF ou TXT<input aria-label="Documento PDF ou TXT" type="file" accept=".pdf,.txt,application/pdf,text/plain" disabled={busy} className="mt-3 block w-full text-sm" onChange={async e => {
      const file = e.target.files?.[0]; e.target.value = ""; if (!file) return; setBusy(true); setResult(""); setMessage("Lendo no navegador…");
      try { const document = await readDocument(file); setText(document.text); setPages(document.pages); setMessage("Texto extraído neste aparelho. Confira o conteúdo antes de solicitar a análise."); }
      catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível ler este arquivo."); }
      finally { setBusy(false); }
    }} /></label>
    <label className="mt-6 block text-sm font-medium text-navy">Texto do documento<textarea className="mt-2 w-full rounded-xl border border-line bg-surface p-4 text-base text-ink" rows={12} maxLength={60000} value={text} onChange={e => { setText(e.target.value); setPages(Math.max(1, Math.ceil(e.target.value.length / 2000))); setResult(""); }} placeholder="Você também pode colar um texto aqui." /></label>
    <p className="mt-3 text-sm text-muted">{text.length} caracteres · {pages} página(s){text && " · Em textos colados e TXT, cada 2.000 caracteres contam como uma página estimada."}</p>
    <button disabled={busy || !text.trim() || pages > 3 || text.length > 6000} className="mt-5 min-h-12 rounded-xl bg-navy px-6 text-surface disabled:opacity-50" onClick={async () => {
      setBusy(true); setMessage(""); try {
        const { data: auth } = await cloudClient().auth.getUser();
        if (!auth.user) { setMessage("Entre ou crie sua conta para usar a análise por IA."); return; }
        const { data, error } = await cloudClient().functions.invoke("nuven-service", { body: { action: "analyze", kind: "document", text, pages } });
        if (error) { const detail = await error.context?.json().catch(() => null); throw new Error(detail?.error ?? "A análise não está disponível agora. Nenhum resultado foi inventado."); }
        if (data.error) throw new Error(data.error);
        setResult(data.text); setMessage("Análise concluída. Confira os pontos importantes no documento original.");
      } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível analisar agora."); } finally { setBusy(false); }
    }}>{busy ? "Aguarde…" : "Solicitar análise por IA"}</button>
    {(pages > 3 || text.length > 6000) && <p className="mt-4 text-sm text-muted">Este documento excede o teste gratuito. <a href="/#orcamento" className="text-sky underline">Monte um pedido de orçamento.</a></p>}
    {message && <p role="status" className="mt-5 rounded-xl bg-mist p-4 text-navy">{message}</p>}
    {result && <section className="mt-8 rounded-2xl border border-line bg-surface p-6"><h2 className="font-display text-2xl text-navy">Resumo e próximos passos</h2><p className="mt-4 whitespace-pre-wrap leading-relaxed">{result}</p><p className="mt-4 text-sm text-muted">Resposta gerada por IA; pode conter erros. Não substitui análise profissional.</p></section>}
  </main>;
}
