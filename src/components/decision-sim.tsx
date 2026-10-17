import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { generateProductName } from "@/lib/product-name";
import { simulate } from "@/lib/sim-engine";

const decisions = [
  "Aumentar o preço",
  "Criar uma assinatura",
  "Trocar o atendimento",
  "Fazer uma campanha",
];

const groups = [
  { name: "Cliente fiel", goal: "Continuar", rule: "Aceita uma mudança pequena.", link: "Indica os outros se confia." },
  { name: "Sensível a preço", goal: "Pagar menos", rule: "Sai se o preço sobe demais.", link: "Compara com o concorrente." },
  { name: "Cliente ocasional", goal: "Não se comprometer", rule: "Some se a mudança pede esforço.", link: "Não puxa os outros." },
  { name: "Insatisfeito", goal: "Ser ouvido", rule: "Resiste se a reclamação continua.", link: "Conta para o grupo." },
  { name: "Influenciador", goal: "Opinar", rule: "Não decide sozinho.", link: "Espalha a reação." },
  { name: "Compara concorrentes", goal: "Achar o melhor", rule: "Troca se o outro oferece mais.", link: "Leva a comparação para o grupo." },
  { name: "Quer atendimento humano", goal: "Falar com alguém", rule: "Rejeita se o atendimento some.", link: "Reclama quando fica só com a máquina." },
];

function when(name: string) {
  if (name === "Mudança menor") return "Uma mudança menor";
  if (name === "Mudança maior") return "Uma mudança maior";
  if (name === "Menos sensíveis") return "Menos clientes sensíveis";
  return "Mais clientes sensíveis";
}

function count(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits);
}

function verdict(adhesion: number, resistance: number, rejection: number) {
  if (rejection >= adhesion && rejection >= resistance) {
    return { title: "Não faça", why: "A rejeição é o maior dos cenários." };
  }
  if (resistance >= adhesion && resistance >= rejection) {
    return { title: "Espere", why: "A resistência é o maior dos cenários." };
  }
  if (adhesion >= 55 && rejection <= 20) {
    return { title: "Pode fazer", why: "A adesão é a maioria clara." };
  }
  return { title: "Faça com cuidado", why: "A adesão ganha, mas a resistência ainda é grande." };
}

