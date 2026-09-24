"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Escribe tu nombre completo.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name: cleanName },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=/dashboard` : undefined,
      },
    });

    if (authError) {
      setError(authError.message.includes("already registered")
        ? "Ese correo ya está registrado. Intenta iniciar sesión."
        : "No se pudo crear la cuenta. Verifica los datos e inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.assign("/auth/redirect");
      return;
    }

    setMessage("Cuenta creada. Revisa tu correo para confirmar la cuenta y después inicia sesión.");
    setLoading(false);
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <section className="w-full max-w-[460px] bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 sm:p-10 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Crear cuenta <span className="text-orange-600">Kicks</span>
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-600">
            Compra y consulta tus pedidos
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-black uppercase text-gray-800 ml-2">Nombre</span>
            <div className="relative mt-2">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required
                className="w-full pl-12 p-4 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-2xl border-2 border-transparent focus:border-black outline-none font-bold text-sm"
                placeholder="Tu nombre completo" />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase text-gray-800 ml-2">Correo</span>
            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required
                className="w-full pl-12 p-4 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-2xl border-2 border-transparent focus:border-black outline-none font-bold text-sm"
                placeholder="ejemplo@correo.com" />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase text-gray-800 ml-2">Contraseña</span>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password" required minLength={8}
                className="w-full pl-12 pr-12 p-4 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-2xl border-2 border-transparent focus:border-black outline-none font-bold text-sm"
                placeholder="Mínimo 8 caracteres" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-black uppercase text-gray-800 ml-2">Confirmar contraseña</span>
            <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password" required minLength={8}
              className="w-full mt-2 p-4 bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-2xl border-2 border-transparent focus:border-black outline-none font-bold text-sm"
              placeholder="Repite tu contraseña" />
          </label>

          {error && <p role="alert" className="text-red-600 text-xs font-bold text-center">{error}</p>}
          {message && <p role="status" className="text-green-700 text-xs font-bold text-center">{message}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase italic hover:bg-gray-800 transition-colors shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? "Creando cuenta..." : "Crear cuenta"} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-black text-orange-600 hover:underline">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
