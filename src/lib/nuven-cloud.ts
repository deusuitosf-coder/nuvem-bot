import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public browser key. Access is enforced by authenticated row-level policies.
export const CLOUD_URL = "https://vqcimzjyhpvdwsvronxw.supabase.co";
const PUBLIC_KEY = "sb_publishable_t8MjpjAdPPFJ4UqG_yhb-Q_ozFA3VM0";
let browserClient: SupabaseClient | undefined;
export function cloudClient() {
  if (typeof window === "undefined") throw new Error("Abra sua conta no navegador.");
  return browserClient ??= createClient(CLOUD_URL, PUBLIC_KEY, {
    auth: { storageKey: "nuven-cloud-session-v1", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}
