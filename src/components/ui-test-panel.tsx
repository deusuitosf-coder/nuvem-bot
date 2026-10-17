import { useState } from "react";
import { isPublicMessage, logicChecks, SAFE_EMAIL_ERROR, type CheckResult } from "@/lib/ui-checks";

async function tick() {
  await new Promise((resolve) => setTimeout(resolve, 60));
}

async function fill(value: string) {
  const email = document.querySelector<HTMLInputElement>("[data-testid=email]");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setter?.call(email, value);
  email?.dispatchEvent(new Event("input", { bubbles: true }));
  await tick();
}

export function UiTestPanel({ onReset }: { onReset: () => void }) {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const next: CheckResult[] = [...logicChecks()];
    setResults(next);
    const steps: Array<(push: (result: CheckResult) => void) => Promise<void>> = [
      async (push) => {
        const email = document.querySelector<HTMLInputElement>("[data-testid=email]");
        const form = document.querySelector<HTMLFormElement>("[data-testid=form-new]");
        if (!email || !form) {
          push({ name: "Campo vazio não avança", ok: false, detail: "formulário ausente" });
          return;
        }
        await fill("");
        form.requestSubmit();
        await tick();
        const message = document.querySelector("[data-testid=form-error]")?.textContent ?? "";
        const stayed = Boolean(document.querySelector("[data-testid=view-new]"));
        push({
          name: "Campo vazio não avança",
          ok: stayed && message === SAFE_EMAIL_ERROR,
          detail: message || "sem aviso",
        });
      },
      async (push) => {
        const form = document.querySelector<HTMLFormElement>("[data-testid=form-new]");
        await fill("nao-e-email");
        form?.requestSubmit();
        await tick();
        const message = document.querySelector("[data-testid=form-error]")?.textContent ?? "";
        push({
          name: "Preenchimento inválido mostra frase segura",
          ok: message === SAFE_EMAIL_ERROR && isPublicMessage(message),
          detail: message,
        });
      },
      async (push) => {
        const form = document.querySelector<HTMLFormElement>("[data-testid=form-new]");
        await fill("marina@empresa.com");
        form?.requestSubmit();
        await tick();
        const switched = Boolean(document.querySelector("[data-testid=view-back]"));
        const notice = document.querySelector("[data-testid=notice]")?.textContent ?? "";
        push({
          name: "E-mail válido troca para quem já voltou",
          ok: switched && notice.includes("segunda visita"),
          detail: notice,
        });
      },
      async (push) => {
        document.querySelector<HTMLButtonElement>("[data-testid=repeat]")?.click();
        await tick();
        const notice = document.querySelector("[data-testid=notice]")?.textContent ?? "";
        push({
          name: "Repetir pedido marca conclusão",
          ok: notice.includes("concluído"),
          detail: notice,
        });
      },
      async (push) => {
        const buttons = [...document.querySelectorAll("button")];
        const typed = buttons.every((button) => button.getAttribute("type"));
        const price = document.body.innerText.includes("4.900");
        const overflow = document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2;
        push({
          name: "Botões, preço e largura da tela",
          ok: typed && price && overflow,
          detail: typed && price && overflow ? "ok" : "faltou type, preço ou houve rolagem",
        });
      },
    ];

    onReset();
    await tick();
    await tick();
    for (const step of steps) {
      const batch: CheckResult[] = [];
      await step((result) => batch.push(result));
      next.push(...batch);
      setResults([...next]);
    }
    onReset();
    setRunning(false);
  }

  const failed = results.filter((item) => !item.ok).length;

  return (
    <aside className="pt-2" data-testid="tests">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg">Conferência</h2>
        <button
          type="button"
          onClick={() => void run()}
          disabled={running}
          data-testid="run-tests"
          className="min-h-11 rounded-full bg-navy px-4 text-sm text-surface disabled:opacity-60"
        >
          {running ? "Rodando…" : "Rodar agora"}
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">
        {results.length === 0
          ? "Ainda não rodou."
          : failed === 0
            ? `${results.length} testes passaram.`
            : `${failed} falha(s) em ${results.length}.`}
      </p>
      <ul className="mt-3 space-y-2">
        {results.map((item) => (
          <li key={item.name} className="rounded-xl border border-line px-3 py-2 text-sm" data-ok={item.ok}>
            <span className={item.ok ? "text-ok" : "text-warn"}>{item.ok ? "Passou" : "Falhou"}</span>
            <span className="mx-2 text-ink">{item.name}</span>
            <span className="block text-muted">{item.detail}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
