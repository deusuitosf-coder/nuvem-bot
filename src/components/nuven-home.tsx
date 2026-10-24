import type { ReactNode } from "react";
import { AccountAccess } from "@/components/account-access";
import { QuoteBuilder } from "@/components/quote-builder";
import { ArrowRight, FileText, GitBranch, StickyNote } from "lucide-react";

export function NuvenHome({ children }: { children?: ReactNode }) {
  function openQuote() {
    const details = document.getElementById("orcamento");
    if (details instanceof HTMLDetailsElement) details.open = true;
  }
  return (
    <main className="mx-auto max-w-6xl px-5 py-6 font-sans text-ink sm:px-8 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-6 border-b border-line pb-6">
        <a href="/" aria-label="Nuven Bot — início" className="flex items-center gap-4 text-navy">
          <img src="/nuven-logo.svg" alt="" width="72" height="72" className="h-16 w-16 sm:h-20 sm:w-20" />
          <span className="font-display text-4xl leading-none sm:text-5xl">Nuven Bot<span className="mt-2 block font-sans text-sm tracking-widest text-sky">IDEIAS EM MOVIMENTO</span></span>
        </a>
        <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-5 text-sm text-navy">
          <a href="#como-funciona" className="min-h-11 content-center">Como funciona</a>
          <div className="flex items-center gap-3" aria-label="Acesso à conta">
            <a href="#entrar" className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-4 font-medium text-navy">Entrar</a>
            <a href="#criar-conta" className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 font-medium text-surface">Criar conta</a>
          </div>
          <a href="/documentos" className="min-h-11 content-center">Documentos</a>
          <a href="#orcamento" onClick={openQuote} className="min-h-11 content-center">Orçamento</a>
          <a href="/nuvem" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-navy px-5 text-surface">Abrir demonstração <ArrowRight size={16} aria-hidden="true" /></a>
        </nav>
      </header>

      <AccountAccess embedded />

      <section className="grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-2">
        <div className="rise">
          <p className="text-sm font-medium tracking-widest text-sky">UM ESPAÇO PARA TIRAR IDEIAS DO PAPEL</p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-navy sm:text-6xl">Antes de investir seu dinheiro,<br /><span className="text-sky">explore sua ideia.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">Organize suas estratégias, compare cenários e enxergue os pontos de atenção antes de decidir. Reúna notas e conecte as etapas do seu plano no quadro visual.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/nuvem" className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-navy px-6 py-3 font-medium text-surface">Explorar minha ideia <ArrowRight size={20} aria-hidden="true" /></a>
            <a href="#como-funciona" className="inline-flex min-h-12 items-center rounded-xl border border-line bg-surface px-6 py-3 text-navy">Ver o que já funciona</a>
          </div>
          <p className="mt-4 text-sm text-muted">As simulações ajudam a refletir. Não preveem o mercado nem garantem resultados.</p>
          <p className="mt-4 text-lg font-medium text-sky">Demonstração aberta para explorar.</p><p className="mt-2 text-sm text-muted">Na conta confirmada, a análise por IA oferece até 2 testes de ideias e 1 de documento, sujeitos à ativação do provedor e aos limites do serviço. Um rascunho de orçamento não gera cobrança.</p>
        </div>
        <div className="rounded-3xl border border-line bg-mist p-5 sm:p-8" aria-label="Exemplo ilustrativo de organização de um projeto">
          <div className="flex items-center justify-between border-b border-line pb-4"><p className="font-medium text-navy">Meu próximo projeto</p><span className="rounded-full bg-surface px-3 py-1 text-xs text-navy">Exemplo visual</span></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-surface p-5 text-navy"><StickyNote size={24} aria-hidden="true" /><p className="mt-4 text-xs tracking-widest text-muted">A IDEIA</p><p className="mt-2 text-lg">Lançar meu novo serviço</p></div>
            <div className="rounded-2xl bg-navy p-5 text-surface"><GitBranch size={24} aria-hidden="true" /><p className="mt-4 text-xs tracking-widest text-mist">O PLANO</p><p className="mt-2 text-lg">Organizar etapas e conectar prioridades</p></div>
          </div>
          <div className="mx-auto h-7 w-px bg-line" aria-hidden="true" />
          <div className="rounded-2xl border border-line bg-surface p-5"><p className="text-xs tracking-widest text-sky">PRÓXIMO PASSO</p><p className="mt-2 text-lg text-navy">Colocar as primeiras ideias no quadro.</p></div>
        </div>
      </section>

      <figure className="overflow-hidden rounded-3xl border border-line bg-surface">
        <img src="/nuven-equipe.webp" alt="Ilustração de três profissionais organizando ideias e documentos ao redor de um computador" width="1200" height="660" loading="lazy" className="aspect-video w-full object-cover" />
        <figcaption className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"><div><p className="font-medium text-navy">Uma ideia ganha forma quando o trabalho fica claro.</p><p className="mt-2 text-sm text-muted">Imagem ilustrativa gerada por IA. Não representa clientes reais.</p></div><div className="rounded-xl bg-mist p-4 text-navy"><p className="text-xs tracking-widest text-sky">EXEMPLO DE PEDIDO</p><p className="mt-2 font-medium">12 documentos · 48 páginas</p><a href="#orcamento" className="mt-2 inline-block text-sm underline">Montar meu orçamento</a></div></figcaption>
      </figure>
      <section id="como-funciona" className="border-t border-line py-12">
        <p className="text-sm tracking-widest text-sky">O QUE VOCÊ PODE FAZER HOJE</p>
        <h2 className="mt-3 font-display text-3xl text-navy sm:text-4xl">Menos ideias espalhadas. Mais clareza.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { Icon: StickyNote, title: "Capture e organize", action: "Abrir notas e caixas", href: "/nuvem#quadro", body: "Crie notas e caixas com comandos simples. Organize o conteúdo e consulte um resumo do que está no quadro." },
            { Icon: GitBranch, title: "Conecte suas ideias", action: "Abrir quadro de conexões", href: "/nuvem#quadro", body: "Ligue notas e caixas em diagramas. A demonstração também inclui cenários calculados, sem prever o mercado." },
            { Icon: FileText, title: "Guarde e leve com você", action: "Abrir quadro e backups", href: "/nuvem#quadro", body: "O quadro salva neste navegador. Exporte um backup JSON ou acrescente um backup ao quadro sem substituir as notas atuais." },
          ].map(({ Icon, title, body, action, href }) => <article key={title} className="border-t-2 border-sky pt-5"><Icon className="text-sky" size={28} aria-hidden="true" /><h3 className="mt-4 text-xl font-medium text-navy">{title}</h3><p className="mt-3 leading-relaxed text-muted">{body}</p><a href={href} className="mt-4 inline-flex min-h-11 items-center gap-2 font-medium text-sky underline">{action}<ArrowRight size={16} aria-hidden="true" /></a></article>)}
        </div>
        <p className="mt-8 rounded-xl bg-mist p-5 text-sm leading-relaxed text-navy">O quadro de demonstração salva neste navegador. Em Minha conta, crie projetos privados na nuvem e conceda acesso por e-mail. Em Documentos, extraia texto de PDF e TXT. IA e pagamentos dependem da ativação do provedor; não há cobrança automática ativa.</p>
      </section>

      <section id="para-quem" className="border-t border-line py-12">
        <h2 className="font-display text-3xl text-navy sm:text-4xl">Um próximo passo para cada rotina.</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Autônomos", "Separe pedidos, entregas e etapas de cada trabalho."],
            ["Lojas e pequenos negócios", "Planeje uma promoção e organize as ações antes de investir."],
            ["Equipes e empresas", "Mapeie processos e visualize as prioridades de um projeto."],
            ["Professores e estudantes", "Conecte assuntos, monte resumos e planeje trabalhos."],
            ["Criadores de conteúdo", "Reúna pautas, roteiros e ideias para suas publicações."],
            ["Documentos", "Organize a lista de documentos, o total de páginas e o escopo do seu pedido de orçamento. Leia PDF e TXT. Para análise por IA: 1 teste grátis por conta, até 3 páginas e 6.000 caracteres, quando o provedor for ativado."],
          ].map(([title, body]) => <article key={title} className="min-w-0 break-inside-avoid border-t border-line pt-4"><h3 className="font-display text-2xl leading-snug text-sky">{title}</h3><p className="mt-2 leading-relaxed text-muted">{body}</p><a href={title === "Documentos" ? "/documentos" : "/conta"} className="mt-3 inline-flex min-h-11 items-center text-sky underline">{title === "Documentos" ? "Abrir documentos" : "Abrir meus projetos"}</a></article>)}
        </div>
      </section>
      <section className="grid gap-6 border-t border-line py-12 sm:grid-cols-2" aria-label="Escolha por onde começar">
        <article className="rounded-2xl bg-mist p-6"><h2 className="font-display text-2xl text-navy">Explore um cenário</h2><p className="mt-3 leading-relaxed text-muted">Ajuste a mudança e veja como os cenários demonstrativos respondem. Use a conta como ponto de reflexão.</p><a href="/nuvem#calculadora" className="mt-4 inline-flex min-h-11 items-center text-navy underline">Abrir simulação</a></article>
        <article className="rounded-2xl bg-mist p-6"><h2 className="font-display text-2xl text-navy">Organize no quadro</h2><p className="mt-3 leading-relaxed text-muted">Crie notas, conecte ideias e leve um backup. O conteúdo fica salvo neste navegador.</p><a href="/nuvem#quadro" className="mt-4 inline-flex min-h-11 items-center text-navy underline">Abrir meu quadro</a></article>
      </section>
      <details id="orcamento" className="border-t border-line py-8">
        <summary className="inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-navy px-6 py-3 font-medium text-surface">Fazer orçamento</summary>
        <QuoteBuilder />
      </details>
      {children}
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 text-sm text-muted"><div><p>Nuven Bot · Ideias com espaço para crescer.</p><p className="mt-2">Desenvolvido com apoio do ChatGPT.</p></div><a href="/nuvem" className="min-h-11 content-center text-navy">Acessar demonstração →</a></footer>
    </main>
  );
}
