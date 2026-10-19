import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { quoteDraft, quoteText, type QuoteInput } from "@/lib/quote";

export function QuoteBuilder() {
  const [input, setInput] = useState<QuoteInput>({ company: "", service: "simples", units: 1, documents: 0, pages: 0, complexity: "padrao", deadline: "", description: "" });
  const [draft, setDraft] = useState<ReturnType<typeof quoteDraft> | null>(null);
  const [error, setError] = useState("");
  const field = "mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 py-2 text-base text-ink";
  function update<K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) { setInput((current) => ({ ...current, [key]: value })); setDraft(null); setError(""); }
  function download() {
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([quoteText(draft)], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "nuven-bot-orcamento.txt"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section id="orcamento" className="border-t border-line py-12">
    <p className="text-sm tracking-widest text-sky">SEU ESCOPO, ANTES DO PREÇO FINAL</p>
    <h2 className="mt-3 font-display text-3xl text-navy sm:text-4xl">Monte seu pedido de orçamento.</h2>
    <p className="mt-4 max-w-2xl leading-relaxed text-muted">Diga o que precisa, veja a base de preço e guarde um rascunho. Os dados ficam nesta página: nada é enviado nem cobrado.</p>
    <form onSubmit={(event) => { event.preventDefault(); try { setDraft(quoteDraft(input)); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Confira os campos."); } }} className="mt-8 grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2 sm:p-8">
      <label className="text-sm font-medium text-navy">Empresa ou projeto (opcional)<input className={field} maxLength={120} value={input.company} onChange={(e) => update("company", e.target.value)} autoComplete="organization" /></label>
      <label className="text-sm font-medium text-navy">Tipo de serviço<select className={field} value={input.service} onChange={(e) => update("service", e.target.value as QuoteInput["service"])}><option value="simples">Serviço simples — R$ 100 por serviço</option><option value="documentos">Documentos — a partir de R$ 800</option><option value="empresa">Projeto empresarial — a partir de R$ 800</option></select></label>
      <label className="text-sm font-medium text-navy">Quantidade de serviços<input className={field} type="number" min={1} max={100} step={1} required value={input.units} onChange={(e) => update("units", e.target.valueAsNumber)} /></label>
      <label className="text-sm font-medium text-navy">Complexidade<select className={field} value={input.complexity} onChange={(e) => update("complexity", e.target.value as QuoteInput["complexity"])}><option value="padrao">Padrão</option><option value="complexo">Complexa — orçamento a partir de R$ 800</option></select></label>
      {input.service !== "simples" && <><label className="text-sm font-medium text-navy">Quantidade de documentos<input className={field} type="number" min={input.service === "documentos" ? 1 : 0} max={100000} step={1} required value={input.documents} onChange={(e) => update("documents", e.target.valueAsNumber)} /></label><label className="text-sm font-medium text-navy">Total de páginas<input className={field} type="number" min={0} max={100000} step={1} required value={input.pages} onChange={(e) => update("pages", e.target.valueAsNumber)} /></label></>}
      <label className="text-sm font-medium text-navy">Data desejada (a confirmar)<input className={field} type="date" value={input.deadline} onChange={(e) => update("deadline", e.target.value)} /></label>
      <label className="text-sm font-medium text-navy sm:col-span-2">O que você precisa receber?<textarea className={field} rows={4} required maxLength={1500} value={input.description} onChange={(e) => update("description", e.target.value)} placeholder="Objetivo, documentos envolvidos e resultado esperado. Não inclua senhas ou dados sensíveis." /></label>
      <p className="text-sm leading-relaxed text-muted sm:col-span-2">A tarifa por documento/página e os adicionais ainda não foram definidos. Por isso, projetos complexos mostram um valor inicial, sem inventar um preço final.</p>
      <button type="submit" className="min-h-12 rounded-xl bg-navy px-6 py-3 font-medium text-surface sm:col-span-2">Gerar rascunho de orçamento</button>
      {error && <p role="alert" className="text-sm text-warn sm:col-span-2">{error}</p>}
    </form>
    {draft && <article id="quote-result" aria-live="polite" className="mt-6 rounded-2xl border border-sky bg-mist p-6 sm:p-8"><p className="text-sm tracking-widest text-sky">RASCUNHO · SUJEITO À CONFIRMAÇÃO</p><h3 className="mt-3 text-xl font-medium text-navy">{draft.label}{draft.company ? ` — ${draft.company}` : ""}</h3><p className="mt-5 text-sm text-navy">{draft.customized ? "A partir de" : "Estimativa para o escopo simples"}</p><p className="mt-2 font-display text-4xl text-navy">{draft.minimum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p><p className="mt-4 whitespace-pre-wrap leading-relaxed text-ink">{draft.description}</p><p className="mt-4 text-sm text-muted">{draft.units} serviço(s) · {draft.documents} documento(s) · {draft.pages} página(s). Prazo e valor final a confirmar. Nenhum pedido foi enviado.</p><div className="quote-actions mt-6 flex flex-wrap gap-3"><button type="button" onClick={download} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-navy px-5 text-surface"><Download size={18} aria-hidden="true" />Baixar orçamento</button><button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-navy"><Printer size={18} aria-hidden="true" />Imprimir / salvar PDF</button></div><p className="mt-5 text-sm text-muted">Rascunho sem validade de proposta comercial. Atendimento e contratação estão em preparação.</p></article>}
  </section>;
}
