"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (signUpError) {
      setError(signUpError.message || 'No se pudo crear la cuenta');
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push('/products');
      return;
    }

    setError('Cuenta creada. Revisa tu correo para confirmar la cuenta antes de ingresar.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          <span className="text-orange-600">Origenes Kick</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">
            Crea tu cuenta
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-700 ml-2">Nombre</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full pl-12 p-4 bg-gray-50 text-gray-900 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-700 ml-2">Correo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full pl-12 p-4 bg-gray-50 text-gray-900 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-12 p-4 bg-gray-50 text-gray-900 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-[11px] font-bold uppercase text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase italic hover:bg-gray-800 transition-colors shadow-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] font-bold text-gray-400 uppercase">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-orange-600 hover:underline">Ingresa</Link>
        </p>
      </div>
    </div>
  );
}
