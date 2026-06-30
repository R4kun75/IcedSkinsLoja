import React from 'react';
import { Search, HelpCircle, Gift, Percent, Handshake, MessageSquare, Lock } from 'lucide-react';

export default function Header({ isAdmin, setCurrentView, searchTerm, setSearchTerm }) {
  return (
    <header className="bg-gradient-to-r from-[#0A3F74] to-[#080038] border-b border-[#1a2b44] py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-xl">
      <div className="flex items-center space-x-10">
        
        {/* LOGO DA EMPRESA AQUI */}
        <div className="cursor-pointer flex items-center" onClick={() => setCurrentView('home')}>
          <img 
            src="/Logo.png" 
            alt="IcedSkins Logo" 
            className="h-20 w-auto object-contain scale-[1.8] origin-left drop-shadow-[0_0_8px_rgba(27,193,211,0.5)] transition-transform hover:scale-[1.6] mr-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            onError={(e) => {
             e.target.style.display = 'none';
             e.target.nextSibling.style.display = 'block';
            }}
          />
          {/* Fallback de segurança caso você esqueça de colocar a logo na pasta public */}
          <span style={{display: 'none'}} className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_5px_rgba(27,193,211,0.5)]">
            <span className="text-cyan-400">ICED</span><br/><span className="-mt-2 block">SKINS</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-base font-bold text-gray-200">
          <button className="flex items-center hover:text-white transition-colors group">
            <Percent className="w-5 h-5 mr-2 text-cyan-400 group-hover:text-white" /> Promoções
          </button>
          <button className="flex items-center hover:text-white transition-colors group">
            <Gift className="w-5 h-5 mr-2 text-cyan-400 group-hover:text-white" /> Sorteios
          </button>
          <button className="flex items-center hover:text-white transition-colors group">
            <Handshake className="w-5 h-5 mr-2 text-cyan-400 group-hover:text-white" /> Parceiros
          </button>
          <button onClick={() => window.open('https://discordapp.com/channels/1076120122864967712/1120531145206014032', '_blank')} className="flex items-center hover:text-white transition-colors group">
            <HelpCircle className="w-5 h-5 mr-2 text-cyan-400 group-hover:text-white" /> Ajuda
          </button>
        </nav>
      </div>
      <div className="flex items-center space-x-5">
        <div className="relative hidden lg:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input 
            type="text" 
            placeholder="Buscar skins..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1a2b44] border border-[#2d4a70] rounded-full py-2 pl-10 pr-4 w-72 text-base outline-none focus:border-cyan-400 focus:bg-[#203655] transition-all shadow-lg text-white" 
          />
        </div>
        <button onClick={() => window.open('https://discord.gg/WmGKnd7pe9', '_blank')} className="bg-[#5865F2] hover:bg-[#4752C4] px-5 py-2 rounded-md font-bold text-base flex items-center shadow-lg text-white transition-colors">
          <img 
            src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" 
            alt="Discord" 
            className="w-5 h-5 mr-2 brightness-0 invert" 
          />
          Discord
        </button>
        <button onClick={() => isAdmin ? setCurrentView('admin') : setCurrentView('login')} className={`${isAdmin ? 'text-cyan-400' : 'text-gray-400'} hover:text-white p-2`}>
          {isAdmin ? 'PAINEL' : <Lock className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}