"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Autenticación real contra Supabase. No hay PIN ni contraseña
    // especial para "el dueño": el rol se decide en la base de datos
    // (tabla User.role), nunca en el navegador.
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    window.location.assign("/auth/redirect");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Orígenes <span className="text-orange-600">Kicks</span>
          </h1>
          <p className="text-gray-900 text-[10px] font-bold uppercase tracking-widest mt-2">
            Acceso seguro
          </p>
          <p className="mt-2 text-[10px] font-medium text-gray-500">Administrador, vendedor, repartidor y cliente ingresan con sus credenciales. El rol se asigna desde el sistema.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-900 ml-2">Correo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full pl-12 p-4 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-700 ml-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 p-4 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-[11px] font-bold uppercase text-center">{error}</p>
          )}

          <div className="text-right">
            <Link href="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase italic hover:bg-gray-800 transition-colors shadow-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-8 text-center">
  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600">
    ¿No tienes cuenta?
  </p>
  <Link href="/register" className="inline-block mt-2 text-xs font-black uppercase text-orange-600 hover:underline">
    Crear cuenta de cliente
  </Link>
</div>
      </div>
    </div>
  );
}
