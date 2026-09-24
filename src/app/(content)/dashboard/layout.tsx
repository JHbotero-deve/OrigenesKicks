import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["OWNER", "ADMIN", "SELLER", "DELIVERY"] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok || !auth.dbUser) {
    redirect("/login?error=required");
  }

  if (!STAFF_ROLES.includes(auth.dbUser.role as (typeof STAFF_ROLES)[number])) {
    redirect("/products");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
