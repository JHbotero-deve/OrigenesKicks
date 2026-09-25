"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb" }}>
        <main
          role="alert"
          style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", margin: 0 }}>Algo salió mal</h1>
          <p style={{ color: "#6b7280", fontSize: 14, maxWidth: 360, margin: 0 }}>
            No pudimos cargar Orígenes Kicks. Intenta de nuevo en unos segundos.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ background: "#000", color: "#fff", border: 0, borderRadius: 16, padding: "12px 20px", fontWeight: 900, textTransform: "uppercase", cursor: "pointer" }}
          >
            Reintentar
          </button>
          {error.digest && <p style={{ color: "#d1d5db", fontSize: 10 }}>Código: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
