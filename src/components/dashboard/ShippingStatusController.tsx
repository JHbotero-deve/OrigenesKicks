"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateShippingStatus } from "@/lib/actions";
import { Truck, CheckCircle, XCircle, RotateCcw, Package } from "lucide-react";

interface Props { shippingId: string; currentStatus: string; }

export const ShippingStatusController: React.FC<Props> = ({ shippingId, currentStatus }) => {
  const [loading, setLoading] = useState(false);

  const changeStatus = async (newStatus: "EN_RUTA" | "ENTREGADO" | "FALLIDO" | "RETORNADO") => {
    setLoading(true);
    const result = await updateShippingStatus(shippingId, newStatus);
    setLoading(false);

    if (!result.success) {
      alert(result.error || "Error actualizando el envío");
      return;
    }

    window.location.reload();
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3">
      <p className="mb-1 flex w-full items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
        <Package size={11} /> Estado de entrega
      </p>

      <Button type="button" onClick={() => changeStatus("EN_RUTA")} disabled={loading || currentStatus !== "PENDIENTE"} className={"flex items-center gap-1 rounded-lg px-3 py-2 text-[9px] font-black uppercase " + (currentStatus === "EN_RUTA" ? "bg-blue-600 text-white" : "border border-blue-200 bg-white text-blue-600")}>
        <Truck size={12}/> En ruta
      </Button>

      <Button type="button" onClick={() => changeStatus("ENTREGADO")} disabled={loading || currentStatus !== "EN_RUTA"} className={"flex items-center gap-1 rounded-lg px-3 py-2 text-[9px] font-black uppercase " + (currentStatus === "ENTREGADO" ? "bg-green-600 text-white" : "border border-green-200 bg-white text-green-600")}>
        <CheckCircle size={12}/> Entregado
      </Button>

      <Button type="button" onClick={() => changeStatus("FALLIDO")} disabled={loading || currentStatus !== "EN_RUTA"} className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-[9px] font-black uppercase text-red-600">
        <XCircle size={12}/> Fallido
      </Button>

      <Button type="button" onClick={() => changeStatus("RETORNADO")} disabled={loading || currentStatus !== "EN_RUTA"} className="flex items-center gap-1 rounded-lg border border-orange-200 bg-white px-3 py-2 text-[9px] font-black uppercase text-orange-700">
        <RotateCcw size={12}/> Retornado a bodega
      </Button>

      <p className="w-full text-[8px] font-bold uppercase text-gray-400">
        Al marcar “Retornado a bodega”, el sistema devuelve automáticamente las unidades al inventario y registra el movimiento.
      </p>
    </div>
  );
};
