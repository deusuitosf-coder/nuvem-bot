import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { cloudClient } from "@/lib/nuven-cloud";
import { cloudBoard, cloudChanges, cloudIdentifiers, type CloudItem } from "@/lib/cloud-board";
import { mergeBoards, parseBoard, serializeBoard } from "@/lib/quadro-storage";
import { emptyBoard, runTurn, type Board } from "@/lib/quadro";

export function CloudEditor({ project, user }: { project: { id: string; title: string; owner_id: string }; user: User }) {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [command, setCommand] = useState("");
  const [message, setMessage] = useState("Carregando este projeto…");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const active = useRef(true);
  async function read() {
    const { data, error } = await cloudClient().from("nuvem_items").select("id,board_id,data,updated_at").eq("board_id", project.id).limit(2001);
    if (error) throw error;
    const rows = (data ?? []) as CloudItem[];
    if (rows.length > 2000) throw new Error("Exporte ou separe este projeto antes de continuar.");
    const current = cloudBoard(rows);
    return { rows, current };
  }
  async function refresh() {
    const { current } = await read();
    if (active.current) { setBoard(current); setReady(true); setMessage("Projeto conectado à nuvem. Alterações recebidas automaticamente."); }
  }
  async function invitations() {
    const { data, error } = await cloudClient().from("nuvem_access").select("email").eq("board_id", project.id);
    if (!error && active.current) setMembers((data ?? []).map(r => r.email));
  }
  useEffect(() => {
    active.current = true;
    refresh().catch(() => { if (active.current) setMessage("Não foi possível carregar o projeto. Seus dados continuam na nuvem; tente atualizar."); });
    invitations();
    let timer: ReturnType<typeof setTimeout>;
    const client = cloudClient();
    const channel = client.channel("nuven-project-" + project.id).on("postgres_changes", { event: "*", schema: "public", table: "nuvem_items", filter: "board_id=eq." + project.id }, () => {
      clearTimeout(timer); timer = setTimeout(() => refresh().catch(() => { if (active.current) setMessage("A sincronização falhou. Atualize o projeto para conferir as últimas alterações."); }), 300);
    }).subscribe();
    return () => { active.current = false; clearTimeout(timer); void client.removeChannel(channel); };
  }, [project.id]);
  async function save(transform: (current: Board) => Board) {
    setBusy(true);
    try {
      const { rows, current } = await read();
      const next = cloudIdentifiers(transform(current), () => crypto.randomUUID());
      const changes = cloudChanges(current, next);
      const existing = new Map(rows.map(r => [r.id, r]));
      const inserted = changes.filter(item => !existing.has(item.id));
      if (inserted.length) {
        const { error } = await cloudClient().from("nuvem_items").insert(inserted.map(item => ({ id: item.id, board_id: project.id, data: item })));
        if (error) throw error;
      }
      for (const item of changes.filter(item => existing.has(item.id))) {
        const prior = existing.get(item.id)!;
        const { data, error } = await cloudClient().from("nuvem_items").update({ data: item, updated_at: new Date().toISOString() }).eq("id", item.id).eq("board_id", project.id).eq("updated_at", prior.updated_at).select("id");
        if (error || data?.length !== 1) throw new Error("O projeto mudou em outra sessão. Atualize e envie o comando novamente.");
      }
      await refresh(); setCommand("");
    } catch (error) {
      if (active.current) setMessage(error instanceof Error ? error.message : "Não foi possível salvar. Confira a conexão e tente novamente.");
    } finally { if (active.current) setBusy(false); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([serializeBoard(board)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "nuven-projeto-" + project.id + ".json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const action = "min-h-11 rounded-xl border border-line px-4 text-sm text-navy disabled:opacity-50";
  return <section className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-8" aria-label={"Projeto " + project.title}>
    <h2 className="font-display text-3xl text-navy">{project.title}</h2>
    <p role="status" className="mt-3 text-sm text-muted">{message}</p>
    <div className="mt-5 flex flex-wrap gap-3"><button disabled={busy} className={action} onClick={() => refresh().catch(() => setMessage("Não foi possível atualizar o projeto."))}>Atualizar projeto</button><button disabled={!ready || busy} className={action} onClick={download}>Exportar backup do projeto</button></div>
    <details className="mt-5 border-t border-line pt-4"><summary className="min-h-11 cursor-pointer text-navy">Acrescentar um backup a este projeto</summary><p className="mt-2 text-sm text-muted">O backup será copiado e acrescentado. As notas locais e as existentes no projeto serão preservadas.</p><input aria-label="Backup para copiar ao projeto" type="file" accept=".json,application/json" disabled={!ready || busy} className="mt-4 block w-full text-sm" onChange={async e => { const file = e.target.files?.[0]; e.target.value = ""; if (!file) return; try { if (file.size > 2000000) throw new Error("Backup excede 2 MB."); const incoming = parseBoard(await file.text()); await save(current => mergeBoards(current, incoming)); } catch { setMessage("Backup inválido. Nenhum conteúdo foi substituído."); } }} /></details>
    <form className="mt-6" onSubmit={e => { e.preventDefault(); if (!command.trim() || busy || !ready) return; void save(current => runTurn(command.slice(0, 400), current).board); }}>
      <label className="text-sm font-medium text-navy">Comando para este projeto<input value={command} maxLength={400} onChange={e => setCommand(e.target.value)} disabled={!ready || busy} placeholder="Crie uma nota: Próximo passo" className="mt-2 min-h-12 w-full rounded-xl border border-line bg-bg px-3 text-ink" /></label>
      <button disabled={!ready || busy || !command.trim()} className="mt-3 min-h-12 rounded-xl bg-navy px-6 text-surface disabled:opacity-50">{busy ? "Salvando…" : "Aplicar ao projeto"}</button>
    </form>
    <div role="region" aria-label="Conteúdo do projeto" className="mt-6 grid gap-4 sm:grid-cols-2">{board.notes.map(n => <article key={n.id} className="rounded-xl border border-line bg-mist p-4"><p className="text-xs text-sky">{n.id}</p><p className="mt-2 break-words whitespace-pre-wrap text-navy">{n.texto}</p></article>)}{board.boxes.map(n => <article key={n.id} className="rounded-xl border border-line p-4"><p className="text-xs text-sky">{n.id}</p><h3 className="mt-2 break-words font-medium text-navy">{n.titulo}</h3></article>)}{!board.notes.length && !board.boxes.length && <p className="text-sm text-muted">Este projeto está vazio. Adicione a primeira nota ou copie um backup.</p>}</div>
    {board.arrows.length > 0 && <section className="mt-5"><h3 className="font-medium text-navy">Conexões</h3>{board.arrows.map(a => <p key={a.id} className="mt-2 break-all text-sm text-muted">{a.de} → {a.para}</p>)}</section>}
    {project.owner_id === user.id && <section className="mt-8 border-t border-line pt-6"><h3 className="font-display text-2xl text-navy">Compartilhar este projeto</h3><p className="mt-3 text-sm text-muted">Conceda acesso de edição a um e-mail confirmado. A pessoa entra na própria conta e atualiza a lista. Nenhum e-mail é enviado automaticamente.</p>
      <form className="mt-4 flex flex-wrap gap-3" onSubmit={async e => { e.preventDefault(); setBusy(true); const { error } = await cloudClient().from("nuvem_access").insert({ board_id: project.id, owner_id: user.id, email: invite.trim().toLowerCase() }); setMessage(error ? "Não foi possível conceder acesso. Confira se o e-mail já está na lista." : "Acesso concedido ao e-mail informado."); if (!error) { setInvite(""); await invitations(); } setBusy(false); }}><label className="flex-1 text-sm text-navy">E-mail para compartilhar<input required type="email" maxLength={254} value={invite} onChange={e => setInvite(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-bg px-3 text-ink" /></label><button disabled={busy} className={action}>Conceder acesso</button></form>
      <ul className="mt-4 space-y-2">{members.map(email => <li key={email} className="flex flex-wrap items-center gap-3 text-sm text-muted"><span className="break-all">{email}</span><button disabled={busy} className={action} onClick={async () => { const { error } = await cloudClient().from("nuvem_access").delete().eq("board_id", project.id).eq("email", email); setMessage(error ? "Não foi possível retirar o acesso." : "Acesso retirado. Novas consultas exigirão permissão."); if (!error) await invitations(); }}>Retirar acesso</button></li>)}</ul>
    </section>}
  </section>;
}
