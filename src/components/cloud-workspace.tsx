import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { cloudClient } from "@/lib/nuven-cloud";
import { CloudEditor } from "@/components/cloud-editor";

type Project = { id: string; owner_id: string; title: string };
export function CloudWorkspace({ user }: { user: User }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Carregando seus projetos…");
  async function list() {
    const { data, error } = await cloudClient().from("nuvem_boards").select("id,owner_id,title").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    setProjects(data ?? []);
    setMessage(data?.length ? "" : "Crie seu primeiro projeto. Nenhuma nota local será alterada.");
  }
  useEffect(() => { list().catch(() => setMessage("Não foi possível carregar seus projetos. Tente atualizar a lista.")); }, [user.id]);
  const project = projects.find(p => p.id === selected);
  return <section className="mt-8">
    <form className="flex flex-wrap items-end gap-3" onSubmit={async e => { e.preventDefault(); setBusy(true); try {
      const { data, error } = await cloudClient().from("nuvem_boards").insert({ title: title.trim(), owner_id: user.id }).select("id,owner_id,title").single();
      if (error) throw error;
      setTitle(""); await list(); setSelected(data.id);
    } catch { setMessage("Não foi possível criar o projeto. Confira a conexão e tente novamente."); } finally { setBusy(false); } }}>
      <label className="flex-1 text-sm text-navy">Nome do novo projeto<input required minLength={1} maxLength={100} value={title} onChange={e => setTitle(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-ink" /></label>
      <button disabled={busy || !title.trim()} className="min-h-12 rounded-xl bg-navy px-5 text-surface disabled:opacity-50">Criar projeto</button>
    </form>
    <div className="mt-6 flex flex-wrap items-end gap-3"><label className="flex-1 text-sm text-navy">Projeto aberto<select aria-label="Projeto aberto" value={selected} onChange={e => setSelected(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-ink"><option value="">Selecione um projeto</option>{projects.map(p => <option value={p.id} key={p.id}>{p.title}{p.owner_id === user.id ? "" : " · compartilhado"}</option>)}</select></label><button type="button" className="min-h-12 rounded-xl border border-line px-4 text-navy" onClick={() => list().catch(() => setMessage("Não foi possível atualizar a lista."))}>Atualizar lista</button></div>
    {message && <p role="status" className="mt-4 text-sm text-muted">{message}</p>}
    {project && <CloudEditor key={user.id + project.id} project={project} user={user} />}
  </section>;
}
