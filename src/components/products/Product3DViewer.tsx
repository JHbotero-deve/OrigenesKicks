"use client";

import React, { useEffect, useRef, useState } from "react";

interface Props {
  modelUrl?: string | null;
  posterUrl?: string;
  productName?: string;
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

function buildSneaker(THREE: any) {
  const shoe = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: 0.48 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.72 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.42 });
  const lace = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.6 });

  const sole = new THREE.Mesh(roundedBox(THREE, 3.8, 0.48, 6.2, 0.22), white);
  sole.position.y = -0.8;
  shoe.add(sole);

  const midsole = new THREE.Mesh(roundedBox(THREE, 3.48, 0.38, 5.8, 0.18), orange);
  midsole.position.y = -0.48;
  shoe.add(midsole);

  const upper = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), dark);
  upper.scale.set(1.72, 0.78, 2.55);
  upper.position.set(0, 0.05, 0.05);
  shoe.add(upper);

  const toe = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), dark);
  toe.scale.set(1.58, 0.62, 1.25);
  toe.position.set(0, -0.02, 1.88);
  shoe.add(toe);

  const heel = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), dark);
  heel.scale.set(1.55, 0.72, 1.08);
  heel.position.set(0, 0.12, -1.8);
  shoe.add(heel);

  const tongue = new THREE.Mesh(roundedBox(THREE, 1.45, 0.16, 2.2, 0.08), orange);
  tongue.position.set(0, 0.72, 0.45);
  tongue.rotation.x = -0.25;
  shoe.add(tongue);

  for (let i = 0; i < 5; i += 1) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.18, 10), lace);
    l.rotation.z = Math.PI / 2;
    l.position.set(0, 0.67 - i * 0.09, 0.05 + i * 0.42);
    shoe.add(l);
  }

  const stripe = new THREE.Mesh(roundedBox(THREE, 0.14, 0.58, 3.1, 0.06), orange);
  stripe.position.set(1.45, 0.18, -0.05);
  stripe.rotation.z = -0.2;
  shoe.add(stripe);

  const heelTab = new THREE.Mesh(roundedBox(THREE, 0.18, 0.72, 1.05, 0.07), orange);
  heelTab.position.set(0, 0.28, -2.35);
  shoe.add(heelTab);

  shoe.scale.setScalar(1.05);
  return shoe;
}

export const Product3DViewer: React.FC<Props> = ({
  modelUrl,
  posterUrl,
  productName,
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

      const shoe = buildSneaker(THREE);
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
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
      };
      const pointerMove = (e: PointerEvent) => {
        if (!dragging) return;
        rotationY += (e.clientX - lastX) * 0.012;
        rotationX += (e.clientY - lastY) * 0.008;
        rotationX = Math.max(-0.65, Math.min(0.45, rotationX));
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const pointerUp = () => {
        dragging = false;
        canvas.style.cursor = "grab";
      };
      const wheel = (e: WheelEvent) => {
        e.preventDefault();
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
  }, [modelUrl]);

  if (modelUrl) {
    return (
      <div className={"w-full h-[520px] lg:h-[620px] bg-white rounded-3xl overflow-hidden relative group shadow-inner " + className}>
        <model-viewer
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
      <canvas ref={canvasRef} className="block h-full w-full touch-none" aria-label={"Modelo 3D de " + (productName || "calzado")} />
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
