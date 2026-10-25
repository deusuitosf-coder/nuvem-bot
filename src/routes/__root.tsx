import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";
import { InformationLinks } from "@/components/site-information";
import { NetworkNotice } from "@/components/network-notice";

const APP_NAME = "Nuven Bot";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0B3A66" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap",
      },
    ],
  }),
  notFoundComponent: () => <main className="mx-auto max-w-3xl px-5 py-16 text-ink"><a href="/" className="font-display text-3xl text-navy">Nuven Bot</a><p className="mt-10 text-sm tracking-widest text-sky">PÁGINA NÃO ENCONTRADA</p><h1 className="mt-4 font-display text-4xl text-navy">Vamos encontrar o caminho.</h1><p className="mt-5 leading-relaxed text-muted">Este endereço pode ter mudado ou estar incompleto. Volte ao início para acessar seus projetos e os serviços disponíveis.</p><div className="mt-8 flex flex-wrap gap-4"><a href="/" className="inline-flex min-h-12 items-center rounded-xl bg-navy px-5 text-surface">Voltar ao início</a><a href="/contato" className="inline-flex min-h-12 items-center rounded-xl border border-line px-5 text-navy">Pedir ajuda</a></div></main>,
  component: () => (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-navy focus:px-5 focus:py-3 focus:text-surface">Pular para o conteúdo</a>
          <NetworkNotice />
          <div id="conteudo" tabIndex={-1}><Outlet /></div>
          <InformationLinks />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
