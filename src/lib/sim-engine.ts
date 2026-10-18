export type Stance = "adere" | "resiste" | "rejeita";

export type GroupId =
  | "fiel"
  | "sensivel"
  | "ocasional"
  | "insatisfeito"
  | "influenciador"
  | "compara"
  | "humano";

export type SectorId = "mercado" | "comunicacao" | "atendimento" | "lancamento" | "saude";

export type SimInput = {
  decision: string;
  change: number;
  sensitive: number;
  complaint: string;
  rival: string;
  sector?: SectorId;
};

export type RoundCount = { adere: number; resiste: number; rejeita: number };

export type SimResult = {
  agents: number;
  rounds: number;
  adhesion: number;
  resistance: number;
  rejection: number;
  startAdhesion: number;
  startRejection: number;
  lines: { name: string; line: string }[];
  feed: { round: number; adhesion: number; posts: { name: string; line: string }[] }[];
};

const AGENTS = 1000;
const ROUNDS = 4;
const ORDER: Stance[] = ["rejeita", "resiste", "adere"];
const OTHERS: [GroupId, number][] = [
  ["fiel", 22],
  ["ocasional", 16],
  ["insatisfeito", 12],
  ["influenciador", 10],
  ["compara", 14],
  ["humano", 12],
];

const NAMES: Record<GroupId, string> = {
  fiel: "Fiel",
  sensivel: "Sensível",
  ocasional: "Ocasional",
  insatisfeito: "Insatisfeito",
  influenciador: "Influenciador",
  compara: "Compara",
  humano: "Humano",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function seats(sensitive: number): GroupId[] {
  const feel = clamp(sensitive, 0, 100);
  const sensitiveCount = Math.round((AGENTS * feel) / 100);
  const rest = AGENTS - sensitiveCount;
  const weight = OTHERS.reduce((sum, [, share]) => sum + share, 0);
  const rows = OTHERS.map(([id, share]) => {
    const exact = (rest * share) / weight;
    return { id, count: Math.floor(exact), frac: exact - Math.floor(exact) };
  });
  let left = rest - rows.reduce((sum, row) => sum + row.count, 0);
  for (const row of [...rows].sort((a, b) => b.frac - a.frac)) {
    if (left <= 0) break;
    row.count += 1;
    left -= 1;
  }
  const ids: GroupId[] = Array.from({ length: sensitiveCount }, () => "sensivel");
  for (const row of rows) {
    for (let i = 0; i < row.count; i += 1) ids.push(row.id);
  }
  return ids;
}

function opening(id: GroupId, move: number, decision: string, complaint: string, rival: string): Stance {
  if (id === "fiel") return move > 25 ? "resiste" : "adere";
  if (id === "sensivel") return move >= 20 ? "rejeita" : move >= 8 ? "resiste" : "adere";
  if (id === "ocasional") return move >= 20 ? "resiste" : "adere";
  if (id === "insatisfeito") return complaint ? "rejeita" : "resiste";
  if (id === "influenciador") return "resiste";
  if (id === "compara") return rival && move >= 10 ? "rejeita" : "resiste";
  return decision === "Trocar o atendimento" ? "rejeita" : "adere";
}

function tally(stances: Stance[]): RoundCount {
  return {
    adere: stances.filter((stance) => stance === "adere").length,
    resiste: stances.filter((stance) => stance === "resiste").length,
    rejeita: stances.filter((stance) => stance === "rejeita").length,
  };
}

function majority(count: RoundCount): Stance {
  if (count.rejeita >= count.adere && count.rejeita >= count.resiste) return "rejeita";
  if (count.resiste >= count.adere && count.resiste >= count.rejeita) return "resiste";
  return "adere";
}

function firm(id: GroupId, stance: Stance, move: number, decision: string) {
  if (id === "sensivel" && stance === "rejeita" && move >= 18) return true;
  if (id === "fiel" && stance === "adere" && move <= 20) return true;
  if (id === "humano" && decision === "Trocar o atendimento") return true;
  return false;
}

function step(current: Stance, target: Stance): Stance {
  const from = ORDER.indexOf(current);
  const to = ORDER.indexOf(target);
  if (from === to) return current;
  return ORDER[from + Math.sign(to - from)];
}

function shares(count: RoundCount) {
  const total = count.adere + count.resiste + count.rejeita || 1;
  const raw = [
    { key: "adhesion" as const, exact: (count.adere * 100) / total },
    { key: "resistance" as const, exact: (count.resiste * 100) / total },
    { key: "rejection" as const, exact: (count.rejeita * 100) / total },
  ].map((row) => ({ ...row, count: Math.floor(row.exact), frac: row.exact - Math.floor(row.exact) }));
  let left = 100 - raw.reduce((sum, row) => sum + row.count, 0);
  for (const row of [...raw].sort((a, b) => b.frac - a.frac || b.exact - a.exact)) {
    if (left <= 0) break;
    row.count += 1;
    left -= 1;
  }
  return {
    adhesion: raw.find((row) => row.key === "adhesion")?.count ?? 0,
    resistance: raw.find((row) => row.key === "resistance")?.count ?? 0,
    rejection: raw.find((row) => row.key === "rejection")?.count ?? 0,
  };
}

function line(id: GroupId, stance: Stance, complaint: string, rival: string) {
  if (id === "insatisfeito" && complaint) return `Continua o problema: ${complaint}.`;
  if (id === "compara" && rival) return `Vou olhar ${rival}.`;
  const text: Record<GroupId, Record<Stance, string>> = {
    fiel: { adere: "Eu fico e posso indicar.", resiste: "Eu fico, mas não indico.", rejeita: "Eu saio." },
    sensivel: { adere: "O preço ainda cabe.", resiste: "Ficou apertado.", rejeita: "Ficou caro para mim." },
    ocasional: { adere: "Posso voltar se for simples.", resiste: "Agora não volto.", rejeita: "Não volto." },
    insatisfeito: { adere: "Se resolverem, eu fico.", resiste: "A reclamação antiga continua.", rejeita: "A reclamação antiga continua." },
    influenciador: { adere: "Vou espalhar que vale a pena.", resiste: "Vou espalhar a dúvida.", rejeita: "Vou espalhar a resistência." },
    compara: { adere: "Ainda é melhor aqui.", resiste: "Vou comparar com o outro.", rejeita: "O outro ficou melhor." },
    humano: { adere: "Se precisar, quero uma pessoa.", resiste: "Se precisar, quero uma pessoa.", rejeita: "Sumiu alguém para falar." },
  };
  return text[id][stance];
}

function spoken(id: GroupId, stance: Stance, complaint: string, rival: string, sector?: SectorId) {
  const speech: Record<SectorId, Record<Stance, string>> = {
    mercado: { adere: "Mantenho a posição.", resiste: "Reduzo a posição.", rejeita: "Saio do ativo." },
    comunicacao: { adere: "A mensagem passa.", resiste: "A mensagem gera dúvida.", rejeita: "A mensagem gera rejeição." },
    atendimento: { adere: "Eu aceito o novo atendimento.", resiste: "Eu quero o atendimento de antes.", rejeita: "Eu saio se mudar o atendimento." },
    lancamento: { adere: "Eu experimento.", resiste: "Eu espero para ver.", rejeita: "Eu não compro." },
    saude: { adere: "Eu sigo a orientação.", resiste: "Eu adio.", rejeita: "Eu não sigo." },
  };
  if (sector) {
    const sentence = speech[sector][stance];
    return id === "influenciador" ? `Vou espalhar: ${sentence}` : sentence;
  }
  return line(id, stance, complaint, rival);
}

function namesFor(sector?: SectorId): Record<GroupId, string> {
  if (sector === "mercado") return { fiel: "Conservador", sensivel: "Sensível", ocasional: "Ocasional", insatisfeito: "Insatisfeito", influenciador: "Formador", compara: "Compara", humano: "Mesa" };
  if (sector === "comunicacao") return { fiel: "Fiel", sensivel: "Consumidor", ocasional: "Ocasional", insatisfeito: "Irritado", influenciador: "Formador", compara: "Mídia", humano: "Pessoa" };
  if (sector === "atendimento") return { fiel: "Fiel", sensivel: "Apressado", ocasional: "Ocasional", insatisfeito: "Irritado", influenciador: "Espalha", compara: "Compara", humano: "Pessoa" };
  if (sector === "lancamento") return { fiel: "Fiel", sensivel: "Sensível", ocasional: "Curioso", insatisfeito: "Frustrado", influenciador: "Espalha", compara: "Compara", humano: "Pessoa" };
  if (sector === "saude") return { fiel: "Segue", sensivel: "Sensível", ocasional: "Ocasional", insatisfeito: "Desconfia", influenciador: "Espalha", compara: "Compara", humano: "Clínico" };
  return NAMES;
}

function voices(ids: GroupId[], stances: Stance[], complaint: string, rival: string, sector?: SectorId) {
  const names = namesFor(sector);
  return (Object.keys(names) as GroupId[]).map((id) => {
    const group = stances.filter((_, index) => ids[index] === id);
    const stance = group.length > 0 ? majority(tally(group)) : "resiste";
    return { name: names[id], line: spoken(id, stance, complaint, rival, sector) };
  });
}

export function simulate(input: SimInput): SimResult {
  const move = clamp(input.change, 0, 40);
  const complaint = input.complaint.trim();
  const rival = input.rival.trim();
  const ids = seats(input.sensitive);
  let stances = ids.map((id) => opening(id, move, input.decision, complaint, rival));
  const start = tally(stances);
  const feed: SimResult["feed"] = [];

  for (let round = 0; round < ROUNDS; round += 1) {
    const mood = majority(tally(stances));
    stances = stances.map((stance, index) => {
      const id = ids[index];
      if (id === "influenciador") return mood;
      if (firm(id, stance, move, input.decision)) return stance;
      if (index % 2 !== round % 2) return stance;
      return step(stance, mood);
    });
    feed.push({ round: round + 1, adhesion: shares(tally(stances)).adhesion, posts: voices(ids, stances, complaint, rival, input.sector) });
  }

  const end = shares(tally(stances));
  const lines = voices(ids, stances, complaint, rival, input.sector);

  return {
    agents: AGENTS,
    rounds: ROUNDS,
    ...end,
    startRejection: shares(start).rejection,
    startAdhesion: shares(start).adhesion,
    lines,
    feed,
  };
}
