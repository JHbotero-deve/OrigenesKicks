import { Navbar } from "@/components/layout/Navbar";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      <Navbar />
      <main className="mx-auto w-full max-w-screen-2xl overflow-x-hidden px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
        {children}
      </main>
    </div>
  );
}