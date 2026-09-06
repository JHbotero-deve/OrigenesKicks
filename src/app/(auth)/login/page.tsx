"use client";

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  ChevronLeft,
  ArrowRight,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

type LoginStep = 'onboarding' | 'selection' | 'form' | 'verification';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('onboarding');
  const [role, setRole] = useState<'CLIENT' | 'STAFF' | 'OWNER'>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Manejo de PIN (OTP Style)
  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'OWNER') {
      setStep('verification');
      return;
    }
    // Proceso de Login para Staff/Client
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) router.push('/dashboard');
    else alert("Credenciales incorrectas para el equipo.");
  };

  const verifyOwner = async () => {
    const finalPin = pin.join('');
    if (finalPin === '2026') {
      const { error } = await supabase.auth.signInWithPassword({
        email: email || 'admin@origeneskicks.com',
        password: 'masterPassword123'
      });
      if (!error) router.push('/dashboard');
      else alert("Identidad no reconocida por AnalizisEstudio.");
    } else {
      alert("PIN Maestro incorrecto.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 selection:bg-orange-500 font-sans">
      <div className="w-full max-w-[400px] h-[800px] bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden relative border-[8px] border-black">

        {/* TOP BAR SIMULATION */}
        <div className="h-10 w-full flex justify-between items-center px-8 pt-4">
          <span className="text-[10px] font-black">9:41</span>
          <div className="flex gap-1">
             <div className="w-4 h-2 bg-black rounded-full opacity-20"></div>
             <div className="w-4 h-2 bg-black rounded-full"></div>
          </div>
        </div>

        {/* CONTENIDO SEGÚN EL PASO */}

        {/* 1. ONBOARDING */}
        {step === 'onboarding' && (
          <div className="h-full flex flex-col animate-in fade-in duration-700">
            <div className="flex-1 relative overflow-hidden">
               <img
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800"
                className="w-full h-full object-cover grayscale-[0.2] contrast-125"
                alt="Welcome"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
               <div className="absolute bottom-12 left-8 right-8 text-white">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-tight mb-4">
                    Orígenes<span className="text-orange-500">Kicks</span>
                  </h1>
                  <p className="text-sm font-bold text-gray-300 uppercase tracking-widest leading-relaxed mb-8">
                    La fábrica de calzado del barrio en tu bolsillo. Calidad, estilo y economía nacional.
                  </p>
                  <button
                    onClick={() => setStep('selection')}
                    className="w-full bg-orange-600 text-white p-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-2 hover:bg-orange-700 transition-all active:scale-95 shadow-xl shadow-orange-900/40"
                  >
                    Empezar Ahora <ArrowRight size={18} />
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* 2. SELECCIÓN DE ROL */}
        {step === 'selection' && (
          <div className="p-8 h-full flex flex-col animate-in slide-in-from-right-8 duration-500">
            <button onClick={() => setStep('onboarding')} className="mb-8 p-2 hover:bg-gray-100 rounded-xl w-fit transition-colors">
              <ChevronLeft />
            </button>

            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">¿Quién eres hoy?</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10 text-orange-600">Identifica tu perfil para continuar</p>

            <div className="space-y-4 flex-1">
              <button
                onClick={() => { setRole('CLIENT'); setStep('form'); }}
                className="w-full p-6 border-2 border-gray-100 rounded-3xl hover:border-black transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                  <Smartphone size={24} />
                </div>
                <div>
                  <p className="font-black uppercase italic text-sm">Soy Cliente</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Mis pedidos y vitrina</p>
                </div>
              </button>

              <button
                onClick={() => { setRole('STAFF'); setStep('form'); }}
                className="w-full p-6 border-2 border-gray-100 rounded-3xl hover:border-black transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-black uppercase italic text-sm">Soy del Equipo</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Ventas e Inventario</p>
                </div>
              </button>

              <button
                onClick={() => { setRole('OWNER'); setStep('form'); }}
                className="w-full p-6 border-2 border-gray-100 rounded-3xl hover:border-orange-500 bg-orange-50/20 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <Lock size={24} />
                </div>
                <div>
                  <p className="font-black uppercase italic text-sm text-orange-700">Soy el Dueño</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Control AnalizisEstudio</p>
                </div>
              </button>
            </div>

            <p className="text-[9px] text-center text-gray-300 font-black uppercase tracking-[0.4em] mb-4">
              AnalizisEstudio Core
            </p>
          </div>
        )}

        {/* 3. FORMULARIO DE INGRESO */}
        {step === 'form' && (
          <div className="p-8 h-full flex flex-col animate-in slide-in-from-right-8 duration-500">
            <button onClick={() => setStep('selection')} className="mb-8 p-2 hover:bg-gray-100 rounded-xl w-fit transition-colors">
              <ChevronLeft />
            </button>

            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
              {role === 'OWNER' ? 'Modo Propietario' : 'Bienvenido de vuelta'}
            </h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10">Ingresa tus credenciales seguras</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Email / Usuario</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Recordarme</span>
                 </label>
                 <button type="button" className="text-[10px] font-bold text-orange-600 uppercase hover:underline">¿Olvidaste la clave?</button>
              </div>

              <button className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase italic hover:bg-gray-800 transition-colors shadow-xl mt-8">
                {role === 'OWNER' ? 'Siguiente' : 'Ingresar'}
              </button>
            </form>

            <div className="mt-10 flex items-center gap-4">
              <div className="h-px bg-gray-100 flex-1"></div>
              <span className="text-[8px] font-black text-gray-300 uppercase">O ingresar con</span>
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
               <button className="p-4 border-2 border-gray-50 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  <span className="text-[10px] font-black uppercase italic">Google</span>
               </button>
               <button className="p-4 border-2 border-gray-50 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                  <span className="text-[10px] font-black uppercase italic">Facebook</span>
               </button>
            </div>
          </div>
        )}

        {/* 4. VERIFICACIÓN PIN (OTP STYLE) */}
        {step === 'verification' && (
          <div className="p-8 h-full flex flex-col animate-in slide-in-from-right-8 duration-500 bg-[#F2F4F7]">
            <button onClick={() => setStep('form')} className="mb-8 p-2 hover:bg-white rounded-xl w-fit transition-colors shadow-sm">
              <ChevronLeft />
            </button>

            <div className="text-center mb-12">
               <div className="w-16 h-16 bg-orange-600 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/40">
                  <ShieldCheck size={32} />
               </div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-800">Verificación</h2>
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                 Ingresa el PIN Maestro enviado a <br/><span className="text-black">{email}</span>
               </p>
            </div>

            <div className="flex justify-center gap-4 mb-12">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={pinRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-16 h-20 bg-white rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none text-center text-3xl font-black shadow-lg transition-all"
                />
              ))}
            </div>

            <Button
              onClick={verifyOwner}
              className="w-full py-8 bg-orange-600 text-white font-black uppercase italic rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all"
            >
              Confirmar Identidad
            </Button>

            <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase">
              ¿No recibiste el código? <button className="text-orange-600 hover:underline">Reenviar (00:30)</button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
