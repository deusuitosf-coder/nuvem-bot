import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { cloudClient } from "@/lib/nuven-cloud";
import { CloudWorkspace } from "@/components/cloud-workspace";
import { CloudAnalysis } from "@/components/cloud-analysis";
import { CloudQuotes } from "@/components/cloud-quotes";

export function AccountAccess({ embedded = false }: { embedded?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [recovering, setRecovering] = useState(false);
  useEffect(() => {
    const client = cloudClient();
    let active = true;
    client.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setReady(true); } }).catch(() => { if (active) { setReady(true); setMessage("Não foi possível conferir a sessão. Tente entrar novamente."); } });
    const { data } = client.auth.onAuthStateChange((event, session) => { if (active) { setUser(session?.user ?? null); setReady(true); if (event === "PASSWORD_RECOVERY") setRecovering(true); if (event === "SIGNED_OUT") setRecovering(false); } });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    const syncMode = () => {
      if (window.location.hash === "#criar-conta") setMode("signup");
      else if (window.location.hash === "#entrar") setMode("login");
    };
    syncMode();
    window.addEventListener("hashchange", syncMode);
    return () => window.removeEventListener("hashchange", syncMode);
  }, []);
  const field = "mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-ink";
  return <section id="acesso" aria-label="Conta e projetos" className={embedded ? "border-b border-line py-8 font-sans text-ink" : "mx-auto max-w-5xl px-5 py-8 font-sans text-ink"}>
    {!embedded && <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6"><a href="/" className="flex items-center gap-3 font-display text-3xl text-navy"><img src="/nuven-logo.svg" alt="" width="56" height="56" />Nuven Bot</a><a href="/nuvem#quadro" className="min-h-11 content-center text-sky underline">Meu quadro local</a></header>}
    <h2 className="mt-8 font-display text-4xl text-navy">{embedded ? "Entre ou crie sua conta" : "Sua conta. Um espaço por projeto."}</h2>
    <p className="mt-4 leading-relaxed text-muted">Os projetos da conta ficam na nuvem. Suas notas anteriores continuam no quadro local; copie um backup apenas se desejar.</p>
    {!ready ? <p role="status" className="mt-6">Conferindo sessão…</p> : user ? embedded ? <div className="mt-6"><p className="text-muted">Conectado como {user.email}</p><a href="/conta" className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-navy px-5 text-surface">Abrir meus projetos</a></div> : <>
      <div className="mt-6 flex flex-wrap items-center gap-4"><p className="text-sm text-muted">Conectado como {user.email}</p><button disabled={busy} className="min-h-11 rounded-xl border border-line px-4 text-navy" onClick={async () => { setBusy(true); try {
        const { error } = await cloudClient().auth.signOut();
        setMessage(error ? "Não foi possível sair. Tente novamente." : "Sessão encerrada.");
      } catch { setMessage("Não foi possível sair. Tente novamente."); }
      finally { setBusy(false); } }}>Sair da conta</button></div>
      {recovering && <form className="mt-6 max-w-lg space-y-4 rounded-xl border border-line bg-surface p-5" onSubmit={async e => { e.preventDefault(); setBusy(true); try { const { error } = await cloudClient().auth.updateUser({ password }); if (error) throw error; setMessage("Senha alterada."); setPassword(""); setRecovering(false); } catch { setMessage("Não foi possível alterar a senha. Tente novamente."); } finally { setBusy(false); } }}><label className="block text-sm text-navy">Nova senha<input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} className={field} /></label><button disabled={busy} className="min-h-12 rounded-xl bg-navy px-5 text-surface">Salvar nova senha</button></form>}
      <CloudWorkspace key={user.id} user={user} />
      <CloudAnalysis key={"analysis-" + user.id} />
      <CloudQuotes key={"quotes-" + user.id} />
    </> : <section className="mt-8 max-w-lg rounded-2xl border border-line bg-surface p-6">
      <div className="flex gap-3"><button id="entrar" className="min-h-11 px-3 text-navy underline" aria-pressed={mode === "login"} onClick={() => { setMode("login"); setMessage(""); }}>Entrar</button><button id="criar-conta" className="min-h-11 px-3 text-navy underline" aria-pressed={mode === "signup"} onClick={() => { setMode("signup"); setMessage(""); }}>Criar conta</button></div>
      <form className="mt-4 space-y-5" onSubmit={async e => { e.preventDefault(); setBusy(true); setMessage(""); try {
        const client = cloudClient();
        const result = mode === "login" ? await client.auth.signInWithPassword({ email: email.trim(), password }) : await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: "https://www.nuvembot.net/conta" } });
        if (result.error) throw result.error;
        setPassword("");
        setMessage(mode === "signup" && !result.data.session ? "Confira seu e-mail para confirmar o cadastro. Se não receber, consulte o spam e tente mais tarde." : "Conta conectada.");
      } catch { setMessage(mode === "login" ? "Não foi possível entrar. Confira o e-mail, a senha e a confirmação do cadastro." : "Não foi possível cadastrar agora. Confira os dados ou tente mais tarde."); } finally { setBusy(false); } }}>
        <label className="block text-sm text-navy">E-mail<input className={field} type="email" autoComplete="email" maxLength={254} required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block text-sm text-navy">Senha<input className={field} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 12 : 1} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {mode === "signup" && <p className="text-sm text-muted">Use uma senha exclusiva com pelo menos 12 caracteres. O cadastro depende da confirmação do seu e-mail. Consulte os <a className="text-sky underline" href="/termos">termos de uso</a> e a <a className="text-sky underline" href="/privacidade">privacidade</a> antes de cadastrar.</p>}
        <button disabled={busy} className="min-h-12 rounded-xl bg-navy px-6 text-surface disabled:opacity-50">{busy ? "Aguarde…" : mode === "login" ? "Entrar na minha conta" : "Cadastrar e confirmar e-mail"}</button>
      </form>
      <button type="button" disabled={busy} className="mt-4 block min-h-11 text-sky underline" onClick={async () => { if (!email.trim()) { setMessage("Preencha seu e-mail para reenviar a confirmação."); return; } setBusy(true); try { const { error } = await cloudClient().auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: "https://www.nuvembot.net/conta" } }); if (error) throw error; setMessage("Se o cadastro precisar de confirmação, confira seu e-mail e o spam."); } catch { setMessage("Não foi possível reenviar agora. Aguarde e tente novamente."); } finally { setBusy(false); } }}>Reenviar confirmação de e-mail</button>
      {mode === "login" && <button type="button" disabled={busy} className="mt-4 min-h-11 text-sky underline" onClick={async () => { if (!email.trim()) { setMessage("Preencha seu e-mail para pedir a recuperação."); return; } setBusy(true); try {
        const { error } = await cloudClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: "https://www.nuvembot.net/conta" });
        if (error) throw error;
        setMessage("Se houver uma conta elegível, você receberá as instruções por e-mail. Confira também o spam.");
      } catch { setMessage("Não foi possível enviar o pedido agora. Tente novamente mais tarde."); }
      finally { setBusy(false); } }}>Esqueci minha senha</button>}
    </section>}
    {message && <p role="status" className="mt-5 rounded-xl bg-mist p-4 text-navy">{message}</p>}
  </section>;
}

