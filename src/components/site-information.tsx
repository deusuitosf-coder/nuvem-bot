import type { ReactNode } from "react";

export function InformationPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="mx-auto max-w-3xl px-5 py-8 font-sans text-ink">
    <a href="/" className="inline-flex min-h-11 items-center font-display text-3xl text-navy">Nuven Bot</a>
    <h1 className="mt-8 font-display text-4xl text-navy">{title}</h1>
    <div className="mt-6 space-y-6 leading-relaxed text-muted">{children}</div>
  </main>;
}

export function InformationLinks() {
  return <footer className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-2 border-t border-line px-5 py-6 text-sm text-navy sm:px-8" aria-label="Informações e atendimento">
    <a href="/contato" className="inline-flex min-h-11 items-center underline">Contato</a>
    <a href="/termos" className="inline-flex min-h-11 items-center underline">Termos de uso</a>
    <a href="/privacidade" className="inline-flex min-h-11 items-center underline">Privacidade</a>
  </footer>;
}
