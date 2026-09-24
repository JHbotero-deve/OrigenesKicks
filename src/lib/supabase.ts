import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sywrurccihbunpxljcud.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_fQndGPPr7bq65EBL8N_eUg_qIza7jSX";

export function getSupabaseClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = {
  auth: {
    getSession: () => getSupabaseClient().auth.getSession(),
    getUser: () => getSupabaseClient().auth.getUser(),
    signInWithPassword: (
      credentials: Parameters<ReturnType<typeof createBrowserClient>["auth"]["signInWithPassword"]>[0]
    ) => getSupabaseClient().auth.signInWithPassword(credentials),
    signUp: (
      credentials: Parameters<ReturnType<typeof createBrowserClient>["auth"]["signUp"]>[0]
    ) => getSupabaseClient().auth.signUp(credentials),
    resetPasswordForEmail: (
      email: string,
      options?: Parameters<ReturnType<typeof createBrowserClient>["auth"]["resetPasswordForEmail"]>[1]
    ) => getSupabaseClient().auth.resetPasswordForEmail(email, options),
    updateUser: (
      attributes: Parameters<ReturnType<typeof createBrowserClient>["auth"]["updateUser"]>[0]
    ) => getSupabaseClient().auth.updateUser(attributes),
    onAuthStateChange: (
      ...args: Parameters<ReturnType<typeof createBrowserClient>["auth"]["onAuthStateChange"]>
    ) => getSupabaseClient().auth.onAuthStateChange(...args),
    signOut: () => getSupabaseClient().auth.signOut(),
  },
};
