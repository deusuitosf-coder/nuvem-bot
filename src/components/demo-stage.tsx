import { useState, type FormEvent } from "react";
import { SAFE_EMAIL_ERROR, validateEmail } from "@/lib/ui-checks";
import { screenMessage } from "@/lib/guardrails";

export type Profile = "new" | "back";

export function DemoStage({
  profile,
  onProfile,
  notice,
  onNotice,
}: {
  profile: Profile;
  onProfile: (profile: Profile) => void;
  notice: string;
  onNotice: (notice: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateEmail(String(new FormData(event.currentTarget).get("email") ?? ""));
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError("");
    onProfile("back");
    onNotice(screenMessage("Conta iniciada. Na segunda visita a tela muda."));
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-surface p-6" data-testid="stage">
      {profile === "new" ? (
        <div data-testid="view-new">
          <p className="mb-3 inline-flex rounded-full bg-mist px-3 py-1 text-sm text-navy">Primeira visita</p>
          <h2 className="font-display text-3xl leading-tight text-ink">Um passo para começar</h2>
          <p className="mt-2 text-muted">Sem endereço, sem telefone, sem plano. Só o necessário para começar.</p>
          <form onSubmit={submit} className="mt-4" data-testid="form-new" noValidate>
            <label htmlFor="email" className="text-sm">E-mail</label>
            <input
              id="email"
              name="email"
              type="text"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@empresa.com"
              data-testid="email"
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-3 text-base text-ink outline-none focus:border-sky"
            />
            <p className="mt-2 min-h-5 text-sm text-warn" role="alert" data-testid="form-error">{error}</p>
            <button type="submit" className="mt-2 min-h-11 w-full rounded-xl bg-sky px-4 text-surface">Começar agora</button>
          </form>
        </div>
      ) : (
        <div data-testid="view-back">
          <p className="mb-3 inline-flex rounded-full bg-mist px-3 py-1 text-sm text-navy">Já voltou</p>
          <h2 className="font-display text-3xl leading-tight text-ink">Olá, Marina</h2>
          <p className="mt-2 text-muted">Seu pedido de sexta está pronto. Não precisa cadastrar de novo.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-bg p-4"><strong>Pedido de sexta</strong><br />2 itens · repetir</div>
            <div className="rounded-xl border border-line bg-bg p-4"><strong>Histórico</strong><br />12 compras · ver</div>
          </div>
          <button
            type="button"
            data-testid="repeat"
            className="mt-4 min-h-11 w-full rounded-xl bg-sky px-4 text-surface"
            onClick={() => onNotice(screenMessage("Pedido repetido. Fluxo concluído."))}
          >
            Repetir pedido
          </button>
        </div>
      )}
      <p className="sr-only">{SAFE_EMAIL_ERROR}</p>
      <p className="mt-4 text-sm text-ok" data-testid="notice" aria-live="polite">{notice}</p>
    </section>
  );
}
