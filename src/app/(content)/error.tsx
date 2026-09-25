"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/layout/ErrorState";

export default function ContentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[OrigenesKicks] Error en la página:", error);
  }, [error]);

  return <ErrorState digest={error.digest} onRetry={reset} />;
}
