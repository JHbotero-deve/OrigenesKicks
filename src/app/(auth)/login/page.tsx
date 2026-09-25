import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginStatus message="Cargando..." />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginStatus({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#e5e0d7] flex items-center justify-center p-4">
      <div className="rounded-3xl bg-[#f1eee7] px-8 py-6 shadow-xl border border-[#d8d2c7]">
        <p className="text-xs font-black uppercase tracking-widest text-gray-700">{message}</p>
      </div>
    </main>
  );
}
