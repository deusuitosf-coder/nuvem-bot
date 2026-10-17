import { defenseHeaders } from "../../scripts/site-defense.mjs";

interface DefenseEvent {
  url: URL;
  req: { headers: Headers };
}

export default async function siteDefenseMiddleware(
  event: DefenseEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const result = await next();
  const proto = event.req.headers.get("x-forwarded-proto") ?? event.url.protocol.replace(":", "");
  const extra = defenseHeaders({ https: proto === "https", csp: true });
  if (!(result instanceof Response)) return result;
  const headers = new Headers(result.headers);
  for (const [key, value] of Object.entries(extra)) headers.set(key, value);
  return new Response(result.body, { status: result.status, statusText: result.statusText, headers });
}
