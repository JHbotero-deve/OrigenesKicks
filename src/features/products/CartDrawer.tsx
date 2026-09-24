"use client";
import React from "react";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/lib/actions";
import { initiateWompiCheckout } from "@/lib/payments";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, Trash2, X, CheckCircle2, ShieldCheck, MapPin, CreditCard, Truck } from "lucide-react";
import { PublicImage } from "@/components/ui/PublicImage";

export const CartDrawer: React.FC = () => {
  const { items, removeItem, clearCart, getTotalPrice } = useCartStore();
  const { user, dbUser } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState("TRANSFERENCIA");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("Medellín");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [lastTrackingCode, setLastTrackingCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const totalPrice = getTotalPrice();
  const requiresDelivery = paymentMethod !== "EFECTIVO";

  const resetCheckout = () => {
    setAddress("");
    setPhone("");
    setCity("Medellín");
    setNeighborhood("");
    setNotes("");
    setAcceptedTerms(false);
    setCustomerName("");
    setCustomerEmail("");
    setError("");
  };

  const handleCheckout = async () => {
    setError("");
    setSuccess("");
    const finalName = (dbUser?.name || customerName || "Cliente Orígenes Kicks").trim();
    const finalEmail = (user?.email || customerEmail).trim().toLowerCase();
    if (!finalName) return setError("Completa el nombre del cliente.");
    if (!finalEmail || !/^\S+@\S+\.\S+$/.test(finalEmail)) return setError("Ingresa un correo válido.");
    if (items.length === 0) return setError("El carrito está vacío.");
    if (requiresDelivery && (!address.trim() || !phone.trim() || !city.trim())) return setError("Completa ciudad, dirección y teléfono para coordinar la entrega.");
    if (!/^\+?[0-9\s()-]{7,20}$/.test(phone.trim())) return setError("Ingresa un número de teléfono válido.");
    if (notes.trim().length > 500) return setError("Las observaciones no pueden superar 500 caracteres.");
    if (!acceptedTerms) return setError("Debes aceptar las condiciones de compra para continuar.");

    setSubmitting(true);
    const shippingAddress = requiresDelivery ? {
      address: neighborhood.trim() ? address.trim() + " — Barrio: " + neighborhood.trim() : address.trim(),
      city: city.trim(),
      phone: phone.trim(),
    } : undefined;

    const res = await createOrder({
      clientId: dbUser?.id,
      customerName: finalName,
      customerEmail: finalEmail,
      items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity, unitPrice: item.price })),
      paymentMethod,
      totalAmount: totalPrice,
      shippingAddress,
      notes: notes.trim() || undefined,
    });

    setSubmitting(false);
    if (res.success) {
      setLastTrackingCode(res.trackingCode ?? "");
      if (paymentMethod === "WOMPI" && res.pedidoId) {
        const payment = await initiateWompiCheckout(res.pedidoId, res.trackingCode);
        if (!payment.success || !payment.checkoutUrl) {
          setError(payment.error ?? "No se pudo iniciar el pago con Wompi.");
          setSubmitting(false);
          return;
        }
        clearCart();
        resetCheckout();
        window.location.assign(payment.checkoutUrl);
        return;
      }
      setSuccess("Pedido " + (res.trackingCode ?? "") + " creado correctamente. Guarda este código para consultar el estado en Rastreo de Kicks.");
      clearCart();
      resetCheckout();
    } else {
      setError(res.error ?? "No se pudo crear el pedido. Revisa los datos e inténtalo nuevamente.");
    }
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="relative flex items-center gap-2 rounded-2xl bg-[#1a1a1a] px-4 py-2.5 text-white shadow-xl transition-all hover:bg-black active:scale-95 sm:gap-3 sm:px-6" aria-label={"Abrir carrito" + (items.length ? ", " + items.length + " productos" : "")}>
        <ShoppingBag size={18} className="text-orange-500" />
        <span className="text-[10px] font-black uppercase italic tracking-wider sm:text-[11px]">Carrito</span>
        {items.length > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-orange-600 text-[9px] font-black text-white shadow-lg">{items.length}</span>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Carrito y checkout">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Cerrar carrito" onClick={() => setIsOpen(false)} />
          <aside className="relative flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl">
            <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-orange-600">Orígenes Kicks</p><h2 className="text-xl font-black uppercase italic tracking-tight text-gray-900">Carrito y compra</h2></div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-gray-100" aria-label="Cerrar carrito"><X size={20} /></button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <section className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resumen</p><p className="text-sm font-bold text-gray-900">{items.length} producto{items.length === 1 ? "" : "s"}</p></div><span className="text-lg font-black text-gray-900">\${totalPrice.toLocaleString("es-CO")}</span></div>
                <div className="space-y-3">
                  {items.length === 0 ? <p className="rounded-2xl bg-gray-50 px-4 py-8 text-center text-sm font-medium text-gray-500">El carrito está vacío.</p> : items.map((item) => (
                    <div key={item.variantId} className="flex gap-3 rounded-2xl border border-gray-100 p-3">
                      {item.image ? <PublicImage src={item.image} alt={item.name} width={64} height={64} className="h-16 w-16 shrink-0 rounded-xl object-cover" sizes="64px" /> : <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-100" aria-hidden="true" />}
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-gray-900">{item.name}</p><p className="mt-1 text-[10px] font-bold uppercase text-gray-400">Talla {item.size} · {item.color}</p><p className="mt-1 text-sm font-black">\${item.price.toLocaleString("es-CO")} · Cant. {item.quantity}</p></div>
                      <button type="button" onClick={() => removeItem(item.variantId)} className="self-start rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={"Eliminar " + item.name}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </section>

              {lastTrackingCode && items.length === 0 && <section className="mx-5 my-5 rounded-3xl border-2 border-orange-200 bg-orange-50 p-6 text-center sm:mx-6"><p className="text-[10px] font-black uppercase tracking-widest text-orange-700">Pedido creado</p><p className="mt-2 text-2xl font-black tracking-widest text-black">{lastTrackingCode}</p><p className="mt-2 text-xs font-medium text-orange-950">Guarda este código. No necesitas crear una cuenta para consultar el estado.</p><a href="/posventa" className="mt-4 inline-flex rounded-xl bg-black px-5 py-3 text-[10px] font-black uppercase text-white hover:bg-orange-600">Rastrear pedido</a></section>}

              {items.length > 0 && <section className="space-y-5 px-5 py-5 sm:px-6">
                {user && dbUser ? <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4"><p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Cliente</p><p className="text-sm font-black text-gray-900">{dbUser.name || "Cliente"}</p><p className="text-xs text-gray-500">{user.email}</p></div> : <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-black uppercase text-orange-950">Datos del cliente</p>
                  <p className="mt-1 text-xs leading-relaxed text-orange-900">No necesitas crear una cuenta. Usaremos estos datos para registrar la compra, enviarte la constancia y darte un código de seguimiento.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" placeholder="Nombre completo" className="w-full rounded-xl border-2 border-orange-200 bg-white p-3 text-sm outline-none focus:border-black" />
                    <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} type="email" autoComplete="email" placeholder="Correo electrónico" className="w-full rounded-xl border-2 border-orange-200 bg-white p-3 text-sm outline-none focus:border-black" />
                  </div>
                </div>}

                <div>
                  <div className="mb-3 flex items-center gap-2"><Truck size={17} className="text-orange-600" /><h3 className="text-sm font-black uppercase italic">Datos de entrega</h3></div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm outline-none transition focus:border-black" /><input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Barrio" className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm outline-none transition focus:border-black" /></div>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección exacta y complemento" className="mt-3 w-full rounded-xl border-2 border-gray-200 p-3 text-sm outline-none transition focus:border-black" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="WhatsApp / teléfono de contacto" className="mt-3 w-full rounded-xl border-2 border-gray-200 p-3 text-sm outline-none transition focus:border-black" />
                  <p className="mt-2 text-[10px] text-gray-400">Usaremos estos datos para gestionar la entrega del pedido.</p>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2"><CreditCard size={17} className="text-orange-600" /><h3 className="text-sm font-black uppercase italic">Forma de pago</h3></div>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-sm font-bold text-black outline-none transition focus:border-black">
                    <option value="WOMPI">Wompi — pago en línea</option><option value="TRANSFERENCIA">Transferencia — Nequi / Daviplata</option><option value="CONTRA_ENTREGA_MEDELLIN">Contra-entrega — Medellín</option><option value="EFECTIVO">Pago en tienda física</option>
                  </select>
                  <div className="mt-3 rounded-xl bg-gray-50 p-3 text-[10px] leading-relaxed text-gray-500">{paymentMethod === "WOMPI" ? "Serás dirigido al Checkout seguro de Wompi para completar el pago. El estado definitivo se confirma mediante webhook en el servidor." : paymentMethod === "CONTRA_ENTREGA_MEDELLIN" ? "El pago se realiza al recibir el pedido. La entrega se coordina con el teléfono registrado." : paymentMethod === "TRANSFERENCIA" ? "Después de reservar, el equipo valida el pedido y te indica el proceso de pago." : "Puedes finalizar la compra en la tienda física con el código de seguimiento que recibirás."}</div>
                </div>

                <div><label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">Observaciones del pedido</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} placeholder="Apartamento, referencia de entrega o indicaciones adicionales" className="w-full resize-none rounded-xl border-2 border-gray-200 p-3 text-sm outline-none transition focus:border-black" /><p className="mt-1 text-right text-[9px] text-gray-400">{notes.length}/500</p></div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex gap-3"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-green-600" /><div><p className="text-xs font-black uppercase">Condiciones de compra</p><ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-gray-500"><li>• Reserva durante 24 horas.</li><li>• Precio y stock se validan al confirmar.</li><li>• Datos de contacto y entrega deben ser correctos.</li><li>• Una reserva vencida puede liberar nuevamente el inventario.</li></ul></div></div>
                  <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-gray-100 pt-4"><input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-black" /><span className="text-[11px] font-bold leading-relaxed text-gray-700">Acepto las condiciones de compra y autorizo el uso de los datos suministrados para gestionar este pedido.</span></label>
                </div>

                {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</div>}
                {success && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4"><div className="flex gap-2"><CheckCircle2 size={18} className="shrink-0 text-green-600" /><p className="text-xs font-bold leading-relaxed text-green-800">{success}</p></div></div>}

                <div className="border-t border-gray-100 pt-4">
                  <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase text-gray-500">Total del pedido</span><span className="text-2xl font-black">\${totalPrice.toLocaleString("es-CO")}</span></div>
                  <Button disabled={submitting} className="w-full rounded-2xl bg-black py-6 text-base font-black uppercase italic text-white hover:bg-orange-600" onClick={handleCheckout}>{submitting ? "Procesando pedido..." : "Confirmar pedido"}</Button>
                  <p className="mt-3 flex items-center justify-center gap-2 text-center text-[9px] font-bold uppercase tracking-widest text-gray-400"><MapPin size={12} /> No necesitas crear una cuenta para comprar</p>
                </div>
              </section>}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
