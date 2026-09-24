"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Users, History, FileText, Menu, X } from "lucide-react";

export const AdminSidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pedidos y ventas", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Productos", href: "/dashboard/products", icon: Package },
    { name: "Inventario", href: "/dashboard/inventory", icon: Package },
    { name: "Reportes", href: "/dashboard/reports", icon: FileText },
    { name: "Kardex", href: "/dashboard/logs", icon: History },
    { name: "Equipo", href: "/dashboard/admin/users", icon: Users },
  ];

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-orange-500/20 bg-black px-4 py-3 text-white md:hidden">
        <div>
          <p className="text-sm font-black italic text-orange-500">OK ADMIN</p>
          <p className="text-[8px] font-bold uppercase tracking-widest text-white/50">Panel operativo</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-white/10 p-2 text-white"
          aria-label="Abrir menú administrativo"
        >
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          aria-label="Cerrar menú administrativo"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[60] flex w-[280px] max-w-[86vw] flex-col bg-black text-white shadow-2xl transition-transform duration-200 md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 md:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-xl font-black italic tracking-tighter text-orange-500">OK ADMIN</h2>
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Panel operativo</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10 md:hidden" aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase italic transition-all ${active ? "bg-orange-500 text-black" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
            <p className="text-[10px] font-black uppercase text-orange-500">Inventario</p>
            <p className="text-xs text-white/60">Las reservas y ventas actualizan el stock real.</p>
          </div>
        </div>
      </aside>
    </>
  );
};
