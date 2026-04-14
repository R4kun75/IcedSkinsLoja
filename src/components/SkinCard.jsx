import React from 'react';

const FALLBACK_IMAGE = 'https://placehold.co/300x200/080038/ef4444?text=Imagem+Indisponivel';

export default function SkinCard({ skin }) {
  const formatCurrency = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // Limita o float entre 0 e 100% para o ponteiro não sair da tela
  const floatPos = Math.min(Math.max((skin.float || 0) * 100, 0), 100);

  return (
    <div className="bg-gradient-to-b from-[#0A3F74] to-[#080038] border border-[#1e324c] rounded-xl overflow-hidden flex flex-col hover:border-cyan-400 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(27,193,211,0.4)] transition-all duration-500 group">
      
      {/* Corpo do Card (Adicionado items-center para centralização forçada) */}
      <div className="p-5 flex-grow flex flex-col items-center">
        
        {/* Título Centralizado e Maior (text-sm em vez de text-xs) */}
        <h3 className="text-white font-bold text-sm text-center leading-snug uppercase w-full">
          {skin.weapon} <span className="text-cyan-400 mx-1">|</span> {skin.name}
        </h3>
        
        <p className="text-[10px] text-center text-purple-400 mt-1.5 uppercase font-black tracking-widest">
          {skin.condition}
        </p>
        
        {/* Container da Imagem Muito Maior (de h-28 para h-40) */}
        <div className="h-40 w-full flex items-center justify-center my-6">
          <img 
            src={skin.image} 
            className="max-h-full max-w-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-500" 
            onError={(e) => e.target.src = FALLBACK_IMAGE} 
            alt={`${skin.weapon} ${skin.name}`} 
          />
        </div>

        {/* Preços (Empurrados sempre para baixo pelo mt-auto) */}
        <div className="text-center w-full mb-5 mt-auto">
          <p className="text-gray-500 text-[11px] line-through mb-1">
            {formatCurrency(skin.steamPrice)}
          </p>
          <p className="text-2xl font-black text-white drop-shadow-md">
            {formatCurrency(skin.price)}
          </p>
        </div>

        {/* Barra de Float */}
        <div className="w-full px-1 mb-2 relative">
          <div className="absolute top-[-16px] text-white text-[12px] drop-shadow-md" style={{ left: `calc(${floatPos}% - 6px)` }}>▼</div>
          <div className="h-2 w-full flex rounded-full overflow-hidden bg-black/50 border border-black/20">
            <div className="h-full bg-[#00ea8b]" style={{width: '20%'}}></div> {/* Factory New */}
            <div className="h-full bg-[#90ea00]" style={{width: '20%'}}></div> {/* Minimal Wear */}
            <div className="h-full bg-[#ffc600]" style={{width: '20%'}}></div> {/* Field-Tested */}
            <div className="h-full bg-[#ff8a00]" style={{width: '20%'}}></div> {/* Well-Worn */}
            <div className="h-full bg-[#ff0000]" style={{width: '20%'}}></div> {/* Battle-Scarred */}
          </div>
          <div className="flex justify-between mt-2 px-1 text-[10px] font-mono">
            <span className="text-gray-400">F: {Number(skin.float).toFixed(9)}</span>
            <span className="text-cyan-400 font-bold">P: {skin.pattern}</span>
          </div>
        </div>
      </div>

      {/* Botão de Compra mais "Gordinho" (py-3) */}
      <button 
        onClick={() => window.open(skin.buyLink, '_blank')} 
        className="m-4 mt-0 bg-cyan-500 hover:bg-cyan-400 text-[#0b121e] font-black py-3 rounded-lg text-xs shadow-[0_0_15px_rgba(27,193,211,0.3)] transition-all active:scale-95 uppercase tracking-widest"
      >
        COMPRAR AGORA
      </button>
    </div>
  );
}