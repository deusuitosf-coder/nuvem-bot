import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "Não foi possível carregar esta página. Tente novamente.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-bg text-ink"
      }
    >
      <span className="text-sky" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-3xl text-navy">Não conseguimos abrir esta página.</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">Tente recarregar. Se o problema continuar, entre em contato e informe o que estava tentando fazer.</p>
      <p className="max-w-md break-words rounded-xl bg-mist p-4 text-sm text-muted">
        {errorMessage(error)}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3"><button onClick={() => window.location.reload()} className="min-h-12 rounded-xl bg-navy px-5 text-surface">Tentar novamente</button><a href="/" className="inline-flex min-h-12 items-center rounded-xl border border-line px-5 text-navy">Voltar ao início</a><a href="/contato" className="inline-flex min-h-12 items-center px-4 text-sky underline">Contato</a></div>
    </main>
  );
}
