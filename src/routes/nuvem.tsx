import { simulate, type SimResult, type SectorId } from "@/lib/sim-engine";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { decimalText, plainText, savedReports } from "@/lib/guardrails";
import { agentChecks, bends, boardFrom, chiefText, readSeed, runSir, sectors, seedGraph } from "@/lib/nuvem-bot";
import { copy, sayRisk, sayVerdict, type Lang } from "@/lib/nuvem-lang";
import { QuadroBot } from "@/components/quadro-board";

export const Route = createFileRoute("/nuvem")({
  head: () => ({ meta: [{ title: "Nuven Bot" }] }),
  component: NuvemPage,
});

function CurvePanel({ title, note, result, adopt, stop }: { title: string; note: string; result: SimResult; adopt: string; stop: string[] }) {
  const points = [result.startAdhesion, ...result.feed.map((round) => round.adhesion)];
  const first = result.feed[0]?.posts ?? [];
  const early = first.filter((post) => post.line === adopt || post.line === `Vou espalhar: ${adopt}`).map((post) => post.name);
  const stuck = result.lines.filter((post) => stop.some((line) => post.line === line || post.line === `Vou espalhar: ${line}`)).map((post) => post.name);
  const width = 320;
  const height = 112;
  const left = 16;
  const right = 304;
  const step = (right - left) / (points.length - 1);
  const y = (value: number) => height - 22 - (value / 100) * (height - 36);
  return (
    <section className="rise mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <h2 className="font-display text-xl text-navy">{title}</h2>
      <p className="mt-1 text-sm text-muted">{note}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 w-full" role="img" aria-label={title}>
        <path d={points.map((value, index) => `${index === 0 ? "M" : "L"} ${left + index * step} ${y(value)}`).join(" ")} fill="none" stroke="#0B3A66" strokeWidth="2" />
        {points.map((value, index) => (
          <g key={index}>
            <circle cx={left + index * step} cy={y(value)} r="4" fill="#0B3A66" />
            <text x={left + index * step} y={height - 4} textAnchor="middle" fontSize="11" fill="#0B3A66">{index}</text>
          </g>
        ))}
      </svg>
      <p className="text-sm text-ink">Começam: {early.length > 0 ? early.join(", ") : "ninguém"}.</p>
      <p className="mt-1 text-sm text-ink">Travam: {stuck.length > 0 ? stuck.join(", ") : "ninguém"}.</p>
    </section>
  );
}

