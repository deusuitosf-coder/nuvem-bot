export const rotasCertas = ["/", "/nuvem", "/apresentacao", "/medicao", "/simulador", "/versoes"] as const;

export function rotaCerta(path: string) {
  const clean = path.split("?")[0].replace(/\/$/, "") || "/";
  return (rotasCertas as readonly string[]).includes(clean);
}
