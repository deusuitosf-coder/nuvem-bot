import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firstGoal, layoutFor, type Goal, type Layout, type Visit } from "@/lib/adapt";
import { limparConversas } from "@/lib/limpar";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Camaleão" }] }),
  component: AdaptPage,
});

const goals: { id: Goal; label: string; hint: string }[] = [
  { id: "ver", label: "Ver", hint: "Uma abertura larga, para quem chega agora." },
  { id: "usar", label: "Usar", hint: "A tela curta, com o sinal e a escolha na frente." },
  { id: "explicar", label: "Explicar", hint: "O passo a passo inteiro, na ordem." },
];

const steps = [
  "A página lê um sinal: primeira visita ou retorno. Isso fica neste aparelho.",
  "Você escolhe o que quer fazer: ver, usar ou explicar.",
  "A tela troca. Ver é espaçosa. Usar é curta. Explicar é este texto.",
  "A mesma escolha devolve a mesma tela. Não prevê uma compra.",
];

function AdaptPage() {
  const [visit, setVisit] = useState<Visit>("primeira");
  const [goal, setGoal] = useState<Goal>("ver");
  const layout = layoutFor(goal);

  useEffect(() => {
    const count = Number(localStorage.getItem("iface-visits") ?? "0");
    limparConversas(localStorage);
    const next: Visit = count > 0 ? "de novo" : "primeira";
    setVisit(next);
    setGoal(firstGoal(next));
    localStorage.setItem("iface-visits", String(count + 1));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 font-sans sm:px-8 sm:py-10">
      <header className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-[0.18em] text-sky">CAMALEÃO</p>
        <p className="text-sm text-muted">{visit === "primeira" ? "Primeira visita" : "Você já voltou"}</p>
      </header>
      <Intro layout={layout} />
      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-navy">O que você quer agora</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {goals.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={goal === item.id}
              onClick={() => setGoal(item.id)}
              className={`min-h-11 rounded-xl border px-3 py-3 text-left transition-colors duration-200 ${goal === item.id ? "border-navy bg-navy text-surface" : "border-line bg-surface text-navy"}`}
            >
              <span className="block text-sm font-medium">{item.label}</span>
              <span className={`mt-1 block text-xs leading-relaxed ${goal === item.id ? "text-mist" : "text-muted"}`}>{item.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <Body layout={layout} visit={visit} goal={goal} />
      <Explicacao />
    </main>
  );
}

function Intro({ layout }: { layout: Layout }) {
  if (layout === "trabalho") {
    return (
      <div key={layout} className="rise mt-6">
        <h1 className="font-display text-3xl leading-snug text-navy">A tela já está no modo de uso.</h1>
      </div>
    );
  }
  if (layout === "aula") {
    return (
      <div key={layout} className="rise mt-8 max-w-xl">
        <h1 className="font-display text-3xl leading-snug text-navy">Quatro passos. A tela segue a escolha.</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">A explicação completa está no fim da página. O sinal é só se você já abriu esta página neste aparelho.</p>
      </div>
    );
  }
  return (
    <div key={layout} className="rise mt-10 max-w-xl">
      <h1 className="font-display text-4xl leading-snug text-navy sm:text-5xl">A página muda com quem chega.</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">Primeira visita, uma abertura. Na volta, a tela encurta. A escolha manda mais do que a visita.</p>
    </div>
  );
}

function Body({ layout, visit, goal }: { layout: Layout; visit: Visit; goal: Goal }) {
  if (layout === "abertura") {
    return (
      <ol className="rise mt-8 grid gap-3">
        {steps.map((step, index) => (
          <li key={step} className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink">
            <span className="font-medium text-navy">{index + 1}. </span>
            {step}
          </li>
        ))}
      </ol>
    );
  }
  if (layout === "trabalho") {
    return (
      <section key={layout} className="rise mt-6 rounded-[var(--radius-card)] bg-navy p-5 text-surface">
        <p className="text-xs tracking-[0.14em] text-mist">Sinal</p>
        <p className="mt-3 font-display text-4xl leading-none">{visit === "primeira" ? "Primeira" : "Volta"}</p>
        <p className="mt-4 text-sm leading-relaxed text-mist">Escolha atual: {goal}. Tela: trabalho. Troque o botão e a tela troca junto.</p>
      </section>
    );
  }
  return (
    <ol className="rise mt-8 grid gap-4">
      {steps.map((step, index) => (
        <li key={step}>
          <p className="text-sm font-medium text-navy">{index + 1}</p>
          <p className="mt-1 max-w-xl text-base leading-relaxed text-ink">{step}</p>
        </li>
      ))}
    </ol>
  );
}

function Explicacao() {
  const blocos = [
    {
      titulo: "O produto",
      texto: "O nome é Camaleão. É uma página que muda de forma. Na primeira visita ela abre larga. Na volta, encurta. Os botões Ver, Usar e Explicar trocam o miolo. A mesma escolha devolve a mesma tela, neste aparelho.",
    },
    {
      titulo: "O que o cliente recebe",
      texto: "Na tela, a explicação e os três modos. No pago, um pendrive com esta mesma página para abrir no computador dele, sem depender do endereço da internet.",
    },
    {
      titulo: "Grátis",
      texto: "Olhar, trocar Ver, Usar e Explicar, e ler tudo que está escrito aqui. Serve para decidir se o produto serve, antes de pagar.",
    },
    {
      titulo: "Pago",
      texto: "O pendrive só sai depois do Pix. O preço é combinado antes do envio. Sem o pagamento, nada é postado. O número do cartão não se digita nesta página.",
    },
    {
      titulo: "Para quem é",
      texto: "Para quem quer mostrar uma tela que se adapta à visita, numa banca ou no computador. Não é para banco, governo ou quem precisa ler contrato e prever venda.",
    },
    {
      titulo: "O que ele não faz",
      texto: "Não lê PDF. Não prevê o mercado. Não cobra sozinho. Não trabalha com o navegador fechado. Não protege o computador contra vírus. O clique fica só neste aparelho.",
    },
  ];
  return (
    <section className="mt-10 grid gap-4">
      <div>
        <h2 className="font-display text-2xl text-navy">Informação do Camaleão</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Tudo o que o cliente precisa saber está aqui. A tela de cima muda. Este texto não muda.</p>
      </div>
      <div className="grid gap-3">
        {blocos.map((bloco) => (
          <article key={bloco.titulo} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <h3 className="font-display text-xl text-navy">{bloco.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink">{bloco.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
