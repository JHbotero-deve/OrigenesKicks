"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

const POST_LOGIN_URL = "/auth/redirect";

const QUERY_ERROR_MESSAGES: Record<string, string> = {
  session: "Tu sesión no está disponible. Inicia sesión para continuar.",
  required: "Debes iniciar sesión para continuar.",
  confirmation: "No pudimos confirmar tu correo. Solicita un nuevo enlace e inténtalo de nuevo.",
  system: "Tu sesión es válida, pero no pudimos abrir la información de la tienda. Inténtalo de nuevo en unos minutos.",
  dashboard: "Tu sesión es válida, pero no pudimos abrir el panel. Inténtalo de nuevo en unos minutos.",
};

function loginErrorMessage(message: string) {
  const value = message.toLowerCase();

  if (value.includes("invalid login credentials")) return "El correo o la contraseña no son correctos.";
  if (value.includes("email not confirmed")) return "Primero confirma tu correo electrónico desde el mensaje que te enviamos.";
  if (value.includes("too many requests") || value.includes("rate limit")) return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
  if (value.includes("network") || value.includes("fetch")) return "No se pudo conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.";

  return "No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const queryError = searchParams.get("error");
  const queryErrorMessage = queryError ? QUERY_ERROR_MESSAGES[queryError] ?? null : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(!queryError);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        const loggedIn = Boolean(data.session?.user);
        setHasSession(loggedIn);

        // Si llegamos aquí por un error, no redirigimos automáticamente:
        // evitaría un bucle login -> panel -> login.
        if (loggedIn && !queryError) {
          window.location.replace(POST_LOGIN_URL);
          return;
        }
        setCheckingSession(false);
      })
      .catch((sessionError) => {
        console.error("Error al comprobar la sesión:", sessionError);
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [queryError]);

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
      const { error: authError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

      if (authError) {
        setError(loginErrorMessage(authError.message));
        setLoading(false);
        return;
      }

      window.location.replace(POST_LOGIN_URL);
    } catch (loginError) {
      console.error("Error al iniciar sesión:", loginError);
      setError(loginErrorMessage(loginError instanceof Error ? loginError.message : "network"));
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setHasSession(false);
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

  const visibleError = error || queryErrorMessage;
  const inputClass =
    "w-full pl-12 p-4 bg-[#e7e2d9] text-black placeholder:text-gray-500 rounded-2xl border-2 border-[#d3cdc2] focus:border-orange-600 outline-none transition-all font-bold text-sm";

  return (
    <main className="min-h-screen bg-[#e5e0d7] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-[#f1eee7] rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.16)] p-6 sm:p-10 border-2 border-[#d8d2c7]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-balance">
            Orígenes <span className="text-orange-600">Kicks</span>
          </h1>
          <p className="text-black text-[10px] font-bold uppercase tracking-widest mt-2">Acceso seguro</p>
          <p className="mt-2 text-[11px] font-medium text-gray-700">Ingresa con el correo y la contraseña de tu cuenta.</p>
        </div>

        {hasSession && queryError && (
          <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-[#d3cdc2] bg-[#e7e2d9] p-4">
            <p className="text-[11px] font-bold text-gray-800">Ya tienes una sesión activa.</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={POST_LOGIN_URL}
                className="rounded-xl bg-black px-4 py-2 text-[11px] font-black uppercase text-white hover:bg-orange-600"
              >
                Reintentar
              </a>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border-2 border-black px-4 py-2 text-[11px] font-black uppercase text-black hover:bg-black hover:text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-[10px] font-black uppercase text-black ml-2">
              Correo
            </label>
            <div className="relative">
              <Mail aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ejemplo@correo.com"
                required
                autoComplete="email"
                inputMode="email"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-[10px] font-black uppercase text-black ml-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {visibleError && (
            <p
              role="alert"
              className="text-red-700 text-[11px] bg-red-50 border border-red-200 rounded-xl py-3 px-3 font-bold text-center"
            >
              {visibleError}
            </p>
          )}

          <div className="text-right">
            <Link href="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase italic hover:bg-orange-600 transition-colors shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"} {!loading && <ArrowRight size={16} aria-hidden />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600">¿No tienes cuenta?</p>
          <Link href="/register" className="inline-block mt-2 text-xs font-black uppercase text-orange-600 hover:underline">
            Crear cuenta de cliente
          </Link>
        </div>
      </div>
    </main>
  );
}
