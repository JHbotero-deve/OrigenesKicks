import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-guard";

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    const { authUser, dbUser } = await getSessionUser();

    if (!authUser) return NextResponse.redirect(new URL("/login?error=session", url.origin));

    const staffRoles = ["OWNER", "ADMIN", "SELLER", "DELIVERY"];
    const destination = staffRoles.includes(dbUser?.role ?? "") ? "/dashboard" : "/products";

    const response = NextResponse.redirect(new URL(destination, url.origin));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error("Error resolviendo el acceso después del login:", error);
    const response = NextResponse.redirect(new URL("/login?error=system", url.origin));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
}
