import { messageAllowed } from "./guardrails.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEAK = /stack|sql|token|secret|exception|undefined|typeerror|syntax/i;

export const SAFE_EMAIL_ERROR = "Digite um e-mail válido para continuar.";

export function validateEmail(raw: string): { ok: true } | { ok: false; message: string } {
  const value = raw.trim();
  if (!EMAIL.test(value)) return { ok: false, message: SAFE_EMAIL_ERROR };
  return { ok: true };
}

export function isPublicMessage(message: string) {
  return message.length > 0 && message.length < 120 && !LEAK.test(message) && messageAllowed(message);
}

export type CheckResult = { name: string; ok: boolean; detail: string };

export function logicChecks(): CheckResult[] {
  const empty = validateEmail("   ");
  const bad = validateEmail("marina");
  const good = validateEmail(" marina@empresa.com ");
  return [
    {
      name: "E-mail vazio é recusado",
      ok: !empty.ok && empty.message === SAFE_EMAIL_ERROR,
      detail: empty.ok ? "aceitou vazio" : empty.message,
    },
    {
      name: "E-mail sem domínio é recusado",
      ok: !bad.ok,
      detail: bad.ok ? "aceitou inválido" : bad.message,
    },
    {
      name: "E-mail válido passa",
      ok: good.ok === true,
      detail: good.ok ? "ok" : good.message,
    },
    {
      name: "Mensagem de erro não vaza detalhe técnico",
      ok: !empty.ok && isPublicMessage(empty.message),
      detail: empty.ok ? "sem mensagem" : empty.message,
    },
  ];
}
