import { boardFrom } from "./nuvem-bot.ts";

export type NoteColor = "navy" | "sky" | "mist" | "ok" | "warn";

export type Note = { id: string; kind: "nota"; texto: string; cor: NoteColor; x: number; y: number };
export type Caixa = { id: string; kind: "caixa"; titulo: string; x: number; y: number };
export type Seta = { id: string; kind: "seta"; de: string; para: string };
export type Board = { notes: Note[]; boxes: Caixa[]; arrows: Seta[] };
export type ToolName =
  | "criar_nota"
  | "mover_nota"
  | "editar_nota"
  | "criar_caixa"
  | "criar_seta"
  | "criar_diagrama"
  | "organizar_ideias"
  | "resumir_quadro"
  | "calcular_faturamento";
export type ToolCall = { name: ToolName; args: Record<string, string | number> };

const PROBLEMS = [
  "O preço pesa para quem compara.",
  "A espera no atendimento irrita.",
  "Falta uma pessoa para falar.",
];
const COLORS: NoteColor[] = ["sky", "mist", "warn", "ok", "navy"];

export function emptyBoard(): Board {
  return { notes: [], boxes: [], arrows: [] };
}

function slot(index: number) {
  return { x: 16 + (index % 3) * 230, y: 16 + Math.floor(index / 3) * 132 };
}

function nextId(board: Board, prefix: string) {
  const used = new Set([...board.notes, ...board.boxes, ...board.arrows].map((item) => item.id));
  let index = 1;
  while (used.has(`${prefix}${index}`)) index += 1;
  return `${prefix}${index}`;
}

function findItem(board: Board, label: string) {
  const note = label.match(/nota\s*(\d+)/i);
  if (note) return board.notes[Number(note[1]) - 1]?.id;
  const box = label.match(/caixa\s*(\d+)/i);
  if (box) return board.boxes[Number(box[1]) - 1]?.id;
  const named = [...board.notes, ...board.boxes].find((item) => item.id === label || ("texto" in item && item.texto === label) || ("titulo" in item && item.titulo === label));
  return named?.id;
}

function money(raw: string) {
  if (/^\d{1,3}(\.\d{3})+$/.test(raw)) return Number(raw.replaceAll(".", ""));
  return Number(raw.replace(",", "."));
}

