export type QuoteInput = {
  company: string;
  service: "simples" | "documentos" | "empresa";
  units: number;
  documents: number;
  pages: number;
  complexity: "padrao" | "complexo";
  deadline: string;
  description: string;
};

export function quoteDraft(input: QuoteInput) {
  const company = input.company.trim().slice(0, 120);
  const description = input.description.trim().slice(0, 1500);
  if (!description) throw new Error("Descreva o que você precisa receber.");
  if (!["simples", "documentos", "empresa"].includes(input.service)) throw new Error("Escolha um serviço válido.");
  if (!["padrao", "complexo"].includes(input.complexity)) throw new Error("Escolha a complexidade.");
  for (const value of [input.units, input.documents, input.pages]) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 100000) throw new Error("Informe quantidades inteiras válidas.");
  }
  if (input.units < 1 || input.units > 100) throw new Error("Informe de 1 a 100 serviços.");
  if (input.service === "documentos" && (input.documents < 1 || input.pages < input.documents)) throw new Error("Informe os documentos e o total de páginas, com pelo menos uma página por documento.");
  const customized = input.service !== "simples" || input.complexity === "complexo";
  const minimum = customized ? 800 : input.units * 100;
  const label = input.service === "documentos" ? "Projeto documental" : input.service === "empresa" ? "Projeto empresarial" : "Serviço simples";
  return { ...input, company, description, deadline: input.deadline.slice(0, 10), label, minimum, customized };
}

export function quoteText(q: ReturnType<typeof quoteDraft>) {
  return [
    "NUVEN BOT — RASCUNHO DE ORÇAMENTO",
    "Estimativa, sujeita à análise de escopo. Não é contratação nem cobrança.",
    `Empresa: ${q.company || "Não informada"}`,
    `Serviço: ${q.label}`,
    `Quantidade de serviços: ${q.units}`,
    `Documentos: ${q.documents} | Total de páginas: ${q.pages}`,
    `Complexidade: ${q.complexity === "complexo" ? "Complexa" : "Padrão"}`,
    `Data desejada: ${q.deadline || "A combinar"}`,
    `Escopo solicitado: ${q.description}`,
    `${q.customized ? "Valor inicial, a partir de" : "Estimativa para serviços simples"}: ${q.minimum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    q.customized ? "O valor final depende de volume, complexidade, prazo e entregáveis. Não há tarifa por página/documento aprovada neste formulário." : `${q.units} serviço(s) × R$ 100. Escopo e prazo ainda precisam de confirmação.`,
    "Antes da contratação, confirmar: entregáveis, exclusões, revisões, prazo, valor final, condições de pagamento e validade da proposta.",
    "Este arquivo não envia pedidos nem confirma pagamento. Registre o pedido na sua conta para acompanhamento. Cobrança depende de aprovação do orçamento e ativação do provedor.",
  ].join("\n\n");
}
