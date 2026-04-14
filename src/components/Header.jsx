import React from 'react';
import { Search, HelpCircle, Gift, Percent, Handshake, MessageSquare, Lock } from 'lucide-react';

export default function Header({ isAdmin, setCurrentView }) {
  return (
    <header className="bg-gradient-to-r from-[#0A3F74] to-[#080038] border-b border-[#1a2b44] py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-xl">
      <div className="flex items-center space-x-10">
        <div className="cursor-pointer" onClick={() => setCurrentView('home')}>
          <span className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_5px_rgba(27,193,211,0.5)]">
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
          <button className="flex items-center hover:text-white transition-colors group">
            <HelpCircle className="w-5 h-5 mr-2 text-cyan-400 group-hover:text-white" /> Ajuda
          </button>
        </nav>
      </div>
      <div className="flex items-center space-x-5">
        <div className="relative hidden lg:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input type="text" placeholder="Buscar skins..." className="bg-[#1a2b44] border border-[#2d4a70] rounded-full py-2 pl-10 pr-4 w-72 text-base outline-none focus:border-cyan-400 focus:bg-[#203655] transition-all shadow-lg text-white" />
        </div>
        <button onClick={() => window.open('https://discord.gg/WmGKnd7pe9', '_blank')} className="bg-[#5865F2] hover:bg-[#4752C4] px-5 py-2 rounded-md font-bold text-base flex items-center shadow-lg text-white transition-colors">
          <MessageSquare className="w-5 h-5 mr-2" /> Discord
        </button>
        <button onClick={() => isAdmin ? setCurrentView('admin') : setCurrentView('login')} className={`${isAdmin ? 'text-cyan-400' : 'text-gray-400'} hover:text-white p-2`}>
          {isAdmin ? 'PAINEL' : <Lock className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}