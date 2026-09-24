import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["OWNER", "ADMIN", "SELLER", "DELIVERY"] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok || !auth.dbUser) redirect("/login?error=required");

  if (!STAFF_ROLES.includes(auth.dbUser.role as (typeof STAFF_ROLES)[number])) {
    redirect("/products");
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
