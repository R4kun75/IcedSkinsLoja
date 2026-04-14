import React, { useState, useEffect } from 'react';
import { 
  Search, HelpCircle, Gift, Percent, Handshake, MessageSquare,
  ChevronRight, ChevronLeft, Lock, LogOut, Plus, Trash2, ExternalLink,
  Pencil, Image as ImageIcon, ImageOff 
} from 'lucide-react';

// === IMPORTAÇÕES DO FIREBASE ===
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

// ============================================================================
// ⚠️ COLE AS SUAS CREDENCIAIS DO FIREBASE AQUI (Copie do site do Firebase) ⚠️
// ============================================================================
const localFirebaseConfig = {
  apiKey: "AIzaSyBRlA5tsvvrGub1dXnPdnt91H0-LlTP5TA",
  authDomain: "icedskins-ac654.firebaseapp.com",
  projectId: "icedskins-ac654",
  storageBucket: "icedskins-ac654.firebasestorage.app",
  messagingSenderId: "919518701360",
  appId: "1:919518701360:web:e40919e838511706030af5",
  measurementId: "G-PTYY6LGQSJ"
};

// Inicialização segura
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : localFirebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'iced-skins-local';

// --- FUNÇÃO AUXILIAR PARA IMAGENS ---
const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.match(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/)) {
    const id = url.split('/').pop();
    return `https://i.imgur.com/${id}.png`;
  }
  return url;
};

