"use client";

fix/production-auth-products
import React,{useState} from "react";
import {createProduct} from "@/lib/actions/products";
import {Button} from "@/components/ui/Button";

const sizes=["35","36","37","38","39","40","41","42","43","44","45"];

export function ProductEditorPro(){
  const [name,setName]=useState(""),[description,setDescription]=useState(""),[basePrice,setBasePrice]=useState(""),[discountPrice,setDiscountPrice]=useState(""),[category,setCategory]=useState(""),[gender,setGender]=useState("UNISEX"),[usage,setUsage]=useState("DIARIO"),[imageUrl,setImageUrl]=useState(""),[model3dUrl,setModel3dUrl]=useState(""),[sku,setSku]=useState(""),[taxRate,setTaxRate]=useState("19"),[variants,setVariants]=useState([{size:"40",color:"",stock:"0"}]),[message,setMessage]=useState(""),[loading,setLoading]=useState(false);
  const updateVariant=(i:number,key:"size"|"color"|"stock",value:string)=>setVariants(v=>v.map((x,n)=>n===i?{...x,[key]:value}:x));
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setMessage("");const result=await createProduct({name,description,basePrice:Number(basePrice),discountPrice:discountPrice?Number(discountPrice):null,category,gender,usage,imageUrl,model3dUrl,sku,taxRate:Number(taxRate),variants:variants.map(v=>({size:v.size,color:v.color,stock:Number(v.stock)}))});if(result.success){setMessage("Producto creado correctamente.");setName("");setDescription("");setBasePrice("");setDiscountPrice("");setCategory("");setImageUrl("");setModel3dUrl("");setSku("");setVariants([{size:"40",color:"",stock:"0"}]);}else setMessage(result.error||"No se pudo crear el producto.");setLoading(false);};
  return <form onSubmit={submit} className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div><h1 className="text-2xl font-black uppercase italic">Nuevo producto</h1><p className="text-sm text-gray-500">Crea el producto y sus tallas directamente en la base de datos.</p></div>
    <div className="grid gap-4 md:grid-cols-2">
      <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre del producto" className="rounded-xl border p-3"/>
      <input value={sku} onChange={e=>setSku(e.target.value)} placeholder="SKU general" className="rounded-xl border p-3"/>
      <input required type="number" min="1" value={basePrice} onChange={e=>setBasePrice(e.target.value)} placeholder="Precio base" className="rounded-xl border p-3"/>
      <input type="number" min="1" value={discountPrice} onChange={e=>setDiscountPrice(e.target.value)} placeholder="Precio oferta (opcional)" className="rounded-xl border p-3"/>
      <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Categoría" className="rounded-xl border p-3"/>
      <input type="number" min="0" max="100" value={taxRate} onChange={e=>setTaxRate(e.target.value)} placeholder="IVA %" className="rounded-xl border p-3"/>
      <select value={gender} onChange={e=>setGender(e.target.value)} className="rounded-xl border p-3"><option value="UNISEX">Unisex</option><option value="HOMBRE">Hombre</option><option value="MUJER">Mujer</option></select>
      <select value={usage} onChange={e=>setUsage(e.target.value)} className="rounded-xl border p-3"><option value="DIARIO">Diario</option><option value="DEPORTE">Deporte</option><option value="URBANO">Urbano</option><option value="TRABAJO">Trabajo</option></select>
      <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="URL de imagen" className="rounded-xl border p-3 md:col-span-2"/>
      <input value={model3dUrl} onChange={e=>setModel3dUrl(e.target.value)} placeholder="URL modelo 3D .glb (opcional)" className="rounded-xl border p-3 md:col-span-2"/>
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Descripción" className="min-h-24 rounded-xl border p-3 md:col-span-2"/>
    </div>
    <div className="space-y-3"><div className="flex items-center justify-between"><h2 className="font-black uppercase">Tallas, color y stock</h2><button type="button" onClick={()=>setVariants(v=>[...v,{size:"40",color:"",stock:"0"}])} className="rounded-xl border px-3 py-2 text-xs font-black uppercase">+ Talla</button></div>
      {variants.map((v,i)=><div key={i} className="grid gap-2 md:grid-cols-[140px_1fr_140px_auto]"><select value={v.size} onChange={e=>updateVariant(i,"size",e.target.value)} className="rounded-xl border p-3">{sizes.map(size=><option key={size}>{size}</option>)}</select><input required value={v.color} onChange={e=>updateVariant(i,"color",e.target.value)} placeholder="Color" className="rounded-xl border p-3"/><input required type="number" min="0" value={v.stock} onChange={e=>updateVariant(i,"stock",e.target.value)} placeholder="Stock" className="rounded-xl border p-3"/><button type="button" onClick={()=>setVariants(vs=>vs.filter((_,n)=>n!==i))} disabled={variants.length===1} className="rounded-xl border px-3 text-xs font-black text-red-600 disabled:opacity-30">Quitar</button></div>)}

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Camera, Image as ImageIcon, Sparkles, MapPin } from 'lucide-react';