export function DecisionSim() {
  const [decision, setDecision] = useState(decisions[0]);
  const [change, setChange] = useState("15");
  const [sensitive, setSensitive] = useState("40");
  const [complaint, setComplaint] = useState("");
  const [rival, setRival] = useState("");
  const move = count(change);
  const feel = count(sensitive);
  const note = complaint.trim().slice(0, 80);
  const other = rival.trim().slice(0, 80);
  const result = simulate({ decision, change: move, sensitive: feel, complaint: note, rival: other });
  const answer = verdict(result.adhesion, result.resistance, result.rejection);
  const swarm = result.lines;
  const futures = [
    { name: "Este futuro", change: move, feel },
    { name: "Mudança menor", change: Math.max(0, move - 10), feel },
    { name: "Mudança maior", change: move + 10, feel },
    { name: "Menos sensíveis", change: move, feel: Math.max(0, feel - 20) },
    { name: "Mais sensíveis", change: move, feel: feel + 20 },
  ].map((future, index) => {
    const scene = simulate({ decision, change: future.change, sensitive: future.feel, complaint: note, rival: other });
    return { ...future, index, scene, answer: verdict(scene.adhesion, scene.resistance, scene.rejection).title };
  });
  const turns = futures.filter((future) => future.index !== 0 && future.answer !== answer.title);
  const better = turns.find((future) => future.answer === "Pode fazer") ?? turns[0];
  const steps = [0, 10, 20, 30, 40];
  const rows = [20, 40, 60, 80];
  const map = rows.flatMap((row) =>
    steps.map((step) => {
      const scene = simulate({ decision, change: step, sensitive: row, complaint: note, rival: other });
      return { step, row, title: verdict(scene.adhesion, scene.resistance, scene.rejection).title };
    }),
  );
  const pode = map.filter((cell) => cell.title === "Pode fazer").length;
  const espera = map.filter((cell) => cell.title === "Espere").length;
  const nao = map.filter((cell) => cell.title === "Não faça").length;
  const nearStep = steps.reduce((best, step) => (Math.abs(step - Math.min(40, move)) < Math.abs(best - Math.min(40, move)) ? step : best));
  const nearRow = rows.reduce((best, row) => (Math.abs(row - feel) < Math.abs(best - feel) ? row : best));
  const risks = [
    decision === "Aumentar o preço" && move >= 10 ? "preço" : "",
    feel >= 35 ? "parte grande sensível a preço" : "",
    move >= 15 ? "comunicação ambígua" : "",
    decision === "Trocar o atendimento" ? "quem precisa de atendimento humano" : "",
    note ? `reclamação: ${note}` : "",
    other ? `concorrente: ${other}` : "",
  ].filter(Boolean);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5 font-sans sm:px-8 sm:py-8">
      <p className="text-sm font-medium tracking-wide text-sky">{generateProductName()}</p>
      <h1 className="mt-2 max-w-3xl font-display text-3xl leading-tight text-navy sm:mt-3 sm:text-6xl">
        O que acontece se você mudar
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink sm:mt-4 sm:text-lg">
        Várias possibilidades. Um resultado só.
      </p>

      <div className="mt-5 grid items-start gap-4 sm:mt-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <section className="order-2 rounded-[var(--radius-card)] border border-line bg-surface p-5 lg:order-1">
          <h2 className="font-display text-2xl text-navy">A decisão</h2>
          <label className="mt-4 block text-sm">
            O que vai mudar
            <select
              value={decision}
              onChange={(event) => setDecision(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base"
            >
              {decisions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm">
            {decision === "Aumentar o preço" ? "Aumento do preço, em %" : "Força da mudança, de 0 a 40"}
            <input value={change} onChange={(event) => setChange(event.target.value)} inputMode="numeric" className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-base" />
          </label>
          <label className="mt-4 block text-sm">
            Clientes sensíveis a preço, em %
            <input value={sensitive} onChange={(event) => setSensitive(event.target.value)} inputMode="numeric" className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-base" />
          </label>
          <label className="mt-4 block text-sm">
            Reclamação que mais se repete
            <input value={complaint} onChange={(event) => setComplaint(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-base" />
          </label>
          <label className="mt-4 block text-sm">
            Concorrente que o cliente compara
            <input value={rival} onChange={(event) => setRival(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-line px-3 text-base" />
          </label>
          <p className="mt-4 text-sm text-muted">{result.agents.toLocaleString("pt-BR")} agentes e 4 rodadas, neste aparelho. Sem servidor e sem modelo de linguagem.</p>
        </section>

        <section className="order-1 rounded-[var(--radius-card)] bg-navy p-5 text-surface sm:p-8 lg:order-2">
          <p className="text-sm text-mist">O resultado</p>
          <p className="mt-2 font-display text-5xl leading-none sm:text-6xl">{answer.title}</p>
          <p className="mt-3 text-base leading-snug text-mist">{answer.why}</p>
          {better ? <p className="mt-2 text-base leading-snug">{when(better.name)} vira {better.answer}.</p> : null}
          <p className="mt-2 text-sm leading-snug text-mist">{result.agents.toLocaleString("pt-BR")} agentes, 4 rodadas, neste aparelho. No início, {result.startAdhesion}% aderem. No fim, {result.adhesion}%.</p>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full" aria-hidden="true">
            <span className="bg-sky" style={{ width: `${result.adhesion}%` }} />
            <span className="bg-mist" style={{ width: `${result.resistance}%` }} />
            <span className="bg-warn" style={{ width: `${result.rejection}%` }} />
          </div>
          <ul className="mt-4 grid grid-cols-3 gap-2">
            <li>
              <p className="font-display text-3xl sm:text-4xl">{result.adhesion}%</p>
              <p className="text-sm text-mist">Aderem</p>
            </li>
            <li>
              <p className="font-display text-3xl sm:text-4xl">{result.resistance}%</p>
              <p className="text-sm text-mist">Resistem</p>
            </li>
            <li>
              <p className="font-display text-3xl sm:text-4xl">{result.rejection}%</p>
              <p className="text-sm text-mist">Rejeitam</p>
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-mist">
            {risks.length > 0 ? `Fatores de risco: ${risks.join(", ")}.` : "Nenhum fator de risco forte com estes números."}
          </p>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-3xl text-navy">Os grupos</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">Cada grupo fala pelo que fez nas 4 rodadas da decisão. Isso é a Virada, não o nuvem.bot.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {swarm.map((voice) => (
            <li key={voice.name} className={`rounded-[var(--radius-card)] border border-line bg-surface p-4 ${voice.name === "Influenciador" ? "lg:col-span-2" : ""}`}>
              <p className="text-sm text-muted">{voice.name}</p>
              <p className="mt-2 text-lg leading-snug text-navy">{voice.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-3xl text-navy">Vinte futuros</h2>
        <p className="mt-2 max-w-2xl text-lg text-ink">
          Dos 20, {pode} podem fazer, {espera} pedem espera e {nao} dizem não faça.
        </p>
        <ul className="mt-4 grid gap-4">
          {rows.map((row) => (
            <li key={row}>
              <p className="text-sm text-muted">{row}% sensíveis ao preço</p>
              <ul className="mt-2 grid grid-cols-5 gap-1">
                {map.filter((cell) => cell.row === row).map((cell) => {
                  const here = cell.step === nearStep && cell.row === nearRow;
                  const word = cell.title === "Pode fazer" ? "Pode" : cell.title === "Não faça" ? "Não" : "Espere";
                  return (
                    <li key={cell.step} className={`rounded-lg px-1 py-2 text-center ${here ? "bg-navy text-surface" : "border border-line bg-surface"}`}>
                      <p className={`text-xs ${here ? "text-mist" : "text-muted"}`}>{cell.step}%</p>
                      <p className="text-sm leading-tight">{word}</p>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">Pode é pode fazer. Não é não faça. A coluna é o tamanho da mudança. A célula escura é a mais perto desta decisão.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl text-navy">Os grupos que geram o resultado</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {groups.map((group) => (
            <li key={group.name} className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
              <p className="font-display text-2xl text-navy">{group.name}</p>
              <p className="mt-2 text-sm text-muted">Objetivo: {group.goal}</p>
              <p className="mt-1 text-sm text-ink">Regra: {group.rule}</p>
              <p className="mt-1 text-sm text-muted">Relação: {group.link}</p>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-8">
        <Link to="/nuvem" className="text-sm text-sky">nuvem.bot</Link>
      </p>
    </main>
  );
}
