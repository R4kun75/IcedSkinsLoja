// Arquivo: src/components/Footer.jsx
import React from 'react';

export default function Footer({ isAdmin, setCurrentView }) {
  return (
    <footer className="bg-[#051F38] border-t border-[#1a2b44] py-16 px-6 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <span className="text-4xl font-black italic text-white drop-shadow-[0_0_5px_rgba(27,193,211,0.5)]">
            <span className="text-cyan-400">ICED</span><br/><span className="-mt-3 block">SKINS</span>
          </span>
          <p className="text-gray-500 text-xs mt-6 leading-relaxed uppercase tracking-tighter">
            A maior loja de skins de alta performance do Brasil. Conectado ao Firebase Cloud.
          </p>
        </div>
        
        <div>
          <h4 className="font-black mb-6 text-white uppercase tracking-widest text-sm">Navegação</h4>
          <ul className="text-gray-400 text-xs space-y-3 font-bold">
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">POLÍTICA DE PRIVACIDADE</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">TERMOS DE USO</li>
            <li className="hover:text-cyan-400 cursor-pointer transition-colors">CENTRAL DE AJUDA</li>
            {!isAdmin && (
              <li onClick={() => setCurrentView('login')} className="hover:text-cyan-400 cursor-pointer transition-colors">
                ACESSO ADMINISTRATIVO
              </li>
            )}
          </ul>
        </div>

        <div>
           <h4 className="font-black mb-6 text-white uppercase tracking-widest text-sm">Pagamentos</h4>
           <div className="flex flex-wrap gap-2">
             <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded text-[10px] font-black italic">VISA</div>
             <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded text-[10px] font-black italic">MASTERCARD</div>
             <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded text-[10px] font-black italic text-green-400">PICPAY</div>
             <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded text-[10px] font-black italic text-cyan-400">PIX</div>
           </div>
        </div>

        <div className="flex md:justify-end items-start gap-4">
           {["S", "I", "W", "X", "D"].map(icon => (
             <div key={icon} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-xs font-black hover:bg-white hover:text-black cursor-pointer transition-all">
               {icon}
             </div>
           ))}
        </div>
      </div>
      
      <div className="text-center text-[10px] text-gray-700 mt-16 font-bold uppercase tracking-[0.2em] border-t border-white/5 pt-10">
        © 2026 ICEDSKINS - TODOS OS DIREITOS RESERVADOS. CNPJ: 11.111.111/1111-11
      </div>
    </footer>
  );
}