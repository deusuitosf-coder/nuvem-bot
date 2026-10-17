import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { currentVersion, demoVersions } from "@/lib/versions";

export const Route = createFileRoute("/versoes")({ component: Versoes });

const NOTICE_KEY = "primeiravolta-aviso";
const SEEN_KEY = "primeiravolta-vista";

const label = {
  atual: "Atual",
  complemento: "Complemento",
  arquivada: "Não usar",
} as const;

function Versoes() {
  const [enabled, setEnabled] = useState(true);
  const [seen, setSeen] = useState(currentVersion.id);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(NOTICE_KEY) !== "off");
    setSeen(localStorage.getItem(SEEN_KEY) ?? "");
    setReady(true);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(NOTICE_KEY, next ? "on" : "off");
  }

  function markSeen() {
    setSeen(currentVersion.id);
    localStorage.setItem(SEEN_KEY, currentVersion.id);
  }

  const showNotice = ready && enabled && seen !== currentVersion.id;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8 font-sans">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium tracking-wide text-sky">PrimeiraVolta</p>
        <Link to="/" className="text-sm text-navy">Voltar à demo</Link>
      </div>
      <h1 className="mt-4 font-display text-4xl leading-tight text-navy">Versões da demo</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">
        A versão {currentVersion.id} é a que está nesta tela. Publicar de novo substitui o link antigo. Não cria outra demo.
      </p>

      <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-navy">Aviso de versão</h2>
            <p className="mt-1 text-sm text-muted">Só aparece aqui. A empresa não vê.</p>
          </div>
          <button
            type="button"
            aria-pressed={enabled}
            onClick={toggle}
            className={`min-h-11 rounded-full px-4 ${enabled ? "bg-navy text-surface" : "border border-line bg-surface text-ink"}`}
          >
            {enabled ? "Aviso ligado" : "Aviso desligado"}
          </button>
        </div>
        {showNotice && (
          <div className="mt-4 rounded-xl bg-mist p-4" role="status">
            <p className="text-ink">A demo mudou para a versão {currentVersion.id}. Publique de novo para o link antigo atualizar.</p>
            <button type="button" onClick={markSeen} className="mt-3 min-h-11 rounded-full border border-line bg-surface px-4">
              Já vi
            </button>
          </div>
        )}
      </section>

      <ol className="mt-4 space-y-3">
        {demoVersions.map((version) => (
          <li key={version.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-2xl text-navy">{version.title}</h2>
              <span className={`rounded-full px-3 py-1 text-sm ${version.state === "arquivada" ? "bg-mist text-warn" : "bg-mist text-navy"}`}>
                {label[version.state]}
              </span>
            </div>
            <p className="mt-2 text-ink">{version.place}</p>
            <p className="mt-1 text-sm text-muted">{version.note}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
