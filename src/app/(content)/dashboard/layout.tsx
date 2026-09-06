import { AdminSidebar } from "@/components/layout/AdminSidebar";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  const isStaff = dbUser?.role === 'ADMIN' || dbUser?.role === 'SELLER';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isStaff && <AdminSidebar />}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
