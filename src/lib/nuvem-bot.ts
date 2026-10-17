import { generateProductName } from "./product-name.ts";
import { simulate } from "./sim-engine.ts";

export type Check = { name: string; ok: boolean; detail: string };

const sample = { decision: "Aumentar o preço", change: 15, sensitive: 40, complaint: "", rival: "" };

export const localPages = ["/", "/simulador", "/medicao", "/apresentacao", "/versoes", "/nuvem"];

export function agentChecks(): Check[] {
  const name = generateProductName();
  const base = simulate(sample);
  const again = simulate(sample);
  const hard = simulate({ ...sample, change: 40, sensitive: 80, complaint: "atraso", rival: "outra loja" });
  return [
    { name: "Nome", ok: name === "Virada", detail: name },
    { name: "Agentes", ok: base.agents === 1000 && base.rounds === 4, detail: `${base.agents} agentes, ${base.rounds} rodadas` },
    { name: "Conta", ok: base.adhesion + base.resistance + base.rejection === 100, detail: `${base.adhesion}% aderem, ${base.resistance}% resistem, ${base.rejection}% rejeitam` },
    { name: "Repete", ok: JSON.stringify(base) === JSON.stringify(again), detail: "o mesmo número deu o mesmo resultado" },
    { name: "Preço maior", ok: hard.rejection > base.rejection, detail: `rejeição de ${base.rejection}% para ${hard.rejection}%` },
    { name: "Grupos", ok: base.lines.length === 7, detail: `${base.lines.length} grupos falam` },
  ];
}

export async function siteChecks(origin: string, paths = localPages): Promise<Check[]> {
  const checks: Check[] = [];
  for (const path of paths) {
    try {
      const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(4000) });
      checks.push({ name: path, ok: response.ok, detail: `resposta ${response.status}` });
    } catch {
      checks.push({ name: path, ok: false, detail: "não respondeu" });
    }
  }
  return checks;
}

export function swarmGrid(agents: Check[], sites: Check[]) {
  const jobs: Record<string, string> = {
    Nome: "Vê se a decisão ainda se chama Virada.",
    Agentes: "Conta as rodadas da decisão.",
    Conta: "Vê se a conta fecha em 100.",
    Repete: "Repete a mesma decisão.",
    "Preço maior": "Vê se um preço maior rejeita mais.",
    Grupos: "Vê se os grupos da decisão falam.",
  };
  const pages: Record<string, string> = {
    "/": "Início",
    "/simulador": "Simulador",
    "/medicao": "Medição",
    "/apresentacao": "Apresentação",
    "/versoes": "Versões",
    "/nuvem": "Enxame",
  };
  return [
    ...agents.map((check) => ({
      name: check.name === "Agentes" ? "Rodada" : check.name === "Preço maior" ? "Preço" : check.name === "Repete" ? "Eco" : check.name,
      job: jobs[check.name] ?? "Confere a Virada.",
      ok: check.ok,
      line: check.detail,
    })),
    ...sites.map((check) => ({ name: pages[check.name] ?? check.name, job: `Vê se ${check.name} responde.`, ok: check.ok, line: check.detail })),
  ];
}

export const sectors = [
  { id: "mercado", name: "Mercado", seed: "O juro sobe 15%." },
  { id: "comunicacao", name: "Comunicação", seed: "A nota sai hoje, com tom duro." },
  { id: "politica", name: "Política", seed: "A nova regra muda 15% do custo." },
  { id: "lancamento", name: "Lançamento", seed: "O produto chega 15% mais caro." },
  { id: "saude", name: "Saúde", seed: "A campanha pede uma mudança de 15%." },
] as const;

export function readSeed(text: string) {
  const found = text.match(/\d+/);
  const change = Math.min(40, Math.max(0, Number(found?.[0] ?? 15)));
  const decision = /assinatura/i.test(text)
    ? "Criar uma assinatura"
    : /atendimento/i.test(text)
      ? "Trocar o atendimento"
      : /campanha/i.test(text)
        ? "Fazer uma campanha"
        : "Aumentar o preço";
  return { decision, change, sensitive: 40, complaint: "", rival: "" };
}

export function seedGraph(text: string, memories: { name: string; line: string }[]) {
  const input = readSeed(text);
  const nodes = [
    { id: "cenario", label: "Cenário", kind: "cenário", memory: text.trim().slice(0, 120) },
    { id: "decisao", label: input.decision, kind: "decisão", memory: `Mudança de ${input.change}%.` },
    { id: "numero", label: `${input.change}%`, kind: "número", memory: "Número lido no texto." },
    ...memories.map((item) => ({ id: item.name, label: item.name, kind: "agente", memory: item.line })),
  ];
  const leader = memories.find((item) => item.line.startsWith("Vou espalhar"))?.name ?? memories[4]?.name;
  const edges = [
    { from: "cenario", to: "decisao", label: "vira" },
    { from: "cenario", to: "numero", label: "mede" },
    ...memories.map((item) => ({ from: "decisao", to: item.name, label: "afeta" })),
    ...(leader ? memories.filter((item) => item.name !== leader).map((item) => ({ from: leader, to: item.name, label: "puxa" })) : []),
  ];
  return { nodes, edges };
}

