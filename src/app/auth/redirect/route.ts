import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-guard";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { authUser, dbUser } = await getSessionUser();

  if (!authUser) return NextResponse.redirect(new URL("/login?error=session", url.origin));

  const staffRoles = ["OWNER", "ADMIN", "SELLER", "DELIVERY"];
  return NextResponse.redirect(new URL(staffRoles.includes(dbUser?.role ?? "") ? "/dashboard" : "/products", url.origin));
}