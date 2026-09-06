"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CartDrawer } from '@/features/products/CartDrawer';
import { useAuth } from '@/contexts/AuthContext';
import {
  Package,
  Layers,
  FileText,
  Sparkles,
  ShieldCheck,
  User,
  ShoppingBag
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, dbUser } = useAuth();
  const pathname = usePathname();

  const isStaff = dbUser?.role === 'ADMIN' || dbUser?.role === 'SELLER';

  const navItems = [
    { name: 'VITRINA', href: '/products', icon: Package },
    { name: 'MIS PEDIDOS', href: '/dashboard/orders', icon: Sparkles, authRequired: true },
    { name: 'RASTREAR PEDIDO', href: '/posventa', icon: ShieldCheck },
  ];

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* 1. ANNOUNCEMENT BAR (Barra Superior) */}
      <div className="bg-black text-white text-[9px] font-black uppercase tracking-[0.15em] py-2 overflow-hidden whitespace-nowrap border-b border-white/10">
        <div className="container mx-auto px-4 flex justify-center gap-8 animate-marquee md:animate-none">
          <span className="flex items-center gap-2">
            <span className="text-orange-500">●</span> VALLE DE ABURRÁ: ENVÍO CONTRA-ENTREGA EN TU PUERTA
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-400">●</span> DOMICILIO GRATIS A PARTIR DE 2 PARES
          </span>
          <span className="flex items-center gap-2">
            <span className="text-white">●</span> FACTURA LEGAL DIAN CON CUFE
          </span>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <nav className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">

          {/* LOGO SECTION */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-xl italic border-2 border-black group-hover:bg-orange-600 transition-colors">
              OK
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black italic tracking-tighter leading-none">
                ORÍGENES<span className="text-orange-600">KICKS</span>
              </h1>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                MEDELLÍN • SKATE & STREETWEAR
              </p>
            </div>
          </Link>

          {/* NAVIGATION ITEMS (CENTER) */}
          <div className="hidden lg:flex items-center bg-gray-50 p-1.5 rounded-full border border-gray-100 gap-1">
            {navItems.map((item) => {
              if (item.staffOnly && !isStaff) return null;

              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black italic transition-all ${
                    isActive
                      ? 'bg-[#1a1a1a] text-white shadow-lg'
                      : 'text-gray-500 hover:text-black hover:bg-gray-200/50'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-orange-500' : ''} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* ACTIONS (RIGHT) */}
          <div className="flex items-center gap-3">
            {/* El CartDrawer ahora está estilizado como el botón de la imagen */}
            <div className="relative group">
               <CartDrawer />
            </div>

            <Link href="/dashboard">
              <button className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-5 py-2.5 rounded-2xl hover:bg-orange-50 hover:border-orange-200 transition-all group">
                <User size={18} className="text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase italic text-gray-800">Panel</span>
              </button>
            </Link>
          </div>

        </div>
      </nav>
    </div>
  );
};