function reais(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function applyTool(board: Board, call: ToolCall): { board: Board; said: string } {
  if (call.name === "criar_nota") {
    const texto = String(call.args.texto ?? "").slice(0, 140);
    if (!texto) return { board, said: "A nota precisa de um texto." };
    const index = board.notes.length;
    const note: Note = {
      id: nextId(board, "nota"),
      kind: "nota",
      texto,
      cor: COLORS.includes(call.args.cor as NoteColor) ? (call.args.cor as NoteColor) : COLORS[index % COLORS.length],
      x: Number(call.args.x ?? slot(index).x),
      y: Number(call.args.y ?? slot(index).y),
    };
    return { board: { ...board, notes: [...board.notes, note] }, said: "Criei uma nota no quadro." };
  }
  if (call.name === "mover_nota") {
    const id = findItem(board, String(call.args.id ?? ""));
    if (!id) return { board, said: "Não achei a nota para mover." };
    return {
      board: { ...board, notes: board.notes.map((note) => (note.id === id ? { ...note, x: Number(call.args.x ?? note.x), y: Number(call.args.y ?? note.y) } : note)) },
      said: "Movi a nota.",
    };
  }
  if (call.name === "editar_nota") {
    const id = findItem(board, String(call.args.id ?? "nota 1"));
    const texto = String(call.args.texto ?? "").slice(0, 140);
    if (!id || !texto) return { board, said: "Não consegui editar a nota." };
    return { board: { ...board, notes: board.notes.map((note) => (note.id === id ? { ...note, texto } : note)) }, said: "Editei a nota." };
  }
  if (call.name === "criar_caixa") {
    const titulo = String(call.args.titulo ?? "Caixa").slice(0, 80);
    const index = board.notes.length + board.boxes.length;
    const caixa: Caixa = { id: nextId(board, "caixa"), kind: "caixa", titulo, x: Number(call.args.x ?? slot(index).x), y: Number(call.args.y ?? 280) };
    return { board: { ...board, boxes: [...board.boxes, caixa] }, said: "Criei uma caixa no quadro." };
  }
  if (call.name === "criar_seta") {
    const de = findItem(board, String(call.args.de ?? ""));
    const para = findItem(board, String(call.args.para ?? ""));
    if (!de || !para || de === para) return { board, said: "Não achei as duas pontas da seta." };
    const seta: Seta = { id: nextId(board, "seta"), kind: "seta", de, para };
    return { board: { ...board, arrows: [...board.arrows, seta] }, said: "Liguei os dois itens." };
  }
  if (call.name === "criar_diagrama") {
    const titulo = String(call.args.titulo ?? "Decisão").slice(0, 80);
    let next = board;
    const box = applyTool(next, { name: "criar_caixa", args: { titulo, x: 246, y: 300 } });
    next = box.board;
    PROBLEMS.forEach((texto, index) => {
      const note = applyTool(next, { name: "criar_nota", args: { texto, x: 16 + index * 230, y: 16 } });
      next = note.board;
    });
    const caixa = next.boxes[next.boxes.length - 1];
    next.notes.slice(-3).forEach((note) => {
      const arrow = applyTool(next, { name: "criar_seta", args: { de: note.id, para: caixa.id } });
      next = arrow.board;
    });
    return { board: next, said: "Montei um diagrama com três notas e uma caixa." };
  }
  if (call.name === "organizar_ideias") {
    return {
      board: {
        ...board,
        notes: board.notes.map((note, index) => ({ ...note, ...slot(index) })),
        boxes: board.boxes.map((box, index) => ({ ...box, x: 16 + (index % 3) * 230, y: 300 })),
      },
      said: board.notes.length === 0 ? "O quadro ainda não tem notas." : "Organizei as notas em colunas.",
    };
  }
  if (call.name === "resumir_quadro") {
    const lines = [...board.notes.map((note) => note.texto), ...board.boxes.map((box) => box.titulo)];
    return { board, said: lines.length === 0 ? "O quadro está vazio." : `No quadro: ${lines.join(" ")}` };
  }
  const faturamento = Number(call.args.faturamento ?? 10000);
  const clientes = Number(call.args.clientes ?? 100);
  const mudanca = Math.min(40, Math.max(0, Number(call.args.mudanca ?? 15)));
  const sensibilidade = Math.min(100, Math.max(0, Number(call.args.sensibilidade ?? 40)));
  const preco = Number(call.args.preco_medio ?? (clientes > 0 ? faturamento / clientes : 0));
  const seTodos = Math.round(faturamento * (1 + mudanca / 100));
  const conta = boardFrom({ decision: "Aumentar o preço", change: mudanca, sensitive: sensibilidade, complaint: "", rival: "" });
  const said = `${clientes} clientes, preço médio ${reais(preco)}. Se todos pagassem ${mudanca}% a mais, o faturamento iria a ${reais(seTodos)}. A conta diz ${conta.answer}: ${conta.adhesion}% aderem, ${conta.resistance}% resistem, ${conta.rejection}% rejeitam. Isso não prevê o caixa.`;
  const caixa = applyTool(board, { name: "criar_caixa", args: { titulo: `Se todos pagassem: ${reais(seTodos)}`, x: 16, y: 300 } });
  const nota = applyTool(caixa.board, { name: "criar_nota", args: { texto: `${conta.answer}. Não é previsão de caixa.`, cor: "navy", x: 16, y: 16 } });
  return { board: nota.board, said };
}

export function plan(text: string): ToolCall[] {
  const clean = text.trim();
  const many = clean.match(/(?:crie|criar)\s+(\d+)\s+notas/i);
  if (many) {
    const count = Math.min(6, Math.max(1, Number(many[1])));
    return Array.from({ length: count }, (_, index) => ({
      name: "criar_nota" as const,
      args: { texto: PROBLEMS[index % PROBLEMS.length] },
    }));
  }
  if (/faturamento|analise/i.test(clean)) {
    const billed = clean.match(/r\$\s*(\d{1,3}(?:\.\d{3})+|\d+)/i);
    const clients = clean.match(/(\d+)\s+clientes/i);
    const change = clean.match(/aumento de\s+(\d+)/i);
    const sensitive = clean.match(/sensibilidade de\s+(\d+)/i);
    return [{
      name: "calcular_faturamento",
      args: {
        faturamento: billed ? money(billed[1]) : 10000,
        clientes: clients ? Number(clients[1]) : 100,
        mudanca: change ? Number(change[1]) : 15,
        sensibilidade: sensitive ? Number(sensitive[1]) : 40,
      },
    }];
  }
  if (/organiz/i.test(clean)) return [{ name: "organizar_ideias", args: {} }];
  if (/resum/i.test(clean)) return [{ name: "resumir_quadro", args: {} }];
  if (/diagrama/i.test(clean)) {
    const title = clean.match(/diagrama(?:\s+de|\s+sobre)?\s+(.+)/i);
    return [{ name: "criar_diagrama", args: { titulo: title?.[1]?.slice(0, 80) || "Decisão" } }];
  }
  if (/seta|ligue|conecte/i.test(clean)) {
    const from = clean.match(/nota\s*\d+|caixa\s*\d+/i)?.[0] ?? "nota 1";
    const to = clean.match(/(?:para|à|a)\s+(nota\s*\d+|caixa\s*\d+)/i)?.[1] ?? "caixa 1";
    return [{ name: "criar_seta", args: { de: from, para: to } }];
  }
  if (/mova|mover/i.test(clean)) {
    const which = clean.match(/nota\s*\d+/i)?.[0] ?? "nota 1";
    return [{ name: "mover_nota", args: { id: which, x: 360, y: 24 } }];
  }
  if (/edit/i.test(clean)) {
    const which = clean.match(/nota\s*\d+/i)?.[0] ?? "nota 1";
    const texto = clean.match(/para\s+(.+)/i)?.[1] ?? "Nota editada.";
    return [{ name: "editar_nota", args: { id: which, texto } }];
  }
  if (/caixa/i.test(clean)) {
    const titulo = clean.match(/caixa\s+(.+)/i)?.[1] ?? "Decisão";
    return [{ name: "criar_caixa", args: { titulo } }];
  }
  if (/nota/i.test(clean)) {
    const texto = clean.match(/nota\s*:?\s+(.+)/i)?.[1] ?? PROBLEMS[0];
    return [{ name: "criar_nota", args: { texto } }];
  }
  return [];
}

export function runTurn(text: string, board: Board) {
  const calls = plan(text);
  if (calls.length === 0) {
    return { board, said: "Não entendi. Peça notas, um diagrama, um resumo ou a análise de um faturamento.", tools: [] as ToolName[] };
  }
  let next = board;
  const said: string[] = [];
  for (const call of calls) {
    const step = applyTool(next, call);
    next = step.board;
    said.push(step.said);
  }
  const unique = [...new Set(said)];
  return { board: next, said: unique.join(" "), tools: calls.map((call) => call.name) };
}
