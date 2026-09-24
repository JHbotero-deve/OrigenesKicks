"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartDrawer } from "@/features/products/CartDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Sparkles, ShieldCheck, User, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const { dbUser } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Vitrina", href: "/products", icon: Package },
    { name: "Mis pedidos", href: "/dashboard/orders", icon: Sparkles, authRequired: true },
    { name: "Rastrear pedido", href: "/posventa", icon: ShieldCheck },
  ];

  const visibleItems = navItems.filter((item) => !item.authRequired || Boolean(dbUser));

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="overflow-hidden whitespace-nowrap border-b border-white/10 bg-black py-2 text-[8px] font-black uppercase tracking-[0.12em] text-white sm:text-[9px]">
        <div className="mx-auto flex max-w-[1600px] justify-center gap-6 px-3 sm:gap-8">
          <span><b className="text-orange-500">●</b> Valle de Aburrá · contra-entrega</span>
          <span className="hidden sm:inline"><b className="text-green-400">●</b> Domicilio gratis desde 2 pares</span>
          <span className="hidden md:inline"><b>●</b> Compra segura</span>
        </div>
      </div>

      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 px-3 py-3 sm:px-4 lg:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-black italic text-white sm:h-10 sm:w-10 sm:text-xl">OK</div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black italic tracking-tighter sm:text-xl">ORÍGENES<span className="text-orange-600">KICKS</span></h1>
              <p className="hidden text-[8px] font-bold uppercase tracking-widest text-gray-400 sm:block">Medellín · Skate & Streetwear</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-gray-100 bg-gray-50 p-1 lg:flex">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return <Link key={item.href} href={item.href} className={"flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase italic " + (active ? "bg-black text-white" : "text-gray-500 hover:bg-white hover:text-black")}>
                <Icon size={14} className={active ? "text-orange-500" : ""}/>{item.name}
              </Link>;
            })}
          </div>

          <div className="flex items-center gap-2">
            <CartDrawer />
            <Link href="/dashboard" className="hidden items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-[10px] font-black uppercase text-gray-800 hover:bg-orange-50 sm:flex">
              <User size={17} className="text-orange-600"/> Panel
            </Link>
            <button type="button" onClick={() => setOpen(true)} className="rounded-2xl border border-gray-200 bg-white p-2.5 lg:hidden" aria-label="Abrir menú">
              <Menu size={20}/>
            </button>
          </div>
        </div>

        {open && <div className="border-t border-gray-100 bg-white p-3 shadow-lg lg:hidden">
          <div className="grid gap-2">
            {visibleItems.map((item) => { const Icon=item.icon; return <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-xs font-black uppercase italic text-gray-800"><Icon size={17} className="text-orange-600"/>{item.name}</Link>; })}
            <Link href="/dashboard" onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-2xl bg-black px-4 py-3 text-xs font-black uppercase italic text-white"><User size={17} className="text-orange-500"/> Panel</Link>
            <button type="button" onClick={()=>setOpen(false)} className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-xs font-black uppercase"><X size={16}/> Cerrar</button>
          </div>
        </div>}
      </nav>
    </header>
  );
};
