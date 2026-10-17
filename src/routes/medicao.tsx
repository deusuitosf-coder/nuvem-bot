import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/medicao")({ component: Medicao });

type Week = { id: string; name: string; started: string; finished: string; returned: string };

const channels = [
  { name: "Site", started: 120, finished: 60, spent: 0 },
  { name: "WhatsApp", started: 40, finished: 24, spent: 200 },
  { name: "E-mail", started: 30, finished: 12, spent: 150 },
  { name: "Anúncio", started: 80, finished: 16, spent: 800 },
];

const days = [
  { name: "Segunda", started: 40, finished: 20 },
  { name: "Terça", started: 36, finished: 18 },
  { name: "Quarta", started: 50, finished: 10 },
  { name: "Quinta", started: 32, finished: 16 },
  { name: "Sexta", started: 44, finished: 22 },
  { name: "Sábado", started: 20, finished: 8 },
  { name: "Domingo", started: 18, finished: 7 },
];

const startWeeks: Week[] = [
  { id: "s1", name: "Semana 1", started: "100", finished: "40", returned: "15" },
  { id: "s2", name: "Semana 2", started: "80", finished: "30", returned: "8" },
  { id: "s3", name: "Semana 3", started: "120", finished: "50", returned: "10" },
];

function readCount(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits);
}

