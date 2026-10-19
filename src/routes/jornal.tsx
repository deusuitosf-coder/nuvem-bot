import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/jornal")({
  head: () => ({ meta: [{ title: "Tiragem nº 1" }] }),
  component: Jornal,
});

const historias = [
  {
    secao: "Arquivo",
    titulo: "A palavra que não mudava",
    linha: "A mesma frase devolvia a mesma palavra.",
    texto: "Numa página antiga, a frase de exemplo era o juro que sobe 15%. A resposta era Espere: 15% aderem, 85% resistem, 0% rejeitam. Se a frase ficava igual, a palavra ficava igual. Não era previsão de caixa. Era uma conta repetida.",
  },
  {
    secao: "Visita",
    titulo: "A primeira tela e a de volta",
    linha: "Quem chegava via uma coisa. Quem voltava, outra.",
    texto: "Houve uma demo em que a primeira visita era longa e a volta era curta. A ideia era não pedir de novo o que a pessoa já tinha feito. A empresa veria, em trinta dias, se mais gente terminava. Não prometia o número antes da conta.",
  },
  {
    secao: "Ofício",
    titulo: "O pendrive esperava o Pix",
    linha: "Olhar era grátis. Levar para casa, não.",
    texto: "O combinado era simples. A pessoa lia na tela sem pagar. O que ela levava ia num pendrive, e o pendrive só saía depois do Pix. O preço era fechado antes. Cartão não se digitava na página.",
  },
];

function Jornal() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-surface px-4 py-6 font-sans text-ink sm:px-8 sm:py-8 print:max-w-none print:px-0">
      <p className="text-sm print:hidden">
        <Link to="/" className="text-navy underline">Voltar ao início</Link>
      </p>
      <header className="mt-4 border-y-2 border-navy py-4 text-center">
        <p className="text-xs tracking-[0.28em] text-navy">ARQUIVO IMPRESSO</p>
        <h1 className="mt-2 font-display text-5xl leading-none text-navy sm:text-7xl">A Tiragem</h1>
        <p className="mt-3 text-sm text-muted">Nº 1 · 19 de outubro de 2026 · Três histórias antigas · Não é notícia do dia</p>
      </header>
      <div className="mt-6 grid gap-6 md:grid-cols-3 md:gap-0">
        {historias.map((item, index) => (
          <article key={item.titulo} className={`md:px-4 ${index > 0 ? "border-t border-line pt-6 md:border-l md:border-t-0 md:pt-0" : ""}`}>
            <p className="text-xs tracking-[0.18em] text-sky">{item.secao}</p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-navy">{item.titulo}</h2>
            <p className="mt-3 text-sm font-medium text-ink">{item.linha}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{item.texto}</p>
          </article>
        ))}
      </div>
      <footer className="mt-8 border-t border-navy pt-3 text-xs text-muted">
        Tiragem de arquivo. As histórias são do que já foi feito nesta casa. Não preveem o mercado e não trazem nome apagado.
        <button type="button" onClick={() => window.print()} className="mt-3 block min-h-11 text-sm text-navy underline print:hidden">
          Imprimir esta tiragem
        </button>
      </footer>
    </main>
  );
}
