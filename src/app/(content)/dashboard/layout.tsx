import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["OWNER", "ADMIN", "SELLER", "DELIVERY"] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAuthenticatedUser();
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  if (!auth.ok || !auth.dbUser) {
    await prisma.adminAccessLog.create({
      data: {
        email: "unknown",
        role: "UNAUTHENTICATED",
        action: "DASHBOARD_ACCESS",
        status: "UNAUTHENTICATED",
        ipAddress,
        userAgent,
      },
    }).catch(() => {});
    redirect("/login?error=required");
  }

  const isStaff = STAFF_ROLES.includes(auth.dbUser.role as (typeof STAFF_ROLES)[number]);

  await prisma.adminAccessLog.create({
    data: {
      userId: auth.dbUser.id,
      email: auth.dbUser.email,
      name: auth.dbUser.name,
      role: auth.dbUser.role,
      action: "DASHBOARD_ACCESS",
      status: isStaff ? "SUCCESS" : "FORBIDDEN",
      ipAddress,
      userAgent,
    },
  }).catch(() => {});

  if (!isStaff) redirect("/products");

  return (
    <div className="min-h-screen bg-[#07090d] text-[#f5f7fa] md:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden bg-[#07090d]">{children}</main>
    </div>
  );
}
