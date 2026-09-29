"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, Boxes, ChevronRight, CircleDot, LayoutDashboard, Megaphone, Menu, Package, ShoppingBag, Users, X } from "lucide-react";
import { useState } from "react";

export const AdminSidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const principal = [
    { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pedidos", href: "/dashboard/orders", icon: ShoppingBag, badge: 8 },
    { name: "Productos", href: "/dashboard/products", icon: HeadphonesIcon },
    { name: "Clientes", href: "/dashboard/admin/users", icon: Users },
  ];

  const gestion = [
    { name: "Analítica", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Inventario", href: "/dashboard/inventory", icon: Boxes, badge: 3 },
    { name: "Campañas", href: "/dashboard/reports", icon: Megaphone },
  ];

  const nav = (items: typeof principal) => items.map((item) => {
    const Icon = item.icon;
    const active = pathname === item.href;
    return (
      <Link key={item.name} href={item.href} onClick={() => setOpen(false)} className={`flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm transition-colors ${active ? "border border-[#3e5b1f] bg-[#253417] font-bold text-[#f5f7fa]" : "border border-transparent text-[#8c97a8] hover:bg-[#0e121a] hover:text-[#f5f7fa]"}`}>
        <Icon size={18} strokeWidth={1.8} />
        <span className="flex-1">{item.name}</span>
        {item.badge ? <span className="flex size-[22px] items-center justify-center rounded-full bg-[#b6f23a] text-[10px] font-extrabold text-black">{item.badge}</span> : null}
      </Link>
    );
  });

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#202936] bg-[#090c12] px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full border border-[#b6f23a]"><CircleDot size={15} className="text-[#b6f23a]" /></div>
          <span className="font-['Space_Grotesk'] text-lg font-bold text-[#f5f7fa]">SONORA</span>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-[#202936] p-2 text-[#f5f7fa]" aria-label="Abrir menú"><Menu size={20} /></button>
      </div>

      {open && <button type="button" className="fixed inset-0 z-50 bg-black/60 md:hidden" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-[60] flex w-[228px] flex-col border-r border-[#202936] bg-[#090c12] px-4 py-6 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-9 items-center justify-center rounded-full border border-[#2c3747] bg-[#161d29]"><CircleDot size={16} className="text-[#b6f23a]" /></div>
          <div className="leading-none">
            <p className="font-['Space_Grotesk'] text-lg font-bold text-[#f5f7fa]">SONORA</p>
            <p className="mt-1 text-[9px] font-bold uppercase text-[#5f6978]">Commerce OS</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="ml-auto rounded-lg p-1 text-[#5f6978] md:hidden" aria-label="Cerrar menú"><X size={18} /></button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto">
          <p className="mb-2 text-[10px] font-bold uppercase text-[#5f6978]">Principal</p>
          <div className="space-y-2">{nav(principal)}</div>
          <p className="mb-2 mt-5 text-[10px] font-bold uppercase text-[#5f6978]">Gestión</p>
          <div className="space-y-2">{nav(gestion)}</div>
        </nav>

        <div className="space-y-4">
          <div className="rounded-[14px] border border-[#202936] bg-[#0e121a] p-4">
            <div className="flex h-[92px] items-center justify-center overflow-hidden rounded-[10px] bg-[radial-gradient(circle_at_50%_40%,#b6f23a_0,#27351b_24%,#111720_55%,#090c12_100%)]">
              <HeadphonesIcon size={46} strokeWidth={1.2} className="text-[#b6f23a]" />
            </div>
            <p className="mt-3 text-[10px] uppercase text-[#b6f23a]">Nuevo drop</p>
            <p className="mt-2 font-['Space_Grotesk'] text-sm text-[#f5f7fa]">AURA X1 · Neon Edition</p>
            <p className="mt-2 text-[10px] leading-[1.4] text-[#8c97a8]">Ventas anticipadas abiertas</p>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-[34px] items-center justify-center rounded-full bg-[#211d3d] text-xs font-extrabold text-[#8d78ff]">AM</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-[#f5f7fa]">Administrador</p>
              <p className="truncate text-[10px] text-[#5f6978]">Orígenes Kicks</p>
            </div>
            <ChevronRight size={16} className="text-[#5f6978]" />
          </div>
        </div>
      </aside>
    </>
  );
};

function HeadphonesIcon({ size = 24, strokeWidth = 2, className = "" }: { size?: number; strokeWidth?: number; className?: string }) {
  return <Package size={size} strokeWidth={strokeWidth} className={className} />;
}
