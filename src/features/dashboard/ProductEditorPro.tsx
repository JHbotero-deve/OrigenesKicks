"use client";

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
    </div>
    {message&&<p className={message.startsWith("Producto creado")?"text-green-600":"text-red-600"}>{message}</p>}
    <Button type="submit" disabled={loading} className="w-full bg-black py-5 text-white">{loading?"Guardando...":"Crear producto"}</Button>
  </form>;
}