function reais(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function costEach(spent: number, finished: number) {
  if (finished <= 0) return "Sem gente";
  if (spent <= 0) return "Sem anúncio";
  return reais(spent / finished);
}
  function percent(part: number, total: number) {
  if (total <= 0) return "Sem gente";
  return `${Math.round((part / total) * 100)}%`;
}

function Medicao() {
  const [started, setStarted] = useState("200");
  const [finished, setFinished] = useState("80");
  const [weeks, setWeeks] = useState(startWeeks);

  const began = readCount(started);
  const done = readCount(finished);
  const over = done > began && began > 0;
  const abandoned = Math.max(0, began - done);

  function updateWeek(id: string, field: "started" | "finished" | "returned", value: string) {
    setWeeks((current) => current.map((week) => (week.id === id ? { ...week, [field]: value } : week)));
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8 font-sans">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium tracking-wide text-sky">PrimeiraVolta</p>
        <Link to="/apresentacao" className="text-sm text-navy">Voltar à apresentação</Link>
      </div>
      <h1 className="mt-4 font-display text-4xl leading-tight text-navy">O que a empresa precisa ver</h1>
      <p className="mt-3 max-w-xl text-lg leading-relaxed text-muted">
        O total do mês esconde a semana que piorou. Coorte é o grupo que começou junto. Estes números são um exemplo, até a empresa trazer os dela.
      </p>

      <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="font-display text-2xl text-navy">Conversão e abandono</h2>
        <p className="mt-2 text-sm text-muted">Conversão é quem terminou dividido por quem começou. Abandono é o resto.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Começaram
            <input
              value={started}
              onChange={(event) => setStarted(event.target.value)}
              inputMode="numeric"
              className="mt-1 min-h-11 w-full rounded-xl border border-line px-3"
            />
          </label>
          <label className="text-sm">
            Terminaram
            <input
              value={finished}
              onChange={(event) => setFinished(event.target.value)}
              inputMode="numeric"
              className="mt-1 min-h-11 w-full rounded-xl border border-line px-3"
            />
          </label>
        </div>
        {over ? (
          <p className="mt-4 text-warn">Quem terminou não pode ser mais do que quem começou.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <p className="rounded-xl bg-mist px-4 py-3"><span className="block text-sm text-muted">Conversão</span><span className="font-display text-3xl text-navy">{percent(done, began)}</span></p>
            <p className="rounded-xl bg-mist px-4 py-3"><span className="block text-sm text-muted">Abandono</span><span className="font-display text-3xl text-navy">{percent(abandoned, began)}</span></p>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="font-display text-2xl text-navy">Conversão por canal</h2>
        <p className="mt-2 text-sm text-muted">Canal é por onde a pessoa chegou ao fluxo. A conta é a mesma: quem terminou dividido por quem começou nesse canal. O exemplo não é o número da empresa.</p>
        <ul className="mt-4 space-y-2">
          {channels.map((channel) => {
            const weak = channel.name === "Anúncio";
            return (
              <li key={channel.name} className={`grid gap-1 rounded-xl px-4 py-3 sm:grid-cols-[8rem_1fr_auto] sm:items-center ${weak ? "bg-navy text-surface" : "bg-mist"}`}>
                <span className="font-medium">{channel.name}</span>
                <span className={`text-sm ${weak ? "text-mist" : "text-muted"}`}>{channel.finished} de {channel.started} terminaram</span>
                <span className="font-display text-xl">{percent(channel.finished, channel.started)}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-muted">O anúncio traz 80 pessoas e só 16 terminam. Conversão de 20%. O WhatsApp termina 60%. O total mistura os dois e esconde isso.</p>
      </section>

      <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="font-display text-2xl text-navy">Custo do anúncio por canal</h2>
        <p className="mt-2 text-sm text-muted">É o que a empresa gastou para anunciar naquele canal, dividido por quem terminou o fluxo. Não é o investimento do piloto e não é custo por venda.</p>
        <ul className="mt-4 space-y-2">
          {channels.map((channel) => {
            const costly = channel.name === "Anúncio";
            return (
              <li key={channel.name} className={`grid gap-1 rounded-xl px-4 py-3 sm:grid-cols-[8rem_1fr_auto] sm:items-center ${costly ? "bg-navy text-surface" : "bg-mist"}`}>
                <span className="font-medium">{channel.name}</span>
                <span className={`text-sm ${costly ? "text-mist" : "text-muted"}`}>{channel.spent === 0 ? "Chegou sem anúncio" : `${reais(channel.spent)} em anúncio, ${channel.finished} terminaram`}</span>
                <span className="font-display text-xl">{costEach(channel.spent, channel.finished)}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-muted">Esses valores são gasto de anúncio. No WhatsApp, R$ 200 em anúncio dão R$ 8,33 por pessoa que termina. Nos outros anúncios, R$ 800 dão R$ 50.</p>
      </section>

      <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="font-display text-2xl text-navy">Coorte de abandono</h2>
        <p className="mt-2 text-sm text-muted">Cada linha é quem começou naquela semana. Abandono é quem não terminou na hora e não voltou na semana seguinte.</p>
        <ul className="mt-4 space-y-4">
          {weeks.map((week) => {
            const weekStarted = readCount(week.started);
            const weekFinished = readCount(week.finished);
            const weekReturned = readCount(week.returned);
            const weekOver = weekFinished + weekReturned > weekStarted && weekStarted > 0;
            const weekLeft = Math.max(0, weekStarted - weekFinished - weekReturned);
            return (
              <li key={week.id} className="rounded-xl border border-line p-4">
                <p className="font-medium text-navy">{week.name}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <label className="text-sm">
                    Começaram
                    <input value={week.started} onChange={(event) => updateWeek(week.id, "started", event.target.value)} inputMode="numeric" className="mt-1 min-h-11 w-full rounded-xl border border-line px-3" />
                  </label>
                  <label className="text-sm">
                    Terminaram na semana
                    <input value={week.finished} onChange={(event) => updateWeek(week.id, "finished", event.target.value)} inputMode="numeric" className="mt-1 min-h-11 w-full rounded-xl border border-line px-3" />
                  </label>
                  <label className="text-sm">
                    Voltaram depois
                    <input value={week.returned} onChange={(event) => updateWeek(week.id, "returned", event.target.value)} inputMode="numeric" className="mt-1 min-h-11 w-full rounded-xl border border-line px-3" />
                  </label>
                </div>
                {weekOver ? (
                  <p className="mt-3 text-sm text-warn">A soma de quem terminou e de quem voltou não pode passar de quem começou.</p>
                ) : (
                  <p className="mt-3 text-sm text-muted">Abandono desta coorte: {percent(weekLeft, weekStarted)}. Conversão: {percent(weekFinished + weekReturned, weekStarted)}.</p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="font-display text-2xl text-navy">Engajamento do dia</h2>
        <p className="mt-2 text-sm text-muted">Engajamento aqui é quem abriu o fluxo naquele dia. Não é visita no site nem curtida. O exemplo mostra a quarta, que o total da semana esconde.</p>
        <ul className="mt-4 space-y-2">
          {days.map((day) => {
            const left = day.started - day.finished;
            const bad = day.name === "Quarta";
            return (
              <li key={day.name} className={`grid gap-1 rounded-xl px-4 py-3 sm:grid-cols-[8rem_1fr_auto] sm:items-center ${bad ? "bg-navy text-surface" : "bg-mist"}`}>
                <span className="font-medium">{day.name}</span>
                <span className={`text-sm ${bad ? "text-mist" : "text-muted"}`}>{day.finished} de {day.started} terminaram</span>
                <span className="font-display text-xl">{percent(left, day.started)}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-muted">Na quarta, 10 de 50 terminaram. Abandono de 80%. Nos outros dias, o abandono fica entre 50% e 61%.</p>
      </section>
    </main>
  );
}
