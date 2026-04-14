import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SkinCard from '../components/SkinCard';

export default function Home({ skins, banners }) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const FALLBACK_IMAGE = 'https://placehold.co/1200x300/080038/ef4444?text=Banner+Indisponivel';

  return (
    <main>
      <div className="w-full h-[320px] bg-[#070b12] relative group overflow-hidden">
        {banners.length > 0 ? (
          <>
            <img src={banners[currentBanner]} className="w-full h-full object-cover opacity-90 transition-opacity duration-700" onError={(e) => e.target.src = FALLBACK_IMAGE} alt="Banner" />
            <button onClick={() => setCurrentBanner(p => (p - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"><ChevronLeft/></button>
            <button onClick={() => setCurrentBanner(p => (p + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"><ChevronRight/></button>
            <div className="absolute bottom-4 flex w-full justify-center space-x-2 z-10">
              {banners.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentBanner(idx)} className={`w-8 h-1.5 rounded-full transition-colors ${idx === currentBanner ? 'bg-cyan-400' : 'bg-white/30 hover:bg-white/50'}`}></button>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold italic">Nenhum banner ativo.</div>
        )}
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-[#0A3F74] to-[#080038] border border-[#1e324c] rounded-lg p-2 flex flex-wrap justify-center gap-6 mb-10 text-sm font-bold text-gray-300 shadow-xl overflow-x-auto whitespace-nowrap">
          {["ESPECIAIS", "FACAS", "LUVAS", "ESCOPETAS", "PISTOLAS", "RIFLE", "RIFLE DE PRECISÃO", "SUBMETRALHADORA"].map(cat => (
            <button key={cat} className="hover:text-cyan-400 transition-colors uppercase tracking-widest">{cat}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {skins.map(skin => <SkinCard key={skin.id} skin={skin} />)}
        </div>
        {skins.length === 0 && <div className="w-full text-center py-20 text-gray-500 font-bold italic text-white">Carregando catálogo...</div>}
      </div>
    </main>
  );
}