import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sywrurccihbunpxljcud.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_fQndGPPr7bq65EBL8N_eUg_qIza7jSX";

export async function proxy(request: NextRequest) {
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isUserApi = request.nextUrl.pathname === "/api/user";
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) { return request.cookies.get(name)?.value; },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && isDashboard) return NextResponse.redirect(new URL("/login", request.url));
  if (!user && isUserApi) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/user"],
};