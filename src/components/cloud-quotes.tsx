import { useEffect, useState } from "react";
import { cloudClient } from "@/lib/nuven-cloud";
type Request = { id: string; scope: string; service: string; complexity: string; state: string; units: number };
export function CloudQuotes() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const { data, error } = await cloudClient().from("nuven_quote_requests").select("id,scope,service,complexity,state,units").order("created_at", { ascending: false }).limit(100);
    if (error) { setMessage("Não foi possível carregar os pedidos."); return; }
    setRequests(data ?? []);
  }
  useEffect(() => { refresh(); }, []);
  return <section className="mt-10 border-t border-line pt-8"><h2 className="font-display text-3xl text-navy">Meus pedidos de orçamento</h2><p className="mt-4 leading-relaxed text-muted">O pedido registrado fica na sua conta para acompanhamento. Projetos complexos precisam de escopo e preço final confirmados. Pagamentos dependem da ativação da conta de recebimento.</p><a href="/#orcamento" className="mt-4 inline-flex min-h-11 items-center text-sky underline">Montar novo orçamento</a><button className="ml-4 min-h-11 text-navy underline" onClick={refresh}>Atualizar pedidos</button>
    {!requests.length && <p className="mt-4 text-sm text-muted">Nenhum pedido registrado nesta conta.</p>}
    <div className="mt-5 space-y-4">{requests.map(request => <article key={request.id} className="rounded-xl border border-line bg-surface p-5"><p className="text-sm text-sky">{request.state === "paid" ? "Pagamento confirmado" : request.state === "reviewing" ? "Em análise" : request.state === "approved" ? "Orçamento aprovado" : "Pedido registrado"}</p><p className="mt-2 whitespace-pre-wrap text-navy">{request.scope}</p><p className="mt-2 break-all text-xs text-muted">Protocolo: {request.id}</p>
      {request.state !== "paid" && request.service === "simples" && request.complexity === "padrao" && <button disabled={busy} className="mt-4 min-h-11 rounded-xl border border-line px-4 text-navy disabled:opacity-50" onClick={async () => { setBusy(true); setMessage(""); try {
        const { data, error } = await cloudClient().functions.invoke("nuven-service", { body: { action: "checkout", quote_id: request.id } });
        if (error) { const detail = await error.context?.json().catch(() => null); throw new Error(detail?.error ?? "Pagamento indisponível; nenhuma cobrança foi criada."); }
        if (data.error) throw new Error(data.error);
        if (typeof data.url !== "string" || new URL(data.url).origin !== "https://checkout.stripe.com") throw new Error("Endereço de pagamento inválido.");
        window.location.assign(data.url);
      } catch (error) { setMessage(error instanceof Error ? error.message : "Pagamento indisponível."); } finally { setBusy(false); } }}>Consultar pagamento seguro</button>}
    </article>)}</div>{message && <p role="status" className="mt-5 text-sm text-muted">{message}</p>}
  </section>;
}
