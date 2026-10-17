export type DemoVersion = {
  id: string;
  title: string;
  state: "atual" | "complemento" | "arquivada";
  place: string;
  note: string;
};

export const demoVersions: DemoVersion[] = [
  {
    id: "3",
    title: "PrimeiraVolta",
    state: "atual",
    place: "A demo das duas telas e a apresentação de 8 telas",
    note: "É esta que você publica. A empresa vê só esta.",
  },
  {
    id: "email",
    title: "E-mail de carrinho",
    state: "complemento",
    place: "Pasta escrita, não é uma tela da demo",
    note: "R$ 1.900, no mesmo fluxo, fora do piloto.",
  },
  {
    id: "1",
    title: "Camaleão",
    state: "arquivada",
    place: "Arquivo antigo",
    note: "Não publique e não apresente. O nome já é de outra empresa.",
  },
];

export const currentVersion = demoVersions[0];
