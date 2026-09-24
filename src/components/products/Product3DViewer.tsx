"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  modelUrl?: string | null;
  posterUrl?: string;
  productName?: string;
  color?: string | null;
  className?: string;
}

let threePromise: Promise<any> | null = null;

function loadThree() {
  if (typeof window === "undefined") return Promise.reject(new Error("Three.js requiere navegador."));
  const win = window as any;
  if (win.THREE) return Promise.resolve(win.THREE);
  if (threePromise) return threePromise;

  threePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-origenes-three="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).THREE));
      existing.addEventListener("error", () => reject(new Error("No se pudo cargar el visor 3D.")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    script.dataset.origenesThree = "true";
    script.onload = () => (window as any).THREE ? resolve((window as any).THREE) : reject(new Error("Three.js no quedó disponible."));
    script.onerror = () => reject(new Error("No se pudo cargar el visor 3D."));
    document.head.appendChild(script);
  });
  return threePromise;
}

function roundedBox(THREE: any, width: number, height: number, depth: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: radius * 0.55,
    bevelThickness: radius * 0.45,
    curveSegments: 8,
  });
  geometry.center();
  return geometry;
}

function colorHex(color?: string | null) {
  const value = (color || "").trim().toLowerCase();
  if (value.includes("rojo") || value.includes("red")) return 0xdc2626;
  if (value.includes("azul") || value.includes("blue")) return 0x2563eb;
  if (value.includes("verde") || value.includes("green")) return 0x16a34a;
  if (value.includes("amarillo") || value.includes("yellow")) return 0xeab308;
  if (value.includes("blanco") || value.includes("white")) return 0xf3f4f6;
  if (value.includes("gris") || value.includes("gray") || value.includes("grey")) return 0x6b7280;
  if (value.includes("beige") || value.includes("crema") || value.includes("cream")) return 0xd6c7a1;
  if (value.includes("cafe") || value.includes("café") || value.includes("marron") || value.includes("marrón") || value.includes("brown")) return 0x7c4a2d;
  if (value.includes("rosado") || value.includes("rosa") || value.includes("pink")) return 0xec4899;
  if (value.includes("naranja") || value.includes("orange")) return 0xf97316;
  return 0x20242c;
}

 React.FC<Props> = ({
  modelUrl,
  posterUrl,
  productName,
  color,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<any>(null);
  const [loading, setLoading] = useState(!modelUrl);
  const [error, setError] = useState("");

  useEffect(() => {
    if (modelUrl || !canvasRef.current) return;
    let cancelled = false;

    loadThree().then((THREE) => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const width = Math.max(canvas.clientWidth, 320);
      const height = Math.max(canvas.clientHeight, 320);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf7f7f7);
      const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
      camera.position.set(0, 1.2, 7.8);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      renderer.outputEncoding = THREE.sRGBEncoding;

      scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d9d9, 2.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(4, 7, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xf97316, 1.1);
      rim.position.set(-4, 2, -5);
      scene.add(rim);

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(4.5, 64),
        new THREE.MeshStandardMaterial({ color: 0xe9e9e9, roughness: 1 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.08;
      scene.add(floor);

      const shoe = buildSneaker(THREE, color);
      shoe.rotation.y = 0.55;
      shoe.rotation.x = -0.08;
      scene.add(shoe);

      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let rotationY = 0.55;
      let rotationX = -0.08;
      let targetZoom = 7.8;
      let currentZoom = 7.8;

      const pointerDown = (e: PointerEvent) => {
        e.stopPropagation();
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
      };
      const pointerMove = (e: PointerEvent) => {
        e.stopPropagation();
        if (!dragging) return;
        rotationY += (e.clientX - lastX) * 0.012;
        rotationX += (e.clientY - lastY) * 0.008;
        rotationX = Math.max(-0.65, Math.min(0.45, rotationX));
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const pointerUp = (e?: PointerEvent) => {
        e?.stopPropagation();
        dragging = false;
        canvas.style.cursor = "grab";
      };
      const wheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        targetZoom = Math.max(5.1, Math.min(10.5, targetZoom + e.deltaY * 0.006));
      };
      const resize = () => {
        const w = Math.max(canvas.clientWidth, 320);
        const h = Math.max(canvas.clientHeight, 320);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };

      canvas.style.cursor = "grab";
      canvas.addEventListener("pointerdown", pointerDown);
      canvas.addEventListener("pointermove", pointerMove);
      canvas.addEventListener("pointerup", pointerUp);
      canvas.addEventListener("pointercancel", pointerUp);
      canvas.addEventListener("wheel", wheel, { passive: false });
      window.addEventListener("resize", resize);

      const animate = () => {
        if (cancelled) return;
        if (!dragging) rotationY += 0.0032;
        shoe.rotation.y += (rotationY - shoe.rotation.y) * 0.08;
        shoe.rotation.x += (rotationX - shoe.rotation.x) * 0.08;
        currentZoom += (targetZoom - currentZoom) * 0.08;
        camera.position.z = currentZoom;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        stateRef.current.raf = requestAnimationFrame(animate);
      };

      stateRef.current = {
        raf: 0,
        cleanup: () => {
          canvas.removeEventListener("pointerdown", pointerDown);
          canvas.removeEventListener("pointermove", pointerMove);
          canvas.removeEventListener("pointerup", pointerUp);
          canvas.removeEventListener("pointercancel", pointerUp);
          canvas.removeEventListener("wheel", wheel);
          window.removeEventListener("resize", resize);
          renderer.dispose();
          scene.traverse((object: any) => {
            object.geometry?.dispose?.();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.filter(Boolean).forEach((material: any) => material.dispose?.());
          });
        },
      };
      setLoading(false);
      animate();
    }).catch((e) => {
      console.error("Product3DViewer:", e);
      if (!cancelled) {
        setError("No se pudo cargar el visor 3D.");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (stateRef.current) {
        cancelAnimationFrame(stateRef.current.raf);
        stateRef.current.cleanup();
        stateRef.current = null;
      }
    };
  }, [modelUrl, color]);

  if (modelUrl) {
    return (
      <div className={"w-full h-[520px] lg:h-[620px] bg-white rounded-3xl overflow-hidden relative group shadow-inner " + className}>
        <model-viewer
          onClick={(event: React.MouseEvent) => event.stopPropagation()}
          src={modelUrl}
          poster={posterUrl || undefined}
          alt={"Visor 3D de " + (productName || "Calzado")}
          auto-rotate
          camera-controls
          ar
          shadow-intensity="2"
          shadow-softness="1"
          environment-image="neutral"
          exposure="1"
          touch-action="pan-y"
          style={{ width: "100%", height: "100%", backgroundColor: "transparent", cursor: "grab" }}
        >
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-black text-[11px] px-4 py-2 rounded-full font-bold uppercase tracking-widest shadow-lg border border-gray-100 italic pointer-events-none">
            Gira y explora tus Kicks en 360°
          </div>
        </model-viewer>
      </div>
    );
  }

  return (
    <div className={"w-full h-[520px] lg:h-[620px] bg-[#f7f7f7] rounded-3xl overflow-hidden relative group shadow-inner " + className}>
      <canvas ref={canvasRef} className="block h-full w-full touch-none" onClick={(event) => event.stopPropagation()} aria-label={"Modelo 3D de " + (productName || "calzado")} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f7f7f7]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cargando modelo 3D...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f7f7f7] px-8 text-center">
          <div>
            <p className="text-sm font-black text-gray-900">{error}</p>
            {posterUrl && <img src={posterUrl} alt={productName || "Calzado"} className="mx-auto mt-4 h-40 w-40 object-contain" />}
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-black px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
        Orígenes Kicks · 3D
      </div>
      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/60 bg-black/75 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md">
        Arrastra 360° · rueda para zoom
      </div>
    </div>
  );
};
export const Product3DViewer: React.FC<Props> = ({
  modelUrl,
  posterUrl,
  productName,
  color,
  className = "",
}) => {
  if (!modelUrl) {
    return (
      <div className={"w-full h-full min-h-[320px] bg-[#f7f7f7] rounded-3xl flex items-center justify-center p-8 " + className}>
        <div className="max-w-sm text-center">
          <p className="text-sm font-black uppercase tracking-widest text-gray-900">Modelo 3D no disponible</p>
          <p className="mt-2 text-xs font-medium text-gray-500">
            Este producto todavía no tiene un modelo 3D cargado. La tienda debe asociar un archivo GLB o GLTF real desde el catálogo.
          </p>
          {posterUrl && (
            <img src={posterUrl} alt={productName || "Producto"} className="mx-auto mt-5 h-40 w-40 object-contain" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={"w-full h-full min-h-[320px] bg-white rounded-3xl overflow-hidden relative shadow-inner " + className}>
      <model-viewer
        src={modelUrl}
        poster={posterUrl || undefined}
        alt={"Modelo 3D de " + (productName || "Calzado")}
        auto-rotate
        camera-controls
        shadow-intensity="2"
        shadow-softness="1"
        environment-image="neutral"
        exposure="1"
        touch-action="pan-y"
        style={{ width: "100%", height: "100%", backgroundColor: "transparent", cursor: "grab" }}
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
        Orígenes Kicks · 3D
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/60 bg-black/75 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md">
        Arrastra para girar · rueda para zoom
      </div>
    </div>
  );
};
