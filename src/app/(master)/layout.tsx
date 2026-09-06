import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Aquí definimos tu correo personal como el único autorizado para el Core Panel
  const MASTER_EMAILS = ['JHbotero-deve@analizis.com', 'admin@origeneskicks.com'];

  if (!user || !MASTER_EMAILS.includes(user.email!)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0F0F12]">
      {children}
    </div>
  );
}