function MessageTry({ seed, result }: { seed: string; result: SimResult }) {
  const base = readSeed(seed);
  const tries = [Math.max(0, base.change - 10), base.change, Math.min(40, base.change + 10)].map((change) => {
    const scene = simulate({ ...base, change, sector: "comunicacao" });
    return { change, adhesion: scene.adhesion };
  });
  const best = tries.reduce((chosen, item) => (item.adhesion > chosen.adhesion ? item : chosen));
  const doubt = result.lines.filter((post) => post.line.includes("dúvida") || post.line.includes("rejeição")).map((post) => post.name);
  return (
    <section className="rise mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <h2 className="font-display text-xl text-navy">Antes de publicar</h2>
      <p className="mt-1 text-sm text-muted">Três tamanhos da mesma mensagem. Não lê a nota e não diz o que a imprensa vai fazer.</p>
      <ul className="mt-3 grid gap-2">
        {tries.map((item, index) => (
          <li key={`${index}-${item.change}`} className="rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm text-navy">
            {item.change}%: {item.adhesion}% aderem{item.change === best.change ? ". A mais aceita nesta conta." : "."}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-ink">Duvidam ou rejeitam: {doubt.length > 0 ? doubt.join(", ") : "ninguém"}.</p>
    </section>
  );
}

function SirPanel() {
  const [beta, setBeta] = useState("0.3");
  const [gamma, setGamma] = useState("0.1");
  const contact = Number(beta.replace(",", "."));
  const recovery = Number(gamma.replace(",", "."));
  const run = runSir(Number.isFinite(contact) ? contact : 0.3, Number.isFinite(recovery) ? recovery : 0.1);
  const width = 320;
  const height = 112;
  const left = 16;
  const right = 304;
  const points = run.infectedCurve;
  const top = Math.max(...points, 1);
  const step = (right - left) / (points.length - 1);
  const y = (value: number) => height - 22 - (value / top) * (height - 36);
  return (
    <section className="rise mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <h2 className="font-display text-xl text-navy">SIR</h2>
      <p className="mt-1 text-sm text-muted">Suscetíveis, infectados e recuperados. 1.000 pessoas, 10 infectados no dia 0. Não usa dados de uma cidade.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-sm">
          Contato β
          <input value={beta} onChange={(event) => setBeta(decimalText(event.target.value))} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-base" />
        </label>
        <label className="text-sm">
          Recuperação γ
          <input value={gamma} onChange={(event) => setGamma(decimalText(event.target.value))} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-base" />
        </label>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 w-full" role="img" aria-label="Infectados ao longo dos dias">
        <path d={points.map((value, index) => `${index === 0 ? "M" : "L"} ${left + index * step} ${y(value)}`).join(" ")} fill="none" stroke="#0B3A66" strokeWidth="2" />
      </svg>
      <p className="text-sm text-ink">R0 {run.r0.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}. Pico de {run.peak.toLocaleString("pt-BR")} infectados no dia {run.peakDay}. No fim, {run.recovered.toLocaleString("pt-BR")} recuperados.</p>
    </section>
  );
}

const decisions = ["Aumentar o preço", "Criar uma assinatura", "Trocar o atendimento", "Fazer uma campanha"] as const;

function sentence(decision: string, change: number) {
  if (decision === "Criar uma assinatura") return `A assinatura muda ${change}%.`;
  if (decision === "Trocar o atendimento") return `O atendimento muda ${change}%.`;
  if (decision === "Fazer uma campanha") return `A campanha pede uma mudança de ${change}%.`;
  return `O preço sobe ${change}%.`;
}

function NuvemPage() {
  const [seed, setSeed] = useState<string>(sectors[0].seed);
  const [sector, setSector] = useState<SectorId>(sectors[0].id);
  const [move, setMove] = useState(15);
  const [sensitive, setSensitive] = useState(40);
  const [decision, setDecision] = useState<string>(decisions[0]);
  const read = { ...readSeed(seed), change: move, sensitive, decision };
  const result = simulate({ ...read, sector });
  const board = boardFrom(read);
  const graph = seedGraph(seed, result.lines);
  const [picked, setPicked] = useState("decisao");
  const [saved, setSaved] = useState<{ at: string; label: string }[]>([]);
  const [who, setWho] = useState(result.lines[0]?.name ?? "");
  const [question, setQuestion] = useState("");
  const [said, setSaid] = useState("");
  const [lang, setLang] = useState<Lang>("pt");
  const text = copy[lang];
  const chief = chiefText(agentChecks(), [{ name: "/nuvem", ok: true, detail: "aberta nesta tela" }], {
    answer: board.answer,
    adhesion: board.adhesion,
    resistance: board.resistance,
    rejection: board.rejection,
  });
  const path = [result.startAdhesion, ...result.feed.map((round) => round.adhesion)];
  const chosen = graph.nodes.find((node) => node.id === picked) ?? graph.nodes[0];
  const agents = graph.nodes.filter((node) => node.kind === "agente");
  const spot = (id: string) => {
    if (id === "decisao" || id === "cenario" || id === "numero") return { x: 180, y: 132 };
    const index = agents.findIndex((node) => node.id === id);
    const angle = -Math.PI / 2 + (index / agents.length) * Math.PI * 2;
    return { x: 180 + Math.cos(angle) * 96, y: 132 + Math.sin(angle) * 96 };
  };
  const sectorIndex = Math.max(0, sectors.findIndex((item) => item.id === sector));

  useEffect(() => {
    const raw = localStorage.getItem("nuvem-relatorios");
    if (!raw) return;
    try {
      setSaved(savedReports(JSON.parse(raw)));
    } catch {
      setSaved([]);
    }
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem("nuvem-lang");
    if (savedLang === "pt" || savedLang === "en" || savedLang === "es") {
      setLang(savedLang);
      return;
    }
    const tag = navigator.language.toLowerCase();
    setLang(tag.startsWith("es") ? "es" : tag.startsWith("pt") ? "pt" : "en");
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 font-sans sm:px-8 sm:py-10">
      <header className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/nuvem" className="flex items-center gap-3 text-navy" aria-label="Nuven Bot — início"><img src="/nuven-logo.svg" alt="" width="64" height="64" className="h-14 w-14 sm:h-16 sm:w-16" /><span className="font-display text-3xl sm:text-4xl">Nuven Bot</span></a>
          <div className="flex gap-1">
            {(["pt", "en", "es"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setLang(item);
                  localStorage.setItem("nuvem-lang", item);
                }}
                className={`min-h-11 rounded-full px-3 text-sm transition-colors duration-200 ${lang === item ? "bg-navy text-surface" : "text-navy"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div key={lang} className="rise mt-8 max-w-xl">
          <h1 className="font-display text-3xl leading-snug text-navy sm:text-4xl">{text.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{text.sub}</p>
        </div>
      </header>
      <section key={`${sector}-${lang}`} className="rise mt-6 rounded-[var(--radius-card)] bg-navy p-5 text-surface sm:p-6">
        <p className="text-xs tracking-[0.14em] text-mist">{text.voice}</p>
        <p className="word-in mt-3 font-display text-5xl leading-none sm:text-6xl">{sayVerdict(lang, board.answer)}</p>
        <p className="mt-3 text-sm text-mist">{text.sectors[sectorIndex]} · {text.change} {board.change}%</p>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-4">
          <p><span className="block font-display text-3xl">{board.adhesion}%</span><span className="text-xs text-mist">{text.adhere}</span></p>
          <p><span className="block font-display text-3xl">{board.resistance}%</span><span className="text-xs text-mist">{text.resist}</span></p>
          <p><span className="block font-display text-3xl">{board.rejection}%</span><span className="text-xs text-mist">{text.reject}</span></p>
        </div>
        <p className="mt-4 text-sm text-mist">{text.range(board.low, board.high)}</p>
        <p className="mt-1 text-sm text-mist">{text.scenes(board.pode, board.espere, board.nao, board.cuidado)}</p>
        <p className="mt-1 text-sm text-mist">{text.risk(board.risks.length > 0 ? board.risks.map((item) => sayRisk(lang, item)).join(", ") : text.none)}</p>
      </section>
      <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <h2 className="font-display text-xl text-navy">{text.demo}</h2>
        <ol className="mt-3 grid gap-3">
          <li>
            <p className="text-sm font-medium text-navy">{text.d1}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{text.d1b}</p>
          </li>
          <li>
            <p className="text-sm font-medium text-navy">{text.d2}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{text.d2b(sayVerdict(lang, board.answer))}</p>
          </li>
          <li>
            <p className="text-sm font-medium text-navy">{text.d3}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{text.d3b(board.adhesion, board.resistance, board.rejection)}</p>
          </li>
          <li>
            <p className="text-sm font-medium text-navy">{text.d4}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{text.d4b}</p>
          </li>
          <li>
            <p className="text-sm font-medium text-navy">{text.d5}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{text.d5b}</p>
          </li>
        </ol>
      </section>
      <p className="mt-6 text-xs font-medium tracking-[0.14em] text-muted">{text.sector}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {sectors.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSector(item.id);
              setSeed(item.seed);
              setMove(readSeed(item.seed).change);
              setDecision(readSeed(item.seed).decision);
              setSensitive(40);
              setPicked("decisao");
            }}
            className={`min-h-11 rounded-xl border px-3 text-sm transition-colors duration-200 ${sector === item.id ? "border-navy bg-navy text-surface" : "border-line bg-surface text-navy"}`}
          >
            {text.sectors[index]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">{text.rule}</p>
      <p className="mt-2 text-sm text-ink">{bends(path) ? text.bent(path.join(", ")) : text.straight}</p>
      <p className="mt-2 text-sm text-muted">{text.groups}</p>
      <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <h2 className="font-display text-xl text-navy">{text.calc}</h2>
        <label className="mt-3 block text-sm">
          {text.calcDecision}
          <select
            value={decision}
            onChange={(event) => {
              const next = event.target.value;
              setDecision(next);
              setSeed(sentence(next, move));
            }}
            className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base"
          >
            {decisions.map((item, index) => (
              <option key={item} value={item}>{text.decisions[index]}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm">
          {text.calcChange}: {move}%
          <input
            type="range"
            min={0}
            max={40}
            value={move}
            onChange={(event) => {
              const next = Number(event.target.value);
              setMove(next);
              setSeed((current) => (/\d+/.test(current) ? current.replace(/\d+/, String(next)) : `${current} ${next}%`));
            }}
            className="mt-2 w-full"
          />
        </label>
        <label className="mt-3 block text-sm">
          {text.calcSensitive}: {sensitive}%
          <input type="range" min={0} max={100} value={sensitive} onChange={(event) => setSensitive(Number(event.target.value))} className="mt-2 w-full" />
        </label>
      </section>
      <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <h2 className="font-display text-xl text-navy">{text.payTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">{text.payBody}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{text.payHow}</p>
      </section>
      <QuadroBot />
      <details className="mt-6">
        <summary className="min-h-11 cursor-pointer text-sm text-navy">{text.more}</summary>
      {sector === "lancamento" ? <CurvePanel title="A curva" note="Adesão em 4 rodadas. Não diz se o produto vira fenômeno." result={result} adopt="Eu experimento." stop={["Eu espero para ver.", "Eu não compro."]} /> : null}
      {sector === "saude" ? <CurvePanel title="A propagação" note="Quem segue a orientação em 4 rodadas. Não é um modelo de doença." result={result} adopt="Eu sigo a orientação." stop={["Eu adio.", "Eu não sigo."]} /> : null}
      {sector === "saude" ? <SirPanel /> : null}
      {sector === "comunicacao" ? <MessageTry seed={seed} result={result} /> : null}
      <label className="mt-6 block rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm">
        O cenário
        <textarea
          value={seed}
          onChange={(event) => {
            const clean = plainText(event.target.value, 280);
            const next = readSeed(clean);
            setSeed(clean);
            setMove(next.change);
            setDecision(next.decision);
          }}
          rows={2}
          className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-3 text-base"
        />
      </label>
      <button
        type="button"
        className="mt-4 min-h-11 rounded-xl bg-navy px-4 text-sm text-surface"
        onClick={() => {
          const sectorName = text.sectors[sectorIndex] ?? sector;
          const next = [{ at: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }), label: plainText(`${sectorName}: ${board.answer}, ${board.adhesion}% aderem. ${seed}`, 140) }, ...saved].slice(0, 6);
          localStorage.setItem("nuvem-relatorios", JSON.stringify(next));
          setSaved(next);
        }}
      >
        Guardar versão
      </button>
      {saved.length === 0 ? <p className="mt-2 text-sm text-muted">Nenhuma versão guardada neste aparelho.</p> : (
        <ul className="mt-2 grid gap-2">
          {saved.map((item) => (
            <li key={`${item.at}-${item.label}`} className="text-sm text-ink">{item.at}. {item.label}</li>
          ))}
        </ul>
      )}
      <section className="rise mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <h2 className="font-display text-xl text-navy">O mapa</h2>
        <p className="mt-1 text-sm text-muted">Sai do texto e do que os agentes falaram. Não é GraphRAG.</p>
        <svg viewBox="0 0 360 280" className="mt-3 w-full" role="img" aria-label="Mapa do cenário e dos agentes">
          {graph.edges.filter((edge) => edge.from === "decisao" || edge.to === picked || edge.from === picked).map((edge) => {
            const from = spot(edge.from);
            const to = spot(edge.to);
            return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={edge.from === picked || edge.to === picked ? "#0B3A66" : "#D5DDE6"} strokeWidth={edge.from === picked || edge.to === picked ? 2 : 1} />;
          })}
          {agents.map((node) => {
            const place = spot(node.id);
            return (
              <g key={node.id} onClick={() => setPicked(node.id)} className="cursor-pointer">
                <circle cx={place.x} cy={place.y} r={18} fill={picked === node.id ? "#0B3A66" : "#F4F7FB"} stroke="#0B3A66" />
                <text x={place.x} y={place.y + 32} textAnchor="middle" fontSize="11" fill="#0B3A66">{node.label}</text>
              </g>
            );
          })}
          <g onClick={() => setPicked("decisao")} className="cursor-pointer">
            <circle cx={180} cy={132} r={28} fill="#0B3A66" />
            <text x={180} y={128} textAnchor="middle" fontSize="11" fill="#F4F7FB">{board.change}%</text>
            <text x={180} y={144} textAnchor="middle" fontSize="10" fill="#D5DDE6">decisão</text>
          </g>
        </svg>
        <p className="text-sm text-ink"><span className="text-muted">{chosen?.label}. </span>{chosen?.memory}</p>
        <label className="mt-4 block text-sm">
          Perguntar a um agente
          <select value={who || result.lines[0]?.name} onChange={(event) => setWho(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base">
            {result.lines.map((line) => (
              <option key={line.name}>{line.name}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm">
          A pergunta
          <input value={question} onChange={(event) => setQuestion(plainText(event.target.value, 160))} className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-base" />
        </label>
        <button
          type="button"
          className="mt-3 min-h-11 rounded-xl border border-line px-4 text-sm text-navy"
          onClick={() => {
            const voice = result.lines.find((line) => line.name === (who || result.lines[0]?.name)) ?? result.lines[0];
            setSaid(voice ? `${voice.name}: ${voice.line}` : "");
          }}
        >
          Perguntar
        </button>
        {said ? <p className="mt-2 text-base text-navy">{said}</p> : null}
        <p className="mt-2 text-sm text-muted">A pergunta não muda a frase. Não é um chat.</p>
      </section>
      <ol className="mt-6 grid gap-4">
        {result.feed.map((round, index) => {
          const previous = result.feed[index - 1]?.posts;
          const posts = round.posts.filter((post, postIndex) => !previous || post.line !== previous[postIndex]?.line);
          return (
            <li key={round.round}>
              <h2 className="font-display text-xl text-navy">Rodada {round.round}</h2>
              {posts.length === 0 ? <p className="mt-2 text-sm text-muted">Ninguém mudou de frase.</p> : null}
              <ul className="mt-2 grid gap-2">
                {posts.map((post) => (
                  <li key={post.name} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
                    <p className="text-sm text-muted">{post.name}</p>
                    <p className="mt-1 text-lg leading-snug text-navy">{post.line}</p>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <h2 className="font-display text-xl text-navy">O chefe</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{chief}</p>
      </section>
      </details>
    </main>
  );
}
