import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronLeftCircle, ChevronRightCircle } from 'lucide-react';
import SkinCard from '../components/SkinCard';

export default function Home({ skins, banners, searchTerm }) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [sortBy, setSortBy] = useState("recentes");
  
  // Estados para os filtros laterais
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(10000);
  const [selectedWears, setSelectedWears] = useState([]);
  
  // Estado da Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const FALLBACK_IMAGE = 'https://placehold.co/1200x300/080038/ef4444?text=Banner+Indisponivel';
  const CATEGORIES = ["TODAS", "FACAS", "LUVAS", "PISTOLAS", "SMGS", "RIFLES", "SNIPERS", "ESCOPETAS", "ESPECIAIS"];
  
  const SORT_OPTIONS = [
    { id: 'recentes', label: 'Mais Recentes' },
    { id: 'menor_preco', label: 'Menor Preço' },
    { id: 'maior_preco', label: 'Maior Preço' },
    { id: 'menor_float', label: 'Menor Float' }
  ];

  const CONDITIONS = [
    { id: 'Factory-New', label: 'Factory New (FN)' },
    { id: 'Minimal-Wear', label: 'Minimal Wear (MW)' },
    { id: 'Field-Tested', label: 'Field Tested (FT)' },
    { id: 'Well-Worn', label: 'Well Worn (WW)' },
    { id: 'Battle-Scarred', label: 'Battle Scarred (BS)' }
  ];

  // Função para marcar/desmarcar desgaste
  const toggleWear = (wearId) => {
    setSelectedWears(prev => 
      prev.includes(wearId) ? prev.filter(w => w !== wearId) : [...prev, wearId]
    );
  };

  // 1. Lógica de Filtragem
  let filteredSkins = skins.filter(skin => {
    const matchesSearch = (skin.weapon + " " + skin.name).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "TODAS" || 
      skin.category === selectedCategory ||
      (selectedCategory === "FACAS" && skin.weapon.toLowerCase().includes("faca")) ||
      (selectedCategory === "LUVAS" && skin.weapon.toLowerCase().includes("luva"));

    const matchesWear = selectedWears.length === 0 || selectedWears.includes(skin.condition);

    const min = parseFloat(priceMin) || 0;
    const max = parseFloat(priceMax) || Infinity;
    const matchesPrice = skin.price >= min && skin.price <= max;

    return matchesSearch && matchesCategory && matchesWear && matchesPrice;
  });

  // 2. Lógica de Ordenação
  filteredSkins.sort((a, b) => {
    if (sortBy === 'menor_preco') return a.price - b.price;
    if (sortBy === 'maior_preco') return b.price - a.price;
    if (sortBy === 'menor_float') return a.float - b.float;
    return 0; 
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, priceMin, priceMax, selectedWears]);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 60000);
    return () => clearInterval(interval);
  }, [banners]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSkins = filteredSkins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSkins.length / itemsPerPage);

  // Calcula a percentagem para desenhar a barra de progresso do preço
  const minPercent = (priceMin / 10000) * 100;
  const maxPercent = (priceMax / 10000) * 100;

  return (
    <main>
      {/* CARROSSEL */}
      <div className="w-full h-[320px] bg-[#070b12] relative group overflow-hidden">
        {banners.length > 0 ? (
          <>
            <img src={banners[currentBanner]} className="w-full h-full object-cover opacity-90 transition-opacity duration-700" onError={(e) => e.target.src = FALLBACK_IMAGE} alt="Banner" />
            <button onClick={() => setCurrentBanner(p => (p - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-cyan-500 hover:text-black"><ChevronLeft/></button>
            <button onClick={() => setCurrentBanner(p => (p + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-cyan-500 hover:text-black"><ChevronRight/></button>
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

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* BARRA LATERAL (SIDEBAR) */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
            
            {/* Filtro: Preço (Agora no topo) */}
            <div className="bg-[#132032] border border-[#1e324c] p-5 rounded-xl shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Preço</h3>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 font-bold mb-3">
                <span>R$0</span>
                <span>R$10k +</span>
              </div>

              {/* Slider Visual */}
              <div className="relative h-1.5 bg-[#1e324c] rounded-full mb-6">
                <div 
                  className="absolute h-full bg-cyan-400 rounded-full"
                  style={{ left: `${Math.min(minPercent, 95)}%`, right: `${100 - Math.max(maxPercent, 5)}%` }}
                ></div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="50"
                  value={priceMin} 
                  onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax - 50))}
                  className="absolute w-full -top-1.5 h-4 appearance-none bg-transparent pointer-events-none 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto 
                  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto 
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
                
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="50"
                  value={priceMax} 
                  onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin + 50))}
                  className="absolute w-full -top-1.5 h-4 appearance-none bg-transparent pointer-events-none 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto 
                  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto 
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={priceMin} 
                  onChange={e => setPriceMin(Number(e.target.value))} 
                  className="w-full bg-black/40 border border-[#1e324c] p-2 rounded text-sm text-white outline-none focus:border-cyan-400 text-center" 
                />
                <span className="text-gray-500">-</span>
                <input 
                  type="number" 
                  value={priceMax} 
                  onChange={e => setPriceMax(Number(e.target.value))} 
                  className="w-full bg-black/40 border border-[#1e324c] p-2 rounded text-sm text-white outline-none focus:border-cyan-400 text-center" 
                />
              </div>
            </div>

            {/* Filtro: Ordenação (Agora no meio) */}
            <div className="bg-[#132032] border border-[#1e324c] p-5 rounded-xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Ordenar Por</h3>
              </div>
              <div className="space-y-3">
                {SORT_OPTIONS.map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setSortBy(opt.id); }}>
                    {/* Círculo de seleção (Radio Button visual) */}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${sortBy === opt.id ? 'bg-cyan-500 border-cyan-500' : 'border-[#1e324c] bg-black/40 group-hover:border-cyan-400'}`}>
                      {sortBy === opt.id && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro: Desgaste */}
            <div className="bg-[#132032] border border-[#1e324c] p-5 rounded-xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Desgaste</h3>
              </div>
              <div className="space-y-3">
                {CONDITIONS.map(cond => (
                  <label key={cond.id} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleWear(cond.id); }}>
                    {/* Quadrado de seleção (Checkbox visual) */}
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedWears.includes(cond.id) ? 'bg-cyan-500 border-cyan-500' : 'border-[#1e324c] bg-black/40 group-hover:border-cyan-400'}`}>
                      {selectedWears.includes(cond.id) && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{cond.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* ÁREA DE SKINS E CATEGORIAS */}
          <div className="flex-1 min-w-0">
            
            {/* BARRA SUPERIOR (CATEGORIAS) - Agora alinhada acima da grelha de skins */}
            <div className="w-full bg-gradient-to-r from-[#0A3F74] to-[#080038] border border-[#1e324c] rounded-lg p-2 flex justify-between overflow-x-auto whitespace-nowrap custom-scrollbar shadow-xl mb-6">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-1 px-4 py-2 rounded transition-colors uppercase tracking-widest text-sm font-bold mx-1 ${selectedCategory === cat ? 'bg-cyan-500 text-black' : 'text-gray-300 hover:text-cyan-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {searchTerm && (
              <p className="text-cyan-400 mb-6 font-bold italic">A mostrar resultados para: "{searchTerm}"</p>
            )}

            {/* Grid de Skins */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {currentSkins.map(skin => <SkinCard key={skin.id} skin={skin} />)}
            </div>
            
            {filteredSkins.length === 0 && (
              <div className="w-full text-center py-20 bg-[#132032] border border-[#1e324c] rounded-xl text-gray-500 font-bold italic text-lg shadow-xl mt-4">
                Nenhuma skin encontrada com estes filtros.
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full text-cyan-400 hover:bg-cyan-500/10 disabled:text-gray-600 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeftCircle size={32} strokeWidth={1.5} />
                </button>
                
                <div className="flex space-x-2 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`min-w-[40px] h-10 rounded-lg font-black text-sm transition-all flex-shrink-0 ${currentPage === i + 1 ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(27,193,211,0.4)]' : 'bg-[#132032] text-gray-400 border border-[#1e324c] hover:border-cyan-400 hover:text-cyan-400'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full text-cyan-400 hover:bg-cyan-500/10 disabled:text-gray-600 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRightCircle size={32} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}