"use client";

import React from 'react';
import Link from 'next/link';
import { CartDrawer } from '@/features/products/CartDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="border-b bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="text-base sm:text-xl font-black italic tracking-tighter shrink-0">
          ORÍGENES KICKS
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <Link href="/products" className="hidden xs:block text-[10px] sm:text-sm font-medium hover:text-gray-600 uppercase tracking-widest">Vitrina</Link>

          <CartDrawer />

          {user ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="px-2 sm:px-4">
                <User className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Mi Cuenta</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="text-[10px] sm:text-sm px-3 sm:px-6">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
