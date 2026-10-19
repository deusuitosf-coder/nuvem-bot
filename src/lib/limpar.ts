export const chavesAntigas = ["nuven-bot:quadro:v1", "nuvem-relatorios", "nuvem-lang"] as const;

export function limparConversas(storage: { removeItem: (key: string) => void }) {
  for (const chave of chavesAntigas) storage.removeItem(chave);
}
