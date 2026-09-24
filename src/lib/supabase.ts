import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://sywrurccihbunpxljcud.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_fQndGPPr7bq65EBL8N_eUg_qIza7jSX";

const supabaseClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabase = supabaseClient;
export const getSupabaseClient = () => supabaseClient;
