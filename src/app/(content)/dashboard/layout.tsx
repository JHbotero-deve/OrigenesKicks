import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: dbUser, error } = await supabase
    .from("users")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();

  if (error) {
    console.error("Error verificando el acceso al dashboard:", error);
    redirect("/login?error=dashboard");
  }

  const staffRoles = ["OWNER", "ADMIN", "SELLER", "DELIVERY"];

  if (!dbUser || !staffRoles.includes(dbUser.role)) {
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
