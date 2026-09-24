"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); const [loading, setLoading] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage(""); setError("");
    const { error: resetError } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/auth/callback?next=/reset-password" });
    if (resetError) setError("No fue posible enviar el correo. Verifica el correo e inténtalo de nuevo.");
    else setMessage("Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña.");
    setLoading(false);
  };
  return <main className="min-h-screen bg-[#F8F9FA] px-4 py-8 flex items-center justify-center"><section className="w-full max-w-[420px] rounded-[2rem] border border-gray-200 bg-white p-8 shadow-xl">
    <div className="mb-8 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white"><Lock size={22}/></div><h1 className="text-2xl font-black uppercase tracking-tight text-gray-950">Recuperar contraseña</h1><p className="mt-2 text-sm text-gray-500">Te enviaremos un enlace para crear una nueva contraseña.</p></div>
    <form onSubmit={handleSubmit} className="space-y-5"><label className="block text-xs font-black uppercase tracking-wide text-gray-700">Correo<div className="relative mt-2"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-2xl border border-gray-300 bg-white py-4 pl-12 pr-4 text-sm font-semibold text-gray-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100" placeholder="ejemplo@correo.com" autoComplete="email" required/></div></label>
    {message && <p className="rounded-xl bg-green-50 p-3 text-center text-sm font-semibold text-green-700">{message}</p>}{error && <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-700">{error}</p>}
    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 p-4 font-black uppercase text-white transition hover:bg-orange-700 disabled:opacity-50">{loading ? "Enviando..." : "Enviar enlace"} {!loading && <ArrowRight size={16}/>}</button></form>
    <p className="mt-6 text-center text-sm font-semibold text-gray-600"><Link href="/login" className="text-orange-600 hover:underline">Volver al inicio de sesión</Link></p></section></main>;
}