import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://sywrurccihbunpxljcud.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_fQndGPPr7bq65EBL8N_eUg_qIza7jSX";

type SupabaseCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.startsWith("/dashboard");
  const isUserApi = pathname === "/api/user";

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && (isDashboard || isUserApi)) {
    if (isUserApi) {
      return NextResponse.json({ error: "Sesión no válida" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login?error=session", request.url));
  }

  if (!user && isDashboard) {
    return NextResponse.redirect(new URL("/login?error=required", request.url));
  }

  if (!user && isUserApi) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/user"],
};
