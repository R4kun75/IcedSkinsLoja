import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { dispararEventoGA } from '../analytics';

export default function Parceiros() {
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarParceiros() {
      try {
        const { data, error } = await supabase.from('parceiros').select('*').order('ordem', { ascending: true }).order('created_at', { ascending: false });
        if (error) throw error;
        setParceiros(data || []);
      } catch (err) {
        console.error('Erro ao buscar parceiros:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarParceiros();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      
      {/* Título da Seção */}
      <div className="text-center mt-8 mb-12">
        <h2 className="text-3xl font-black text-cyan-400 italic">NOSSOS PARCEIROS</h2>
        <p className="text-gray-400 mt-2 text-sm">Criadores de conteúdo e projetos que apoiam a loja.</p>
      </div>

      {loading ? (
        <p className="text-cyan-400 font-bold text-center animate-pulse">A procurar parceiros...</p>
      ) : parceiros.length === 0 ? (
        <div className="bg-[#132032] border border-[#1e324c] p-10 rounded-xl text-center shadow-2xl">
          <p className="text-gray-400 font-bold italic">Nenhum parceiro cadastrado no momento.</p>
        </div>
      ) : (
        // O Grid mágico: 1 no celular, 2 no tablet, 3 no PC.
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parceiros.map((p) => {
            
            // Define o "corpo" do Card (para ser reutilizado com ou sem link)
            const CardContent = (
              <div className="flex flex-row items-center gap-4 bg-gradient-to-r from-[#0A3F74] to-[#080038] border border-[#1e324c] rounded-xl p-5 shadow-2xl transition-all hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-cyan-500/20 group h-full">
                
                {/* Imagem do Parceiro (Formato quadrado/arredondado na esquerda) */}
                <div className="flex-shrink-0">
                  <img 
                    src={p.imagem} 
                    alt={p.nome} 
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-[#1e324c] group-hover:border-cyan-500/50 transition-colors"
                  />
                </div>
                
                {/* Textos na direita (Nome + Descrição) */}
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-white font-black text-lg truncate group-hover:text-cyan-400 transition-colors">
                    {p.nome}
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm mt-1 line-clamp-2 leading-relaxed">
                    {p.texto}
                  </p>
                </div>
              </div>
            );

            // Se tiver link, envolve numa tag <a>, se não, apenas mostra a box
            return p.link ? (
                <a 
                  key={p.id} 
                  href={p.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block"
                  onClick={() => {
                    dispararEventoGA('clique_parceiro', {
                      parceiro_nome: p.nome
                    });
                  }}
                >
                  {CardContent}
                </a>
              ) : (
                <div key={p.id} className="block">
                  {CardContent}
                </div>
              );
          })}
        </div>
      )}
    </div>
  );
}