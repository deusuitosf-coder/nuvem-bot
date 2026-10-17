import { mkdirSync, writeFileSync } from "node:fs";
import { agentChecks, boardReport, chiefText, localPages, reportDay, reportText, siteChecks } from "../src/lib/nuvem-bot.ts";

const origin = process.env.NUVEM_ORIGIN ?? "http://127.0.0.1:8080";
const agents = agentChecks();
const sites = await siteChecks(origin, localPages);
const board = boardReport("O juro sobe 15%");
const text = `${reportText(agents, sites)}\n\n${chiefText(agents, sites, board)}`;
const day = reportDay();
mkdirSync("artifacts/Nuvem/relatorios", { recursive: true });
writeFileSync(`artifacts/Nuvem/relatorios/${day}.txt`, `${text}\n`);
console.log(text);
