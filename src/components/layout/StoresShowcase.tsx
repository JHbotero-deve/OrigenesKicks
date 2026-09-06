"use client";

import React from 'react';
import { MapPin, Clock, Phone, Camera } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  imageUrl?: string;
}

interface Props {
  stores: Store[];
}

export const StoresShowcase: React.FC<Props> = ({ stores }) => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <span className="bg-black text-white text-[10px] font-black px-3 py-1 uppercase italic tracking-[0.2em] mb-4 inline-block">
            Presencia Real
          </span>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
            Nuestras Sedes <br/><span className="text-orange-600 underline decoration-black">En el Barrio</span>
          </h2>
          <p className="text-gray-500 mt-4 font-bold uppercase text-xs tracking-widest">
            Visítanos, mídete tus Kicks y siente la calidad nacional en persona.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.length === 0 ? (
            <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-20 text-center">
              <Camera className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-gray-400 font-black uppercase italic">El dueño aún no ha subido fotos de los locales...</p>
            </div>
          ) : (
            stores.map((store) => (
              <div key={store.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full">
                {/* Foto del Local */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                  {store.imageUrl ? (
                    <img
                      src={store.imageUrl}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={store.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black text-white p-12 text-center">
                      <p className="font-black uppercase italic text-sm">Próximamente foto de la sede {store.name}</p>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-orange-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase italic shadow-lg">
                    Sede Oficial
                  </div>
                </div>

                {/* Info del Local */}
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 leading-none group-hover:text-orange-600 transition-colors">
                    {store.name}
                  </h3>

                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-orange-500 shrink-0" size={18} />
                      <p className="text-xs font-bold text-gray-600 uppercase leading-tight">{store.address}, {store.city}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="text-orange-500 shrink-0" size={18} />
                      <p className="text-xs font-bold text-gray-600">{store.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="text-orange-500 shrink-0" size={18} />
                      <p className="text-[10px] font-black text-gray-400 uppercase">Lunes a Sábado: 9am - 8pm</p>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${store.phone.replace(/\D/g, '')}?text=Hola! Quiero visitar la sede ${store.name}, ¿me dan la ubicación exacta?`}
                    target="_blank"
                    className="w-full bg-black text-white text-center py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-orange-600 transition-colors shadow-lg"
                  >
                    ¿Cómo llegar?
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
