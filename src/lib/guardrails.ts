const FORBIDDEN = [
  /hack/i,
  /exploit/i,
  /inject/i,
  /malicious/i,
  /bypass/i,
  /delete\s+data/i,
  /drop\s+table/i,
  /rm\s+-rf/i,
  /sudo\s+rm/i,
];

export const SAFE_FALLBACK = "Não foi possível mostrar essa mensagem.";

export function messageAllowed(text: string) {
  return text.trim().length > 0 && !FORBIDDEN.some((pattern) => pattern.test(text));
}

export function screenMessage(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!messageAllowed(clean)) return SAFE_FALLBACK;
  return clean.slice(0, 180);
}

export function plainText(value: string, max: number) {
  return value.replace(/[<>\u0000-\u001F]/g, "").slice(0, max);
}

export function decimalText(value: string, max = 4) {
  return value.replace(/[^\d.,]/g, "").slice(0, max);
}

export function savedReports(value: unknown) {
  if (!Array.isArray(value)) return [];
  const rows: { at: string; label: string }[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as { at?: unknown; label?: unknown };
    if (typeof row.at !== "string" || typeof row.label !== "string") continue;
    rows.push({ at: plainText(row.at, 40), label: plainText(row.label, 140) });
    if (rows.length === 6) break;
  }
  return rows;
}
