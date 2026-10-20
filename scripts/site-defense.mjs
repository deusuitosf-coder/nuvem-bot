export function defenseHeaders({ https = false, csp = false } = {}) {
  /** @type {Record<string, string>} */
  const headers = {
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
  };
  if (https) headers["strict-transport-security"] = "max-age=15552000";
  if (csp) {
    headers["content-security-policy"] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://grok.com",
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://vqcimzjyhpvdwsvronxw.supabase.co wss://vqcimzjyhpvdwsvronxw.supabase.co",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'self' https://grok.com https://*.grok.com https://*.grok-sandbox.com",
      ...(https ? ["upgrade-insecure-requests"] : []),
    ].join("; ");
  }
  return headers;
}

/** @param {import("http").IncomingMessage} req @param {import("http").ServerResponse} res @param {() => void} next */
function apply(req, res, next) {
  if (!res.headersSent) {
    const proto = String(req.headers["x-forwarded-proto"] ?? "");
    const headers = defenseHeaders({
      https: proto === "https",
      csp: process.env.NODE_ENV === "production",
    });
    for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  }
  next();
}

export function siteDefensePlugin() {
  return {
    name: "app-builder:site-defense",
    configureServer(/** @type {{ middlewares: { use: (fn: typeof apply) => void } }} */ server) {
      server.middlewares.use(apply);
    },
    configurePreviewServer(/** @type {{ middlewares: { use: (fn: typeof apply) => void } }} */ server) {
      server.middlewares.use(apply);
    },
  };
}
