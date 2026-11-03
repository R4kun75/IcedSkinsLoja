import React from 'react';
import { Handshake } from 'lucide-react';

export default function Parceiros() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8">
        <Handshake className="w-10 h-10 text-cyan-400" />
        <h1 className="text-3xl font-black text-white tracking-wider">NOSSOS PARCEIROS</h1>
      </div>
      
      <div className="bg-[#132032] border border-[#1e324c] rounded-xl p-10 text-center shadow-xl">
        <p className="text-gray-400 font-bold text-lg">
          A lista dos nossos parceiros oficiais estará disponível aqui em breve.
        </p>
      </div>
    </div>
  );
}