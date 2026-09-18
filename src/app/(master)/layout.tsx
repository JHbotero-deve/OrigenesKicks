import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guard";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El panel maestro (licencia, control interno) es exclusivo del
  // dueño de la tienda. Antes se verificaba con una lista de correos
  // quemados en el código; ahora se verifica el rol real en la base
  // de datos, igual que el resto de la app.
  const { ok } = await requireRole(["OWNER"]);

  if (!ok) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0F0F12]">
      {children}
    </div>
  );
}
