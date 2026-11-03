import React from 'react';

export default function Promocoes({ skins }) {
  const skinsPromocionais = skins.filter(skin => skin.emPromocao || skin.precoAntigo > skin.price);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-black text-white tracking-wider">🔥 PROMOÇÕES IMPERDÍVEIS</h1>
        <span className="bg-red-500 text-white font-bold text-xs px-2 py-1 rounded-full">OFERTAS</span>
      </div>

      {skinsPromocionais.length === 0 ? (
        <div className="text-center py-16 bg-[#0e1726] rounded-xl border border-slate-800">
          <p className="text-gray-400 font-semibold text-lg">Nenhuma promoção ativa no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {skinsPromocionais.map((skin) => (
            <div key={skin.id} className="bg-[#0e1726] border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500 transition-all">
              {skin.image && <img src={skin.image} alt={skin.name} className="w-full h-40 object-contain mb-4" />}
              <div>
                <h3 className="text-white font-bold text-base">{skin.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{skin.condition || 'Factory New'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-black text-lg">R$ {skin.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}