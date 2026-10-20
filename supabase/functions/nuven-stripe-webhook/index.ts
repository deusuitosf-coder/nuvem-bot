import { createClient } from "npm:@supabase/supabase-js@2.118.0";
Deno.serve(async req => {
  if (req.method !== "POST") return new Response("Use POST", { status: 405 });
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret || Deno.env.get("NUVEN_PAYMENTS_ENABLED") !== "true") return new Response("Not configured", { status: 503 });
  const raw = await req.text();
  if (raw.length > 262144) return new Response("Too large", { status: 413 });
  const parts = (req.headers.get("stripe-signature") ?? "").split(",").map(p => p.split("="));
  const timestamp = parts.find(p => p[0] === "t")?.[1] ?? "";
  if (!/^\d+$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return new Response("Invalid signature", { status: 400 });
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + "." + raw)));
  const expected = Array.from(digest, b => b.toString(16).padStart(2, "0")).join("");
  const valid = parts.filter(p => p[0] === "v1").some(p => { if (!p[1] || p[1].length !== expected.length) return false; let diff = 0; for (let i = 0; i < expected.length; i++) diff |= p[1].charCodeAt(i) ^ expected.charCodeAt(i); return diff === 0; });
  if (!valid) return new Response("Invalid signature", { status: 400 });
  try {
    const event = JSON.parse(raw);
    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") return new Response("Ignored");
    const session = event.data.object;
    if (session.payment_status !== "paid") return new Response("Pending");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: quote, error } = await admin.from("nuven_quote_requests").select("*").eq("id", session.metadata?.quote_id ?? "").single();
    if (error || !quote || quote.owner_id !== session.metadata?.owner_id || quote.service !== "simples" || quote.complexity !== "padrao" || session.currency !== "brl" || session.amount_total !== quote.units * 10000) return new Response("Invalid order", { status: 400 });
    const result = await admin.from("nuven_quote_requests").update({ state: "paid" }).eq("id", quote.id);
    return new Response(result.error ? "Retry" : "OK", { status: result.error ? 500 : 200 });
  } catch { return new Response("Invalid event", { status: 400 }); }
});
