import React from 'react';
import { ShieldCheck, Truck, Headphones, Lock } from 'lucide-react';

export default function Footer({ isAdmin, setCurrentView }) {
  return (
    <footer className="bg-[#070b12] border-t border-[#1a2b44] pt-16 pb-8 px-6 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          
          <div className="col-span-1 md:col-span-2">
            {/* LOGO DA EMPRESA NO RODAPÉ */}
            <img 
              src="/Logo.png" 
              alt="IcedSkins Logo" 
              className="h-16 w-auto object-contain scale-[1.9] origin-left mb-6 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback caso a logo não exista */}
            <span style={{display: 'none'}} className="text-2xl font-black italic tracking-tighter text-white mb-4 block opacity-50">
              <span className="text-cyan-400">ICED</span>SKINS
            </span>
            <p className="text-gray-500 max-w-sm mb-6">A plataforma mais segura e rápida para comprar e vender suas skins de Counter-Strike 2.</p>
            <div className="flex space-x-4 mt-4">
            {/* Link 1: Discord */}
            <a 
              href="https://discord.gg/WmGKnd7pe9" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#132032] w-11 h-11 rounded-full text-cyan-400 border border-[#1e324c] hover:bg-cyan-500 hover:text-black transition-all duration-300 hover:scale-110 flex items-center justify-center shadow-lg"
              title="Nosso Discord"
            >
              <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" alt="Discord" className="w-5 h-5 object-contain group-hover:brightness-0" />
            </a>

            {/* Link 2: Steam */}
            <a 
              href="https://steamcommunity.com/id/Icedskins1" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#132032] w-11 h-11 rounded-full text-cyan-400 border border-[#1e324c] hover:bg-cyan-500 hover:text-black transition-all duration-300 hover:scale-110 flex items-center justify-center shadow-lg"
              title="Grupo Steam"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" alt="Steam" className="w-5 h-5 object-contain" />
            </a>

            {/* Link 3: Instagram */}
            <a 
              href="https://www.instagram.com/icedskins1/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#132032] w-11 h-11 rounded-full text-cyan-400 border border-[#1e324c] hover:bg-cyan-500 hover:text-black transition-all duration-300 hover:scale-110 flex items-center justify-center shadow-lg"
              title="Nosso Instagram"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="w-5 h-5 object-contain" />
            </a>

            {/* Link 4: Twitter */}
            <a 
              href="https://x.com/IcedStorecs" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#132032] w-11 h-11 rounded-full text-cyan-400 border border-[#1e324c] hover:bg-cyan-500 hover:text-black transition-all duration-300 hover:scale-110 flex items-center justify-center shadow-lg"
              title="Nosso Twitter/X"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="Twitter" className="w-5 h-5 object-contain filter invert" />
            </a>
          </div>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 tracking-widest text-sm">LINKS ÚTEIS</h4>
            <ul className="space-y-3 font-bold">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Termos de Serviço</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">FAQ (Perguntas Frequentes)</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 tracking-widest text-sm">PAGAMENTOS</h4>
            {/* LOGOS DE PAGAMENTO AQUI */}
            <div className="flex flex-wrap gap-3">
              {/* Visa */}
              <div className="bg-[#132032] border border-[#1e324c] p-0 rounded flex items-center justify-center w-[72px] h-[44px]">
                <img src="https://logospng.org/download/visa/logo-visa-2048.png" alt="Visa" className="h-full w-full object-contain filter drop-shadow-md scale-150" />
              </div>
              {/* Mastercard */}
              <div className="bg-[#132032] border border-[#1e324c] p-2 rounded flex items-center justify-center w-[72px] h-[44px]">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-full w-full object-contain filter drop-shadow-md" />
              </div>
              {/* PicPay */}
             <div className="bg-[#132032] border border-[#1e324c] p-0 rounded flex items-center justify-center w-[72px] h-[44px]">
                <img src="https://logospng.org/download/picpay/logo-picpay-1024.png" alt="PicPay" className="h-full w-full object-contain filter brightness-110 scale-150" />
              </div>
              {/* Pix */}
              <div className="bg-[#132032] border border-[#1e324c] p-0 rounded flex items-center justify-center w-[72px] h-[44px]">
                <img src="https://logospng.org/download/pix/logo-pix-1024.png" alt="Pix" className="h-full w-full object-contain filter drop-shadow-md brightness-150 scale-150" />
              </div>
            </div>
            
            <p className="mt-6 text-xs text-gray-500 font-bold border-l-2 border-cyan-500 pl-3">   
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-[#1a2b44] pt-8 text-xs font-bold text-gray-600">
          <p>© {new Date().getFullYear()} ICEDSKINS. Todos os direitos reservados.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <button onClick={() => setCurrentView('login')} className="flex items-center hover:text-white transition-colors group">
              <Lock className="w-3 h-3 mr-1 text-gray-600 group-hover:text-cyan-400" />
              ÁREA RESTRITA
            </button>
            <p>Powered by R4kun75</p>
          </div>
        </div>


        
      </div>

      
    </footer>
  );
}