"use client";

import React from 'react';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/Button';
import { createOrder } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Trash2, X } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { items, removeItem, clearCart, totalPrice } = useCartStore();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('TRANSFERENCIA');

  // Datos de envío
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [city, setCity] = React.useState('Medellín');

  const handleCheckout = async () => {
    if (!user) {
      alert("Debes iniciar sesión para comprar");
      return;
    }

    if (items.length === 0) return;

    if (paymentMethod === 'CONTRA_ENTREGA_MEDELLIN' && (!address || !phone)) {
      alert("Para contra-entrega necesitamos tu dirección y teléfono en Medellín");
      return;
    }

    const res = await createOrder({
      clientId: user.id,
      items: items.map(i => ({
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.price
      })),
      paymentMethod,
      totalAmount: totalPrice,
      shippingAddress: paymentMethod === 'CONTRA_ENTREGA_MEDELLIN' ? { address, city, phone } : undefined
    });

    if (res.success) {
      alert(`¡Pedido reservado! Se ha enviado una constancia a tu correo. Tienes 24 horas para confirmar el pago.`);
      clearCart();
      setIsOpen(false);
      setAddress('');
      setPhone('');
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="relative">
        <ShoppingCart className="w-5 h-5 mr-2" />
        Carrito
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Tu Carrito</h2>
              <button onClick={() => setIsOpen(false)}><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-10">El carrito está vacío</p>
              ) : (
                items.map(item => (
                  <div key={item.variantId} className="flex items-center gap-4 border-b pb-4">
                    {item.image && <img src={item.image} className="w-16 h-16 object-cover rounded" />}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-xs text-gray-500">Talla: {item.size} | Color: {item.color}</p>
                      <p className="font-bold">${item.price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeItem(item.variantId)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t pt-4 mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 uppercase italic text-[10px]">Método de Pago</label>
                  <select
                    className="w-full p-2.5 border-2 border-gray-200 rounded text-sm bg-white font-bold text-black focus:border-black outline-none transition-all cursor-pointer"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="TRANSFERENCIA">💳 Transferencia (Nequi/Daviplata)</option>
                    <option value="CONTRA_ENTREGA_MEDELLIN">🚀 Pago Contra-entrega Medellín (100% SEGURO)</option>
                    <option value="EFECTIVO">🏠 Pago en Tienda Física</option>
                  </select>
                </div>

                {paymentMethod === 'CONTRA_ENTREGA_MEDELLIN' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3 items-start shadow-sm">
                      <div className="bg-green-600 text-white p-1 rounded-full shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-green-800 leading-tight">Confianza Total Medellín</p>
                        <p className="text-[9px] text-green-700 leading-tight mt-0.5 font-medium">
                          Paga solo al recibir y verificar tus Kicks. <span className="font-bold">Sin depósitos previos</span>, seguridad 100%.
                        </p>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Dirección exacta en Medellín"
                      className="w-full p-2.5 border-2 border-green-100 rounded text-sm focus:border-green-600 outline-none transition-all placeholder:text-gray-400"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp para coordinar entrega"
                      className="w-full p-2.5 border-2 border-green-100 rounded text-sm focus:border-green-600 outline-none transition-all placeholder:text-gray-400"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <Button className="w-full py-6 text-lg" onClick={handleCheckout}>
                  Confirmar Reserva (24h)
                </Button>
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest leading-tight">
                  Al confirmar, el calzado sale de la vitrina por 24 horas.<br/>
                  Se enviará una constancia a tu correo.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
