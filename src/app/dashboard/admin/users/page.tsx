import { requireRole, ROLES_MANAGE_CATALOG } from '@/lib/auth-guard';
import prisma from '@/lib/db';

export default async function AdminUsersPage() {
  const auth = await requireRole(ROLES_MANAGE_CATALOG);

  if (!auth.ok) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Gestión de usuarios</h1>
        <p className="mt-2 text-sm text-gray-600">No tienes permisos para consultar esta sección.</p>
      </main>
    );
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      workStore: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-black uppercase">Gestión de usuarios</h1>
        <p className="mt-1 text-sm text-gray-600">
          Consulta de usuarios, roles y tienda asignada. Las contraseñas nunca se exponen.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-bold">Nombre</th>
                <th className="px-4 py-3 font-bold">Correo</th>
                <th className="px-4 py-3 font-bold">Rol</th>
                <th className="px-4 py-3 font-bold">Tienda</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{user.workStore?.name ?? 'Sin asignar'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <p className="p-6 text-sm text-gray-500">No hay usuarios registrados.</p>
        )}
      </section>
    </main>
  );
}
