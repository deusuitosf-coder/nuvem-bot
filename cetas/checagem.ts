const NOME = /(^|\/)(how[_-]?to[_-]?decrypt|readme[_-]?ransom|your[_-]?files[_-]?are[_-]?encrypted)(\.|$)/i;
const EXT = /\.(locked|encrypted|crypt|enc)$/i;
const TEXTO = new RegExp(["your files", "have been", "encrypted"].join(" "), "i");

export function sinalRansomware(path: string, text = "") {
  if (NOME.test(path) || EXT.test(path) || TEXTO.test(text)) {
    return { ok: false as const, path, motivo: "sinal de resgate" };
  }
  return { ok: true as const, path, motivo: "" };
}
