"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Key, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);
  const [ownerData, setOwnerData] = useState({ email: '', pin: '' });

  const handleOwnerVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí el sistema valida contra la tabla AppLicense que creamos
    // Por seguridad AnalizisEstudio, simulamos el éxito si el PIN es correcto
    if (ownerData.pin === '2026') { // PIN de ejemplo que tú le das
       // Proceso de Login Real
       const { error } = await supabase.auth.signInWithPassword({
         email: ownerData.email,
         password: 'masterPassword123'
       });
       if (!error) router.push('/dashboard');
       else alert("Identidad no reconocida por el núcleo AnalizisEstudio");
    } else {
      alert("PIN Maestro Incorrecto. Acceso bloqueado.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 selection:bg-orange-500">
      <div className="w-full max-w-md">
        {/* Logo de la Marca (SaaS) */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-2">Orígenes Kicks</h1>
          <div className="h-1 w-20 bg-orange-600 mx-auto"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="p-10">
            {!showOwnerLogin ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-800">Acceso al Sistema</h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Ingresa para gestionar tu negocio</p>
                </div>

                <form className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="Tu clave secreta"
                      className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <button className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase italic hover:bg-gray-800 transition-colors shadow-lg">
                    Entrar a Trabajar
                  </button>
                </form>

                <div className="pt-6 border-t border-gray-100 text-center">
                   <button
                    onClick={() => setShowOwnerLogin(true)}
                    className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase italic text-orange-600 hover:text-orange-700 transition-colors"
                   >
                     <ShieldCheck size={14} /> Acceso Propietario (Verificación AnalizisEstudio)
                   </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Key size={24} />
                  </div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-800">Verificación de Identidad</h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Solo Propietarios Autorizados</p>
                </div>

                <form onSubmit={handleOwnerVerify} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Correo de Propietario"
                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-orange-100 focus:border-orange-500 outline-none transition-all font-bold text-sm"
                    onChange={(e) => setOwnerData({...ownerData, email: e.target.value})}
                    required
                  />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="PIN Maestro (4 dígitos)"
                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-orange-100 focus:border-orange-500 outline-none transition-all font-black text-center text-xl tracking-[1em]"
                    onChange={(e) => setOwnerData({...ownerData, pin: e.target.value})}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowOwnerLogin(false)}
                      className="bg-gray-100 text-gray-400 p-4 rounded-2xl font-black uppercase italic text-xs"
                    >
                      Atrás
                    </button>
                    <button className="bg-orange-600 text-white p-4 rounded-2xl font-black uppercase italic text-xs shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-all">
                      Verificar
                    </button>
                  </div>
                </form>

                <p className="text-[9px] text-gray-400 text-center font-bold uppercase leading-tight">
                  Este PIN es personal e intransferible.<br/>
                  AnalizisEstudio monitorea los accesos de seguridad.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-10 text-center text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
          Engineered by AnalizisEstudio 2026
        </p>
      </div>
    </div>
  );
}
