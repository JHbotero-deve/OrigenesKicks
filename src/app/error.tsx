"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/layout/ErrorState";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[OrigenesKicks] Error en la aplicación:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50">
      <ErrorState digest={error.digest} onRetry={reset} />
    </main>
  );
}
