"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Truck,
  History,
  Settings,
  Percent
} from 'lucide-react';

export const AdminSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Resumen Diario', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pedidos y Ventas', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Mi Inventario', href: '/dashboard/inventory', icon: Package },
    { name: 'Mis Proveedores', href: '/dashboard/providers', icon: Truck },
    { name: 'Ofertas del Barrio', href: '/dashboard/offers', icon: Percent },
    { name: 'Kardex (Auditoría)', href: '/dashboard/logs', icon: History },
    { name: 'Mi Equipo / Roles', href: '/dashboard/users', icon: Users },
  ];

  return (
    <aside className="w-64 bg-black text-white h-screen sticky top-0 flex flex-col border-r border-orange-500/30">
      <div className="p-6">
        <h2 className="text-xl font-black italic tracking-tighter text-orange-500">
          OK ADMIN <span className="text-[10px] text-white/50 not-italic font-normal uppercase tracking-widest">v1.0</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase italic transition-all ${
                isActive
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
          <p className="text-[10px] font-black text-orange-500 uppercase mb-1">Stock Alerta</p>
          <p className="text-xs text-white/70">5 productos bajos en stock</p>
        </div>
      </div>
    </aside>
  );
};