export function boardFrom(input: { decision: string; change: number; sensitive: number; complaint: string; rival: string }) {
  const current = simulate(input);
  const steps = [0, 10, 20, 30, 40];
  const rows = [20, 40, 60, 80];
  const scenes = rows.flatMap((row) => steps.map((step) => simulate({ ...input, change: step, sensitive: row })));
  const band = [current, ...scenes].map((scene) => scene.adhesion);
  const titles = scenes.map((scene) => verdict(scene.adhesion, scene.resistance, scene.rejection));
  const risks = [
    input.decision === "Aumentar o preço" && input.change >= 10 ? "preço" : "",
    input.sensitive >= 35 ? "muitos clientes sensíveis a preço" : "",
  ].filter((risk) => risk.length > 0);
  return {
    decision: input.decision,
    change: input.change,
    answer: verdict(current.adhesion, current.resistance, current.rejection),
    adhesion: current.adhesion,
    resistance: current.resistance,
    rejection: current.rejection,
    low: Math.min(...band),
    high: Math.max(...band),
    pode: titles.filter((item) => item === "Pode fazer").length,
    espere: titles.filter((item) => item === "Espere").length,
    nao: titles.filter((item) => item === "Não faça").length,
    cuidado: titles.filter((item) => item === "Faça com cuidado").length,
    risks,
    agents: current.agents,
  };
}

export function boardReport(text: string) {
  return boardFrom(readSeed(text));
}

function verdict(adhesion: number, resistance: number, rejection: number) {
  if (rejection >= adhesion && rejection >= resistance) return "Não faça";
  if (resistance >= adhesion && resistance >= rejection) return "Espere";
  if (adhesion >= 55 && rejection <= 20) return "Pode fazer";
  return "Faça com cuidado";
}

export function reportDay(day = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(day);
}

export function reportText(agents: Check[], sites: Check[], day = new Date()) {
  const date = day.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const all = [...agents, ...sites];
  const failed = all.filter((check) => !check.ok);
  const lines = [
    `nuvem.bot — relatório de ${date}`,
    "",
    failed.length === 0 ? "Tudo certo." : `${failed.length} ponto(s) para olhar.`,
    "",
    "A Virada, conferida pelo enxame",
    ...agents.map((check) => `${check.ok ? "ok" : "olhar"} — ${check.name}: ${check.detail}`),
    "",
    "Páginas",
    ...sites.map((check) => `${check.ok ? "ok" : "olhar"} — ${check.name}: ${check.detail}`),
    "",
    "nuvem.bot é o enxame: uma grade de agentes. A Virada é a decisão. Não usa modelo de linguagem.",
  ];
  return lines.join("\n");
}

export function chiefText(
  agents: Check[],
  sites: Check[],
  board: { answer: string; adhesion: number; resistance: number; rejection: number },
  day = new Date(),
) {
  const date = day.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const failed = [...agents, ...sites].filter((check) => !check.ok);
  return [
    `Chefe — ${date}`,
    failed.length === 0 ? "Nada quebrou nas conferências." : `Para olhar: ${failed.map((check) => `${check.name} (${check.detail})`).join("; ")}.`,
    `Nesta conta: ${board.answer}. ${board.adhesion}% aderem, ${board.resistance}% resistem, ${board.rejection}% rejeitam.`,
    "Não vejo o que cada visita digitou. Isso fica no navegador dela.",
  ].join("\n");
}

export function runSir(beta = 0.3, gamma = 0.1, days = 80, population = 1000, start = 10) {
  const contact = Math.min(2, Math.max(0, beta));
  const recovery = Math.min(1, Math.max(0.01, gamma));
  let susceptible = population - start;
  let infected = start;
  let recovered = 0;
  const infectedCurve: number[] = [];
  let peak = start;
  let peakDay = 0;
  for (let day = 0; day <= days; day += 1) {
    infectedCurve.push(infected);
    if (infected > peak) {
      peak = infected;
      peakDay = day;
    }
    if (day === days) break;
    const infections = (contact * susceptible * infected) / population;
    const recoveries = recovery * infected;
    susceptible = Math.max(0, susceptible - infections);
    infected = Math.max(0, infected + infections - recoveries);
    recovered = Math.max(0, population - susceptible - infected);
    infected = Math.max(0, population - susceptible - recovered);
  }
  return { infectedCurve, peak: Math.round(peak), peakDay, recovered: Math.round(recovered), r0: contact / recovery };
}

export function bends(points: number[]) {
  if (points.length < 3) return false;
  const start = points[0] ?? 0;
  const end = points[points.length - 1] ?? 0;
  return points.some((value, index) => Math.abs(value - (start + ((end - start) * index) / (points.length - 1))) >= 1);
}
