import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/apresentacao")({ component: Apresentacao });

const SLIDES = [
  {
    kicker: "Para a empresa",
    title: "Hoje todo mundo vê a mesma tela.",
    body: "Quem chega perde tempo. Quem já é cliente repete o cadastro.",
  },
] as const;

function Apresentacao() {
  const [index, setIndex] = useState(0);
  const last = 9;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") setIndex((value) => Math.min(last, value + 1));
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-6 font-sans">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium tracking-wide text-sky">PrimeiraVolta</p>
        <Link to="/" className="text-sm text-navy">Abrir a demo</Link>
      </div>

      <section className="flex flex-1 flex-col justify-center py-8" aria-live="polite">
        {index === 0 && (
          <>
            <p className="text-sm text-muted">Para a empresa</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">{SLIDES[0].title}</h1>
            <p className="mt-4 max-w-xl text-xl leading-relaxed text-ink">{SLIDES[0].body}</p>
          </>
        )}
        {index === 1 && (
          <>
            <p className="text-sm text-muted">Por que a empresa precisa</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy">A tela de vocês trata todo mundo igual.</h1>
            <ul className="mt-6 space-y-3">
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">Quem chega</span> <span className="text-muted">preenche campo demais e sai.</span></li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">Quem já é cliente</span> <span className="text-muted">faz o cadastro outra vez.</span></li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">Vocês não sabem</span> <span className="text-muted">se uma tela mais curta faz mais gente terminar. Nunca compararam as duas.</span></li>
            </ul>
          </>
        )}
        {index === 2 && (
          <>
            <p className="text-sm text-muted">O que a empresa recebe</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy">Cinco coisas, com nome.</h1>
            <ol className="mt-6 space-y-3">
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">1. O mapa.</span> <span className="text-muted">Onde a pessoa para hoje, nesse fluxo.</span></li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">2. A primeira visita.</span> <span className="text-muted">Uma tela com um passo.</span></li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">3. Quem já voltou.</span> <span className="text-muted">Uma tela com o atalho, sem cadastro de novo.</span></li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">4. As duas no ar.</span> <span className="text-muted">Metade vê a tela antiga. Metade vê a nova, por 30 dias.</span></li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">5. O relatório.</span> <span className="text-muted">Abandono das duas, e se a diferença se sustenta.</span></li>
            </ol>
          </>
        )}
        {index === 3 && (
          <>
            <p className="text-sm text-muted">As duas telas</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy">Um passo, ou o atalho.</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
                <p className="text-sm text-sky">Primeira visita</p>
                <p className="mt-2 font-display text-2xl text-navy">Um passo</p>
                <p className="mt-2 text-muted">Só o necessário para começar. Sem endereço, sem plano.</p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
                <p className="text-sm text-sky">Já voltou</p>
                <p className="mt-2 font-display text-2xl text-navy">O atalho</p>
                <p className="mt-2 text-muted">O pedido está pronto. O cadastro não aparece de novo.</p>
              </div>
            </div>
          </>
        )}
        {index === 4 && (
          <>
            <p className="text-sm text-muted">O que a empresa ganha</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy">Menos gente para no meio.</h1>
            <ul className="mt-6 space-y-3">
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3">
                <span className="font-medium">Loja.</span> <span className="text-muted">Quem chega preenche menos. Quem já comprou não cadastra de novo.</span>
              </li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3">
                <span className="font-medium">SaaS.</span> <span className="text-muted">A primeira conta fica curta. Na volta, a pessoa acha o atalho.</span>
              </li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3">
                <span className="font-medium">Clínica, escola ou serviço.</span> <span className="text-muted">A primeira marcação pede menos. Quem volta repete.</span>
              </li>
            </ul>
          </>
        )}
        {index === 5 && (
          <>
            <p className="text-sm text-muted">Como fazemos juntos</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy">Duas reuniões. Eu monto no meio.</h1>
            <ul className="mt-6 space-y-3">
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">Dia 1.</span> <span className="text-muted">Escolhemos o fluxo juntos. Vocês mostram o link e os números.</span></li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">Dias 2 a 5.</span> <span className="text-muted">Eu monto as duas telas. Vocês aprovam o texto, uma frase.</span></li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">Dias 6 a 29.</span> <span className="text-muted">As telas ficam no ar. Ninguém mexe no meio.</span></li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3"><span className="font-medium">Dia 30.</span> <span className="text-muted">Lemos o relatório juntos. Aí decidimos se há outro fluxo.</span></li>
            </ul>
          </>
        )}
        {index === 6 && (
          <>
            <p className="text-sm text-muted">Como se mede</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy">Uma linha no relatório.</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink">
              Abandono é quem começou e não terminou, dividido por quem começou.
            </p>
            <p className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 text-lg leading-relaxed">
              Abandono da tela antiga, abandono da PrimeiraVolta, e se a diferença se sustenta.
            </p>
            <Link to="/medicao" className="mt-4 inline-flex min-h-11 items-center text-navy">Ver conversão e coorte</Link>
          </>
        )}
        {index === 7 && (
          <>
            <p className="text-sm text-muted">Exemplo, não é o número de vocês</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy">70% contra 60%.</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-card)] bg-navy p-5 text-surface">
                <p className="text-sm text-mist">Tela antiga</p>
                <p className="mt-1 font-display text-4xl">70%</p>
                <p className="mt-1 text-sm text-mist">abandonaram</p>
              </div>
              <div className="rounded-[var(--radius-card)] bg-sky p-5 text-surface">
                <p className="text-sm text-mist">PrimeiraVolta</p>
                <p className="mt-1 font-display text-4xl">60%</p>
                <p className="mt-1 text-sm text-mist">abandonaram</p>
              </div>
            </div>
            <p className="mt-4 text-muted">Dez pontos a menos. Só entra no relatório se a conta se sustentar. Amostra pequena fica escrito assim.</p>
          </>
        )}
        {index === 8 && (
          <>
            <p className="text-sm text-muted">O que não entra</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy">Não é o site inteiro.</h1>
            <ul className="mt-6 space-y-3">
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 text-muted">Segundo fluxo, anúncio, aplicativo ou WhatsApp.</li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 text-muted">Promessa de que a venda vai subir.</li>
              <li className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 text-muted">Aviso de carrinho. Isso é outro serviço, se vocês pedirem.</li>
            </ul>
          </>
        )}
        {index === 9 && (
          <>
            <p className="text-sm text-muted">Para a empresa</p>
            <h1 className="mt-3 font-display text-5xl text-navy">Investimento</h1>
            <p className="mt-3 font-display text-5xl text-navy">R$ 4.900</p>
            <p className="mt-3 text-xl leading-relaxed">Um fluxo, 30 dias, as cinco entregas. Não é custo mensal e não inclui o anúncio.</p>
            <p className="mt-4 text-muted">Começa quando chegam o link, os números do mês e a pessoa que entra nas duas reuniões.</p>
          </>
        )}
      </section>

      <div className="flex items-center justify-between gap-3 pb-2">
        <button
          type="button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
          className="min-h-11 rounded-full border border-line bg-surface px-4 disabled:opacity-40"
        >
          Anterior
        </button>
        <p className="text-sm text-muted">{index + 1} / 10</p>
        <button
          type="button"
          onClick={() => setIndex((value) => Math.min(last, value + 1))}
          disabled={index === last}
          className="min-h-11 rounded-full bg-navy px-4 text-surface disabled:opacity-40"
        >
          Próximo
        </button>
      </div>
    </main>
  );
}
