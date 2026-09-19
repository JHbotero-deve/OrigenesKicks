import { createClient } from "@supabase/supabase-js";

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno de ejecución."
    );
  }

  return { url, anonKey };
}

export function getSupabaseClient() {
  const { url, anonKey } = getConfig();
  return createClient(url, anonKey);
}

export const supabase = {
  auth: {
    getSession: () => getSupabaseClient().auth.getSession(),
    getUser: () => getSupabaseClient().auth.getUser(),
    signInWithPassword: (credentials: Parameters<ReturnType<typeof createClient>["auth"]["signInWithPassword"]>[0]) =>
      getSupabaseClient().auth.signInWithPassword(credentials),
    onAuthStateChange: (...args: Parameters<ReturnType<typeof createClient>["auth"]["onAuthStateChange"]>) =>
      getSupabaseClient().auth.onAuthStateChange(...args),
    signOut: () => getSupabaseClient().auth.signOut(),
  },
};
