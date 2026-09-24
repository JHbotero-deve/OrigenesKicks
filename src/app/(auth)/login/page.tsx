"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";

function loginErrorMessage(message: string) {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) return "El correo o la contraseña no son correctos.";
  if (value.includes("email not confirmed")) return "Primero confirma tu correo electrónico desde el mensaje que te enviamos.";
  if (value.includes("too many requests") || value.includes("rate limit")) return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
  if (value.includes("network") || value.includes("fetch")) return "No se pudo conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.";
  return "No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const queryError = new URLSearchParams(window.location.search).get("error");
    if (queryError === "session" || queryError === "required") setError("Tu sesión no está disponible. Inicia sesión para continuar.");
    if (queryError === "system" || queryError === "dashboard") setError("La sesión es válida, pero no pudimos abrir la información de la tienda. Inténtalo de nuevo.");
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session?.user) {
        window.location.replace("/auth/redirect");
        return;
      }
      setCheckingSession(false);
    });
    return () => { active = false; };
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Escribe tu correo y contraseña.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        setError(loginErrorMessage(authError.message));
        setLoading(false);
        return;
      }

      window.location.replace("/auth/redirect");
    } catch {
      setError("No se pudo conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#e5e0d7] flex items-center justify-center p-4">
        <div className="rounded-3xl bg-[#f1eee7] px-8 py-6 shadow-xl border border-[#d8d2c7]">
          <p className="text-xs font-black uppercase tracking-widest text-gray-700">Comprobando sesión...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#e5e0d7] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-[#f1eee7] rounded-[3rem] shadow-[0_24px_60px_rgba(0,0,0,0.16)] p-8 sm:p-10 border-2 border-[#d8d2c7]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Orígenes <span className="text-orange-600">Kicks</span></h1>
          <p className="text-black text-[10px] font-bold uppercase tracking-widest mt-2">Acceso seguro</p>
          <p className="mt-2 text-[10px] font-medium text-gray-700">Ingresa con el correo y la contraseña de tu cuenta.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-black ml-2">Correo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)}
                placeholder="ejemplo@correo.com" required autoComplete="email" inputMode="email"
                className="w-full pl-12 p-4 bg-[#e7e2d9] text-black placeholder:text-gray-500 rounded-2xl border-2 border-[#d3cdc2] focus:border-orange-600 outline-none transition-all font-bold text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-black ml-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required autoComplete="current-password"
                className="w-full pl-12 pr-12 p-4 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold text-sm" />
              <button type="button" onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="text-red-700 text-[11px] bg-red-50 border border-red-200 rounded-xl py-3 px-3 font-bold text-center">{error}</p>}

          <div className="text-right">
            <Link href="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase italic hover:bg-orange-600 transition-colors shadow-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Ingresando..." : "Ingresar"} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600">¿No tienes cuenta?</p>
          <Link href="/register" className="inline-block mt-2 text-xs font-black uppercase text-orange-600 hover:underline">Crear cuenta de cliente</Link>
        </div>
      </div>
    </div>
  );
}