const FALLBACK_IMAGE = 'https://placehold.co/300x200/132032/ef4444?text=Erro+na+Imagem';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  
  const [skins, setSkins] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loginError, setLoginError] = useState('');

  const [currentBanner, setCurrentBanner] = useState(0);
  const [newBanner, setNewBanner] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [newSkin, setNewSkin] = useState({
    weapon: '', name: '', condition: 'Field-Tested', image: '', steamPrice: '', price: '', float: '', pattern: '', buyLink: ''
  });

  // ==========================================
  // 1. AUTENTICAÇÃO COM O FIREBASE (CORRIGIDA)
  // ==========================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          // Garante que TODOS os visitantes tenham uma sessão anônima para poder ler o banco
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Erro na autenticação:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Salva o usuário no estado
      if (currentUser && !currentUser.isAnonymous) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ==========================================
  // 2. BUSCAR DADOS (ESPERA O USUÁRIO EXISTIR)
  // ==========================================
  useEffect(() => {
    // ⚠️ REGRA CRÍTICA: Só tenta ler do Firestore SE tivermos um usuário (mesmo anônimo) 

    // Ouve a coleção de Skins
    const skinsRef = collection(db, 'artifacts', appId, 'public', 'data', 'skins');
    const unsubsSkins = onSnapshot(skinsRef, (snapshot) => {
      const loadedSkins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSkins(loadedSkins);
    }, (error) => console.error("Erro ao carregar skins:", error));

    // Ouve o documento de Banners
    const settingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'settings');
    const unsubsBanners = onSnapshot(settingsRef, (snapshot) => {
      const homeDoc = snapshot.docs.find(d => d.id === 'homepage');
      if (homeDoc && homeDoc.data().banners) {
        setBanners(homeDoc.data().banners);
      } else {
        setBanners([]); 
      }
    }, (error) => console.error("Erro ao carregar banners:", error));

    return () => {
      unsubsSkins();
      unsubsBanners();
    };
  }, []); // 👈 A dependência [user] é o que faz os itens aparecerem após o F5

  // ==========================================
  // FUNÇÕES DE ADMINISTRAÇÃO E BANCO
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;
    
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setCurrentView('admin');
      setLoginError('');
    } catch (error) {
      setLoginError('E-mail ou senha incorretos.');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    await signInAnonymously(auth);
    setCurrentView('home');
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (newBanner && user) {
      const formattedUrl = formatImageUrl(newBanner);
      const newBannersArray = [...banners, formattedUrl];
      
      const homeDoc = doc(collection(db, 'artifacts', appId, 'public', 'data', 'settings'), 'homepage');
      await setDoc(homeDoc, { banners: newBannersArray }, { merge: true });
      
      setNewBanner('');
    }
  };

  const handleRemoveBanner = async (index) => {
    if(!user) return;
    const newBannersArray = banners.filter((_, i) => i !== index);
    const homeDoc = doc(collection(db, 'artifacts', appId, 'public', 'data', 'settings'), 'homepage');
    await setDoc(homeDoc, { banners: newBannersArray }, { merge: true });
    
    if (currentBanner >= newBannersArray.length) {
      setCurrentBanner(Math.max(0, newBannersArray.length - 1));
    }
  };

  const handleSaveSkin = async (e) => {
    e.preventDefault();
    if(!user) return;
    
    const formattedImage = formatImageUrl(newSkin.image) || `https://placehold.co/300x200/132032/FFFFFF?text=${newSkin.weapon}`;
    const skinsCol = collection(db, 'artifacts', appId, 'public', 'data', 'skins');

    const skinDataToSave = {
      weapon: newSkin.weapon,
      name: newSkin.name,
      condition: newSkin.condition,
      conditionColor: 'text-purple-400', 
      image: formattedImage,
      steamPrice: parseFloat(newSkin.steamPrice),
      price: parseFloat(newSkin.price),
      float: parseFloat(newSkin.float),
      pattern: parseInt(newSkin.pattern, 10),
      buyLink: newSkin.buyLink
    };

    try {
      if (editingId) {
        await updateDoc(doc(skinsCol, editingId), skinDataToSave);
        handleCancelEdit();
      } else {
        await addDoc(skinsCol, skinDataToSave);
        setNewSkin({ weapon: '', name: '', condition: 'Field-Tested', image: '', steamPrice: '', price: '', float: '', pattern: '', buyLink: '' });
      }
    } catch (error) {
      console.error("Erro ao salvar skin:", error);
      alert("Erro ao salvar. Verifique se o Firestore está no Modo de Teste.");
    }
  };

  const handleRemoveSkin = async (id) => {
    if(!user) return;
    if(window.confirm("Tem certeza que deseja remover esta skin?")) {
      try {
        const skinsCol = collection(db, 'artifacts', appId, 'public', 'data', 'skins');
        await deleteDoc(doc(skinsCol, id));
      } catch (error) {
        console.error("Erro ao remover skin:", error);
      }
    }
  };

  const handleEditSkin = (skin) => {
    setNewSkin({
      weapon: skin.weapon,
      name: skin.name,
      condition: skin.condition,
      image: skin.image,
      steamPrice: skin.steamPrice,
      price: skin.price,
      float: skin.float,
      pattern: skin.pattern || '',
      buyLink: skin.buyLink
    });
    setEditingId(skin.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewSkin({ weapon: '', name: '', condition: 'Field-Tested', image: '', steamPrice: '', price: '', float: '', pattern: '', buyLink: '' });
  };

  const goToStore = () => {
    window.open('https://discord.gg/WmGKnd7pe9', '_blank');
  };

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);


  // --- COMPONENTES VISUAIS ---
  const formatCurrency = (value) => {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const Header = () => (
    <header className="bg-gradient-to-r from-[#0A3F74] to-[#080038] border-b border-[#1a2b44] py-4 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-10">
        <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
          <span className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_5px_rgba(27,193,211,0.5)]">
            <span className="text-cyan-400">ICED</span><br className="hidden sm:block" /><span className="-mt-2 block">SKINS</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-base font-bold text-gray-200">
          <button className="flex items-center hover:text-white transition-colors group">
            <Percent className="w-5 h-5 mr-2 text-cyan-400 group-hover:text-white transition-colors" /> Promoções
          </button>
          <button className="flex items-center hover:text-white transition-colors group">
            <Gift className="w-5 h-5 mr-2 text-cyan-400 group-hover:text-white transition-colors" /> Sorteios
          </button>
          <button className="flex items-center hover:text-white transition-colors group">
            <Handshake className="w-5 h-5 mr-2 text-cyan-400 group-hover:text-white transition-colors" /> Parceiros
          </button>
          <button className="flex items-center hover:text-white transition-colors group">
            <HelpCircle className="w-5 h-5 mr-2 text-cyan-400 group-hover:text-white transition-colors" /> Ajuda
          </button>
        </nav>
      </div>

      <div className="flex items-center space-x-5">
        <div className="relative hidden lg:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
          <input 
            type="text" 
            placeholder="Buscar skins..."
            className="bg-[#1a2b44] border border-[#2d4a70] rounded-full py-2 pl-10 pr-4 text-base text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-[#203655] w-72 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
          />
        </div>
        
        <button onClick={goToStore} className="flex items-center bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-2 rounded-md font-bold text-base transition-colors shadow-lg">
          <MessageSquare className="w-5 h-5 mr-2" /> Discord
        </button>

        {isAdmin ? (
          <button onClick={() => setCurrentView('admin')} className="text-cyan-400 hover:text-white flex items-center ml-2 p-2">
            Painel Admin
          </button>
        ) : (
          <button onClick={() => setCurrentView('login')} className="text-gray-400 hover:text-white flex items-center ml-2 p-2" title="Login Admin">
            <Lock className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );

  const Footer = () => (
    <footer className="bg-[#051F38] border-t border-[#1a2b44] mt-12 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <span className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_0_5px_rgba(27,193,211,0.5)]">
            <span className="text-cyan-400">ICED</span><br /><span className="-mt-2 block">SKINS</span>
          </span>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 text-lg">Informações</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Feedback</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">Parceiros</a></li>
            <li><a href="#" className="hover:text-cyan-400 transition-colors">F.A.Q.</a></li>
            {!isAdmin && <li><button onClick={() => setCurrentView('login')} className="hover:text-cyan-400 transition-colors">Acesso Restrito (Admin)</button></li>}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 text-lg">Formas de Pagamento</h4>
          <div className="flex flex-wrap gap-3 items-center">
             <div className="bg-white px-2 py-1 rounded text-xs font-bold text-green-600">PicPay</div>
             <div className="bg-white px-2 py-1 rounded text-xs font-bold text-blue-800 italic">VISA</div>
             <div className="bg-white px-2 py-1 rounded text-xs font-bold flex"><span className="text-red-500">master</span><span className="text-yellow-500">card</span></div>
          </div>
        </div>
        <div>
          <div className="flex space-x-4 mt-6 md:mt-0 justify-start md:justify-end text-gray-400">
            <div className="w-8 h-8 rounded-full bg-[#142235] flex items-center justify-center hover:bg-cyan-500 hover:text-white cursor-pointer transition-all">S</div>
            <div className="w-8 h-8 rounded-full bg-[#142235] flex items-center justify-center hover:bg-cyan-500 hover:text-white cursor-pointer transition-all">I</div>
            <div className="w-8 h-8 rounded-full bg-[#142235] flex items-center justify-center hover:bg-cyan-500 hover:text-white cursor-pointer transition-all">W</div>
            <div className="w-8 h-8 rounded-full bg-[#142235] flex items-center justify-center hover:bg-cyan-500 hover:text-white cursor-pointer transition-all">X</div>
            <div className="w-8 h-8 rounded-full bg-[#142235] flex items-center justify-center hover:bg-cyan-500 hover:text-white cursor-pointer transition-all">D</div>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-600 mt-12">
        <p>Copyright © 2026 IcedSkins todos os direitos reservados.</p>
        <p>CNPJ: 11.111.111/1111-11 A IcedSkins não possui nenhum vínculo com a Valve.</p>
      </div>
    </footer>
  );

  const SkinCard = ({ skin }) => {
    const floatPercentage = Math.min(Math.max((skin.float || 0) * 100, 0), 100);

    return (
      <div className="bg-gradient-to-b from-[#0A3F74] to-[#080038] border border-[#1e324c] rounded-lg overflow-hidden flex flex-col hover:border-cyan-400 hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(27,193,211,0.3)] transition-all duration-300">
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-white font-bold text-sm text-center leading-tight">
            {skin.weapon} | {skin.name}
          </h3>
          <p className={`text-xs text-center mt-1 ${skin.conditionColor || 'text-purple-400'}`}>{skin.condition}</p>
          
          <div className="flex-grow flex items-center justify-center my-6">
            <img 
              src={skin.image} 
              alt={`${skin.weapon} ${skin.name}`} 
              className="max-h-32 object-contain drop-shadow-2xl"
              onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
            />
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-400 text-xs line-through">
              {formatCurrency(skin.steamPrice)} <br/> Preço Steam
            </p>
            <p className="text-white text-2xl font-black mt-1">
              {formatCurrency(skin.price)}
            </p>
          </div>

          <div className="w-full px-2 mb-4 relative">
            <div 
              className="absolute top-[-14px] text-white text-[10px]" 
              style={{ left: `calc(${floatPercentage}% - 5px)` }}
            >
              ▼
            </div>
            <div className="h-2 w-full flex rounded overflow-hidden mt-1">
              <div className="h-full bg-green-500" style={{width: '20%'}}></div>
              <div className="h-full bg-lime-400" style={{width: '20%'}}></div>
              <div className="h-full bg-yellow-400" style={{width: '20%'}}></div>
              <div className="h-full bg-orange-500" style={{width: '20%'}}></div>
              <div className="h-full bg-red-600" style={{width: '20%'}}></div>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <p className="text-[10px] text-gray-400">Float: {skin.float !== undefined ? Number(skin.float).toFixed(9) : '0'}</p>
              <p className="text-[10px] text-gray-400 font-bold">Pattern: <span className="text-cyan-400">{skin.pattern}</span></p>
            </div>
          </div>
        </div>
        
        <div className="p-4 pt-0">
          <button 
            onClick={() => window.open(skin.buyLink, '_blank')}
            className="w-full bg-[#1bc1d3] hover:bg-[#16a1b0] text-white font-bold py-2.5 rounded text-sm transition-colors shadow-[0_0_15px_rgba(27,193,211,0.3)]"
          >
            IR PARA COMPRA
          </button>
        </div>
      </div>
    );
  };

  const HomeView = () => (
    <main className="min-h-screen">
      <div className="w-full bg-[#070b12] relative overflow-hidden h-[300px] flex items-center justify-center group">
        {banners.length > 0 ? (
          <img 
            src={banners[currentBanner]} 
            alt="Banner" 
            className="w-full h-full object-cover opacity-90 transition-opacity duration-500"
            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
          />
        ) : (
          <div className="text-gray-500 font-bold">Nenhum banner ativo. Os administradores podem adicionar no painel.</div>
        )}
        
        {banners.length > 1 && (
          <div className="absolute inset-0 z-10 flex items-center justify-between w-full px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button onClick={prevBanner} className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 backdrop-blur"><ChevronLeft /></button>
             <button onClick={nextBanner} className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 backdrop-blur"><ChevronRight /></button>
          </div>
        )}

        {banners.length > 1 && (
          <div className="absolute bottom-4 flex space-x-2 z-10">
             {banners.map((_, idx) => (
               <button 
                 key={idx} 
                 onClick={() => setCurrentBanner(idx)} 
                 className={`w-8 h-1.5 rounded-full transition-colors ${idx === currentBanner ? 'bg-cyan-400' : 'bg-white/30 hover:bg-white/50'}`}
               ></button>
             ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-[#0A3F74] to-[#080038] border border-[#1e324c] rounded-lg p-2 flex flex-wrap items-center justify-center gap-2 md:gap-6 mb-8 text-sm font-bold text-gray-300 shadow-md">
          <button className="hover:text-cyan-400 py-2 px-3 transition-colors">ESPECIAIS</button>
          <button className="hover:text-cyan-400 py-2 px-3 transition-colors">FACAS</button>
          <button className="hover:text-cyan-400 py-2 px-3 transition-colors">LUVAS</button>
          <button className="hover:text-cyan-400 py-2 px-3 transition-colors">ESCOPETAS</button>
          <button className="hover:text-cyan-400 py-2 px-3 transition-colors">PISTOLAS</button>
          <button className="hover:text-cyan-400 py-2 px-3 transition-colors">RIFLE</button>
          <button className="hover:text-cyan-400 py-2 px-3 transition-colors">RIFLE DE PRECISÃO</button>
          <button className="hover:text-cyan-400 py-2 px-3 transition-colors">SUBMETRALHADORA</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pt-4">
          {skins.map(skin => (
            <SkinCard key={skin.id} skin={skin} />
          ))}
          {skins.length === 0 && (
             <div className="col-span-full text-center py-20 text-gray-500">
                Catálogo vazio ou carregando banco de dados...
             </div>
          )}
        </div>
      </div>
    </main>
  );

  const LoginView = () => (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b121e] to-[#05080e]">
      <div className="bg-[#111d2e] border border-[#1e324c] p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-white text-2xl font-bold text-center mb-8 uppercase tracking-widest">Login Admin</h2>
        
        {loginError && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded mb-6 text-sm text-center">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input 
              type="email" 
              name="email"
              placeholder="E-mail de administrador..." 
              required
              className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder-gray-600"
            />
          </div>
          <div>
            <input 
              type="password" 
              name="password"
              placeholder="Senha..." 
              required
              className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder-gray-600"
            />
          </div>
          <p className="text-xs text-gray-500 text-center">Use os dados criados no painel do Firebase</p>
          <button 
            type="submit" 
            className="w-full bg-[#1bc1d3] hover:bg-[#16a1b0] text-white font-bold py-3 rounded transition-colors shadow-[0_0_15px_rgba(27,193,211,0.3)] mt-4"
          >
            ENTRAR NO SISTEMA
          </button>
        </form>
        <button 
          onClick={() => setCurrentView('home')} 
          className="w-full mt-4 text-gray-400 hover:text-white text-sm"
        >
          Voltar para a loja
        </button>
      </div>
    </main>
  );

  const AdminView = () => {
    if (!isAdmin) {
      setCurrentView('login');
      return null;
    }

    return (
      <main className="min-h-screen bg-[#0b121e] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Lock className="mr-3 text-cyan-400" /> Painel de Administração (Conectado à Nuvem)
            </h1>
            <button 
              onClick={handleLogout}
              className="flex items-center bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded border border-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair do Painel
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="flex flex-col gap-8 lg:col-span-1">
              
              <div className="bg-[#132032] border border-[#1e324c] rounded-lg p-6 h-fit shadow-lg relative">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  {editingId ? (
                    <><Pencil className="mr-2 text-cyan-400" /> Editar Skin no Banco</>
                  ) : (
                    <><Plus className="mr-2 text-cyan-400" /> Salvar Nova Skin na Nuvem</>
                  )}
                </h2>
                <form onSubmit={handleSaveSkin} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Arma (ex: AK-47)</label>
                    <input type="text" value={newSkin.weapon} onChange={e => setNewSkin({...newSkin, weapon: e.target.value})} required className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nome da Skin (ex: Linha Vermelha)</label>
                    <input type="text" value={newSkin.name} onChange={e => setNewSkin({...newSkin, name: e.target.value})} required className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Condição</label>
                      <select value={newSkin.condition} onChange={e => setNewSkin({...newSkin, condition: e.target.value})} className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400">
                        <option>Factory-New</option>
                        <option>Minimal-Wear</option>
                        <option>Field-Tested</option>
                        <option>Well-Worn</option>
                        <option>Battle-Scarred</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Pattern (1 a 999)</label>
                      <input type="number" step="1" min="1" max="999" value={newSkin.pattern} onChange={e => setNewSkin({...newSkin, pattern: e.target.value})} required className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Float (0 a 1)</label>
                      <input type="number" step="0.000000001" min="0" max="1" value={newSkin.float} onChange={e => setNewSkin({...newSkin, float: e.target.value})} required className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Preço Steam (R$)</label>
                      <input type="number" step="0.01" value={newSkin.steamPrice} onChange={e => setNewSkin({...newSkin, steamPrice: e.target.value})} required className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Preço Loja (R$)</label>
                      <input type="number" step="0.01" value={newSkin.price} onChange={e => setNewSkin({...newSkin, price: e.target.value})} required className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">URL da Imagem (Opcional)</label>
                      <input type="url" value={newSkin.image} onChange={e => setNewSkin({...newSkin, image: e.target.value})} placeholder="https://i.imgur.com/..." className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Link de Compra</label>
                    <input type="url" value={newSkin.buyLink} onChange={e => setNewSkin({...newSkin, buyLink: e.target.value})} required className="w-full bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400" />
                  </div>
                  
                  <div className="pt-2 flex gap-2">
                    <button type="submit" className="flex-1 bg-[#1bc1d3] hover:bg-[#16a1b0] text-white font-bold py-2 rounded transition-colors shadow-lg">
                      {editingId ? 'Salvar Edição no Banco' : 'Enviar para o Banco'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors shadow-lg">
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-[#132032] border border-[#1e324c] rounded-lg p-6 h-fit shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <ImageIcon className="mr-2 text-cyan-400" /> Banners (Sincronizados)
                </h2>
                <form onSubmit={handleAddBanner} className="flex gap-2 mb-4">
                  <input 
                    type="url" 
                    value={newBanner} 
                    onChange={e => setNewBanner(e.target.value)} 
                    placeholder="Cole o link da imagem..." 
                    required 
                    className="flex-1 bg-[#0a1018] border border-[#1e324c] rounded p-2 text-white text-sm focus:border-cyan-400" 
                  />
                  <button type="submit" className="bg-[#1bc1d3] hover:bg-[#16a1b0] text-white p-2 rounded transition-colors shadow-lg" title="Adicionar Banner">
                    <Plus className="w-5 h-5" />
                  </button>
                </form>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {banners.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#0a1018] p-2 rounded border border-[#1e324c]">
                      <span className="text-xs text-gray-400 truncate w-48" title={url}>{url}</span>
                      <button onClick={() => handleRemoveBanner(idx)} className="text-red-500 hover:text-red-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {banners.length === 0 && <p className="text-xs text-gray-500 text-center">Nenhum banner no banco de dados.</p>}
                </div>
              </div>

            </div>

            <div className="bg-[#132032] border border-[#1e324c] rounded-lg p-6 lg:col-span-2 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">Skins no Banco de Dados ({skins.length})</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e324c] text-gray-400 text-xs uppercase">
                      <th className="pb-3 pl-2">Item</th>
                      <th className="pb-3">Condição</th>
                      <th className="pb-3">Preço</th>
                      <th className="pb-3 text-right pr-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skins.map(skin => (
                      <tr key={skin.id} className="border-b border-[#1e324c]/50 hover:bg-[#1a2b44] transition-colors">
                        <td className="py-3 pl-2 flex items-center">
                          <img 
                            src={skin.image} 
                            alt="skin" 
                            className="w-12 h-8 object-contain mr-3 bg-[#0a1018] rounded"
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                          />
                          <div>
                            <p className="text-white text-sm font-bold">{skin.weapon}</p>
                            <p className="text-gray-400 text-xs">{skin.name}</p>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-300">
                           {skin.condition} <br/>
                           <span className="text-[10px] text-gray-500">Float: {skin.float}</span><br/>
                           <span className="text-[10px] text-gray-500">Pattern: {skin.pattern}</span>
                        </td>
                        <td className="py-3">
                          <p className="text-cyan-400 font-bold text-sm">{formatCurrency(skin.price)}</p>
                          <p className="text-gray-500 text-xs line-through">{formatCurrency(skin.steamPrice)}</p>
                        </td>
                        <td className="py-3 text-right pr-2 space-x-2 whitespace-nowrap">
                          <button onClick={() => window.open(skin.buyLink, '_blank')} className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 inline-block" title="Testar Link">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditSkin(skin)} className="p-2 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500/20 inline-block" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleRemoveSkin(skin.id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 inline-block" title="Remover">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {skins.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500">
                          O banco de dados está vazio. Comece a adicionar skins!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b121e] font-sans selection:bg-cyan-500 selection:text-white">
      {currentView !== 'login' && <Header />}
      
      {currentView === 'home' && <HomeView />}
      {currentView === 'login' && <LoginView />}
      {currentView === 'admin' && <AdminView />}

      {currentView !== 'login' && <Footer />}
    </div>
  );
}