import {requireRole,ROLES_MANAGE_CATALOG} from "@/lib/auth-guard";
import {ProductEditorPro} from "@/features/dashboard/ProductEditorPro";

export default async function ProductsAdminPage(){
  const auth=await requireRole(ROLES_MANAGE_CATALOG);
  if(!auth.ok)return <main className="p-6"><h1 className="text-xl font-black">Acceso denegado</h1></main>;
  return <main className="mx-auto max-w-5xl p-6"><ProductEditorPro/></main>;
}
