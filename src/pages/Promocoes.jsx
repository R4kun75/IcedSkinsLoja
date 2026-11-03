import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { dispararEventoGA } from '../analytics';

// Função auxiliar que traduz as formatações do Discord (Títulos e Negrito)
const formatarTextoDiscord = (texto) => {
  if (!texto) return null;
  
  // Função interna para aplicar negrito (lê o **texto**)
  const formatBold = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return texto.split('\n').map((linha, i) => {
    // Traduz os Títulos Grandes do Discord (#, ##, ###)
    if (linha.startsWith('# ')) {
      return <h1 key={i} className="text-2xl font-black text-white mt-4 mb-2">{formatBold(linha.slice(2))}</h1>;
    }
    if (linha.startsWith('## ')) {
      return <h2 key={i} className="text-xl font-bold text-white mt-3 mb-2">{formatBold(linha.slice(3))}</h2>;
    }
    if (linha.startsWith('### ')) {
      return <h3 key={i} className="text-lg font-bold text-white mt-2 mb-1">{formatBold(linha.slice(4))}</h3>;
    }
    // Parágrafos normais (min-h-[1.5rem] preserva linhas em branco perfeitamente)
    return <p key={i} className="min-h-[1.5rem] text-gray-300 leading-relaxed">{formatBold(linha)}</p>;
  });
};

export default function Promocoes({ skins }) {
  const [promocoes, setPromocoes] = useState([]);
  const [carregandoPromocoes, setCarregandoPromocoes] = useState(true);

  useEffect(() => {
    async function carregarPromocoes() {
      try {
        // Busca TODAS as promoções
        const { data, error } = await supabase
          .from('promocoes')
          .select('*')
          .order('ativa', { ascending: false }) // Joga as ativas para cima e as encerradas para o final
          .order('data_lancamento', { ascending: false }); // Depois organiza por data

        if (error) throw error;
        setPromocoes(data || []);
      } catch (err) {
        console.error('Erro ao buscar promoções:', err);
      } finally {
        setCarregandoPromocoes(false);
      }
    }

    carregarPromocoes();
  }, []);

  return (
    // max-w-7xl deixa a tela mais larga para acomodar os 3 cards
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="text-center mt-8 mb-12">
        <h2 className="text-3xl font-black text-cyan-400 italic">PROMOÇÕES ATIVAS</h2>
        <p className="text-gray-400 mt-2 text-sm">Acompanhe os nossos sorteios e novidades exclusivas do Discord.</p>
      </div>
      {carregandoPromocoes ? (
        <p className="text-cyan-400 font-bold text-center animate-pulse mt-10">A procurar promoções...</p>
      ) : promocoes.length === 0 ? (
        <div className="bg-gradient-to-b from-[#0A3F74] to-[#080038] border border-[#1e324c] p-10 rounded-xl text-center shadow-2xl mt-10">
          <p className="text-gray-400 font-bold italic">Nenhuma promoção no momento. Fique de olho no nosso Discord!</p>
        </div>
      ) : (
        // GRID: 1 coluna no telemóvel, 2 no tablet, 3 no PC.
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promocoes.map((promo) => (
            <a 
              key={promo.id} 
              href="https://discord.com/channels/1076120122864967712/1093669606507434085"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                dispararEventoGA('clique_promocao_discord', {
                  promocao_status: promo.ativa ? 'ativa' : 'encerrada',
                  data_lancamento: promo.data_lancamento
                });
              }}
              // Estilo da Box: flex-col e min-h-[450px] forçam ela a ser vertical e alongada
              // O ternário (promo.ativa) define se ela brilha ou se fica opaca (opacity-50) e sem cor (grayscale)
              className={`group flex flex-col bg-[#132032] border rounded-xl shadow-2xl p-6 transition-all hover:-translate-y-1 cursor-pointer min-h-[450px] ${
                promo.ativa 
                  ? 'border-[#1e324c] hover:border-cyan-500/50 hover:shadow-cyan-500/20' 
                  : 'border-red-900/30 opacity-60 hover:opacity-90 grayscale-[40%] hover:grayscale-0'
              }`}
            >
              
              {/* Cabeçalho do Card (Data + Badge) */}
              <div className="flex justify-between items-start mb-6 border-b border-[#1e324c] pb-4">
                <span className="text-cyan-400 text-xs font-black tracking-widest uppercase mt-1">
                  {new Date(promo.data_lancamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
                
                {/* Badge de Status */}
                {promo.ativa ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-md text-xs font-black tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                    🟢 ATIVA
                  </span>
                ) : (
                  <span className="bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-md text-xs font-black tracking-wider">
                    🔴 ENCERRADA
                  </span>
                )}
              </div>
              
              {/* Corpo do Texto da Promoção */}
              <div className="flex-1 overflow-hidden">
                {formatarTextoDiscord(promo.texto)}
              </div>
              
              {/* Rodapé do Card */}
              <div className="mt-6 pt-4 border-t border-[#1e324c]/50 text-center">
                <span className="text-[10px] font-black tracking-widest text-gray-500 group-hover:text-cyan-400 transition-colors uppercase">
                  Clique para abrir no Discord
                </span>
              </div>
              
            </a>
          ))}
        </div>
      )}
    </div>
  );
}