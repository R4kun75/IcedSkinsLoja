import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, ChevronLeftCircle, ChevronRightCircle } from 'lucide-react';
import SkinCard from '../components/SkinCard';

export default function Home({ skins, banners, searchTerm }) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [sortBy, setSortBy] = useState("recentes");
  
  // NOVO: Estado da Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Mostra 12 skins por página (2 linhas de 6)

  const FALLBACK_IMAGE = 'https://placehold.co/1200x300/080038/ef4444?text=Banner+Indisponivel';
  const CATEGORIES = ["TODAS", "FACAS", "LUVAS", "PISTOLAS", "SMGS", "RIFLES", "SNIPERS", "ESCOPETAS", "ESPECIAIS"];

  // 1. Lógica de Filtragem
  let filteredSkins = skins.filter(skin => {
    const matchesSearch = (skin.weapon + " " + skin.name).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      selectedCategory === "TODAS" || 
      skin.category === selectedCategory ||
      (selectedCategory === "FACAS" && skin.weapon.toLowerCase().includes("faca")) ||
      (selectedCategory === "LUVAS" && skin.weapon.toLowerCase().includes("luva"));

    return matchesSearch && matchesCategory;
  });

  // 2. Lógica de Ordenação
  filteredSkins.sort((a, b) => {
    if (sortBy === 'menor_preco') return a.price - b.price;
    if (sortBy === 'maior_preco') return b.price - a.price;
    if (sortBy === 'menor_float') return a.float - b.float;
    return 0;
  });

  // NOVO: Se o usuário digitar algo na busca ou mudar a categoria, volta para a página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  // NOVO: Matemática da Paginação (Cortando o array de skins)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSkins = filteredSkins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSkins.length / itemsPerPage);

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

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* BARRA DE FILTROS E ORDENAÇÃO */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-10">
          <div className="bg-gradient-to-r from-[#0A3F74] to-[#080038] border border-[#1e324c] rounded-lg p-2 flex flex-wrap justify-center gap-2 text-sm font-bold text-gray-300 shadow-xl overflow-x-auto whitespace-nowrap">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded transition-colors uppercase tracking-widest ${selectedCategory === cat ? 'bg-cyan-500 text-black' : 'hover:text-cyan-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#132032] border border-[#1e324c] rounded-lg px-4 py-2 shadow-xl">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400 mr-3" />
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)} 
              className="bg-transparent text-gray-300 text-sm font-bold outline-none cursor-pointer"
            >
              <option value="recentes" className="bg-[#132032]">Mais Recentes</option>
              <option value="menor_preco" className="bg-[#132032]">Menor Preço</option>
              <option value="maior_preco" className="bg-[#132032]">Maior Preço</option>
              <option value="menor_float" className="bg-[#132032]">Menor Float</option>
            </select>
          </div>
        </div>

        {searchTerm && (
          <p className="text-cyan-400 mb-6 font-bold italic">Mostrando resultados para: "{searchTerm}"</p>
        )}

        {/* GRID DE SKINS (Agora usando currentSkins em vez de filteredSkins) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {currentSkins.map(skin => <SkinCard key={skin.id} skin={skin} />)}
        </div>
        
        {filteredSkins.length === 0 && (
          <div className="w-full text-center py-20 text-gray-500 font-bold italic text-lg">
            Nenhuma skin encontrada com esses filtros.
          </div>
        )}

        {/* CONTROLES DE PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-16">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full text-cyan-400 hover:bg-cyan-500/10 disabled:text-gray-600 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeftCircle size={32} strokeWidth={1.5} />
            </button>
            
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-black text-sm transition-all ${currentPage === i + 1 ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(27,193,211,0.4)]' : 'bg-[#132032] text-gray-400 border border-[#1e324c] hover:border-cyan-400 hover:text-cyan-400'}`}
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
    </main>
  );
}