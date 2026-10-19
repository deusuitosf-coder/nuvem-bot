import { useEffect, useState } from "react";
import { BOARD_STORAGE_KEY, parseBoard, serializeBoard } from "@/lib/quadro-storage";
import { plainText } from "@/lib/guardrails";
import { emptyBoard, runTurn, type Board, type Caixa, type Note } from "@/lib/quadro";

const tone: Record<Note["cor"], string> = {
  navy: "bg-navy text-surface",
  sky: "bg-mist text-navy",
  mist: "bg-surface text-navy",
  ok: "bg-mist text-ok",
  warn: "bg-mist text-warn",
};

function center(item: Note | Caixa) {
  return { x: item.x + 96, y: item.y + 48 };
}

export function QuadroBot() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState("Carregando rascunho local…");
  const [canSave, setCanSave] = useState(true);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOARD_STORAGE_KEY);
      if (raw !== null) setBoard(parseBoard(raw));
      setReady(true);
    } catch {
      setCanSave(false);
      setReady(true);
      setStorageMessage("Não foi possível ler o rascunho. O conteúdo armazenado foi preservado. Exporte as novas notas para não perdê-las.");
    }
  }, []);
  useEffect(() => {
    if (!ready || !canSave) return;
    try {
      localStorage.setItem(BOARD_STORAGE_KEY, serializeBoard(board));
      setStorageMessage("Salvo neste navegador. Não sincroniza com outros aparelhos.");
    } catch {
      setStorageMessage("Não foi possível salvar. Exporte o quadro antes de fechar esta página.");
    }
  }, [board, ready, canSave]);

  function exportBoard() {
    try {
      const url = URL.createObjectURL(new Blob([serializeBoard(board)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "nuven-bot-quadro.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setStorageMessage("Não foi possível exportar este quadro.");
    }
  }
  const [log, setLog] = useState<{ who: "voce" | "bot"; text: string }[]>([
    { who: "bot", text: "Peça notas, um diagrama ou a análise de um faturamento fictício. Eu não prevejo o mercado." },
  ]);

  function send(value: string) {
    if (!ready) return;
    const clean = plainText(value, 400);
    if (!clean) return;
    const turn = runTurn(clean, board);
    setBoard(turn.board);
    setLog((current) => [...current, { who: "voce", text: clean }, { who: "bot", text: turn.said }]);
    setDraft("");
  }

  const items = [...board.notes, ...board.boxes];
  const byId = new Map(items.map((item) => [item.id, item]));

  return (
    <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <h2 className="font-display text-xl text-navy">Quadro</h2>
      <p role="status" className="mt-2 text-sm text-muted">{storageMessage}</p>
      <button type="button" disabled={!ready} onClick={exportBoard} className="mt-3 min-h-11 rounded-xl border border-line px-4 text-sm text-navy disabled:opacity-50">Exportar quadro JSON</button>
      <p className="mt-1 text-sm leading-relaxed text-muted">O pedido chama uma ferramenta. O quadro muda. Os números do exemplo são fictícios.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <div className="relative min-h-80 overflow-auto rounded-[var(--radius-card)] border border-line bg-bg" role="region" aria-label="Quadro de notas">
          <div className="relative h-[28rem] min-w-[44rem]">
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              {board.arrows.map((arrow) => {
                const from = byId.get(arrow.de);
                const to = byId.get(arrow.para);
                if (!from || !to) return null;
                const start = center(from);
                const end = center(to);
                return <line key={arrow.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="currentColor" className="text-sky" strokeWidth="2" />;
              })}
            </svg>
            {board.notes.map((note, index) => (
              <article key={note.id} className={`absolute w-44 rounded-[var(--radius-card)] border border-line p-3 shadow-sm ${tone[note.cor]}`} style={{ left: note.x, top: note.y }}>
                <p className="text-xs">Nota {index + 1}</p>
                <p className="mt-1 text-sm leading-relaxed">{note.texto}</p>
              </article>
            ))}
            {board.boxes.map((box, index) => (
              <article key={box.id} className="absolute w-52 rounded-[var(--radius-card)] border border-navy bg-surface p-3 text-navy" style={{ left: box.x, top: box.y }}>
                <p className="text-xs">Caixa {index + 1}</p>
                <h3 className="mt-1 text-sm font-medium leading-relaxed">{box.titulo}</h3>
              </article>
            ))}
          </div>
        </div>
        <div className="flex min-h-80 flex-col rounded-[var(--radius-card)] border border-line bg-bg p-3">
          <div className="flex flex-1 flex-col gap-2 overflow-auto" aria-live="polite">
            {log.map((line, index) => (
              <p key={`${line.who}-${index}`} className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${line.who === "bot" ? "bg-surface text-navy" : "bg-navy text-surface"}`}>
                {line.text}
              </p>
            ))}
          </div>
          <form
            className="mt-3 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <label className="text-sm text-navy" htmlFor="quadro-chat">
              Pedido
              <input
                id="quadro-chat"
                disabled={!ready}
                maxLength={400}
                placeholder="Crie uma nota: minha ideia"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base"
              />
            </label>
            <button type="submit" disabled={!ready || !draft.trim()} className="min-h-11 rounded-xl bg-navy px-4 text-sm text-surface disabled:opacity-50">
              Enviar
            </button>
          </form>
          <div className="mt-2 grid gap-2">
            <button type="button" className="min-h-11 rounded-xl border border-line px-3 text-left text-sm text-navy" onClick={() => send("Crie 3 notas sobre problemas do cliente.")}>
              Criar 3 notas
            </button>
            <button type="button" className="min-h-11 rounded-xl border border-line px-3 text-left text-sm text-navy" onClick={() => send("Analise faturamento de R$ 10.000 com 100 clientes e aumento de 15%.")}>
              Analisar faturamento
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
