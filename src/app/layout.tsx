import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { verifyAppAccess } from "@/lib/analizis-guard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
// ... (metadatos actuales)
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // COMENTAMOS EL BLOQUEO TEMPORALMENTE PARA QUE PUEDAS VER EL PROYECTO
  // const security = await verifyAppAccess();
  const security = { allowed: true };

  if (!security.allowed) {
    return (
      <html lang="es">
        <body className="bg-black text-white flex items-center justify-center min-h-screen p-12 text-center">
          <div className="max-w-md border-2 border-red-600/30 p-12 rounded-[3rem] bg-red-950/10">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-red-600">Acceso Restringido</h1>
            <p className="text-gray-400 font-bold uppercase text-xs mb-8">{security.message}</p>
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Powered by AnalizisEstudio</div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5E5CE6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/analizis-factory.jpg" />
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
