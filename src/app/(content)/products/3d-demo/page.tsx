import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Product3DViewer } from "@/components/products/Product3DViewer";

const SAMPLE_SHOE_MODEL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb";

export default function Product3DDemoPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase italic text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Volver a la vitrina
        </Link>

        <section className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div className="rounded-[3rem] border border-gray-100 bg-white p-3 shadow-sm">
            <Product3DViewer
              modelUrl={SAMPLE_SHOE_MODEL}
              productName="Zapato de demostración"
            />
          </div>

          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">
              Exhibición 3D de muestra
            </p>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-950">
              Explora el zapato en 360°
            </h1>
            <p className="mt-5 text-sm leading-7 text-gray-600">
              Gira el modelo, acércalo y arrástralo para revisar el calzado desde
              diferentes ángulos. Esta pieza es únicamente una demostración del
              visor 3D; no corresponde a un producto real del inventario.
            </p>

            <div className="mt-8 rounded-2xl bg-gray-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Controles
              </p>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-gray-700">
                <li>Arrastra para girar.</li>
                <li>Usa dos dedos para hacer zoom en móvil.</li>
                <li>En dispositivos compatibles puedes probar realidad aumentada.</li>
              </ul>
            </div>

            <p className="mt-6 text-[10px] leading-5 text-gray-400">
              Modelo de demostración “Materials Variants Shoe”, publicado por
              Khronos Group y Shopify bajo CC BY 4.0.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