export const ProductEditorPro = () => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [productName, setProductName] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100">
      {/* Lado Izquierdo: Formulario */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Nuevo Lanzamiento</h2>
          <p className="text-gray-500 text-sm">Sube tus Kicks y nosotros nos encargamos de que se vean de lujo.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-700 mb-1">Nombre del Modelo</label>
            <input
              type="text"
              placeholder="Ej: Jordan Retro 4 &apos;Barrio Edition&apos;"
              className="w-full p-4 bg-gray-500 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold"
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="relative border-2 border-dashed border-gray-500 rounded-3xl p-8 text-center hover:border-orange-500 transition-colors group cursor-pointer">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageChange}
              accept="image/*"
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <p className="font-black uppercase text-xs">Toca para subir la foto</p>
              <p className="text-[10px] text-gray-400 uppercase mt-1">Preferiblemente fondo blanco o neutro</p>
            </div>
          </div>
        </div>

        <Button className="w-full py-6 bg-black text-white font-black uppercase italic rounded-2xl shadow-xl hover:bg-orange-600 transition-all">
          Publicar en la Vitrina Nacional
        </Button>
      </div>

      {/* Lado Derecho: La "Magia" (Vista Previa Estética) */}
      <div className="flex flex-col items-center justify-center bg-gray-500 rounded-[2rem] p-8 border-2 border-dashed border-gray-400 relative overflow-hidden">
        <div className="absolute top-4 left-4 flex items-center gap-1">
          <Sparkles size={14} className="text-orange-500" />
          <span className="text-[9px] font-black uppercase text-orange-600 tracking-widest italic">Simulación de Vitrina</span>
        </div>

        {previewUrl ? (
          <div className="w-full max-w-sm">
             {/* Marco Estético */}
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transform rotate-2 hover:rotate-0 transition-transform duration-500 relative group">
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase italic border-2 border-black z-10 shadow-lg">
                  100% Colombiano
                </div>

                <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-white flex items-center justify-center mb-6">
                  <img src={previewUrl} className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)]" alt="Preview" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-black uppercase italic text-xl leading-none">{productName || 'Nombre del Kick'}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-orange-600">Fábrica del Barrio</span>
                    <span className="text-lg font-black italic">$349.900</span>
                  </div>
                </div>
             </div>
             <p className="text-[10px] text-center text-gray-400 mt-8 font-medium uppercase tracking-widest">
               &quot;Así es como lo verán tus clientes: Profesional, limpio y con el sello nacional.&quot;
             </p>
          </div>
        ) : (
          <div className="text-center space-y-4 opacity-30">
            <ImageIcon size={64} className="mx-auto" />
            <p className="font-black uppercase italic text-sm tracking-tighter leading-none">Tu zapato aparecerá aquí<br/>con diseño de revista</p>
          </div>
        )}
      </div>
      main
    </div>
    {message&&<p className={message.startsWith("Producto creado")?"text-green-600":"text-red-600"}>{message}</p>}
    <Button type="submit" disabled={loading} className="w-full bg-black py-5 text-white">{loading?"Guardando...":"Crear producto"}</Button>
  </form>;
}
