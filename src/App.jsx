import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { dispararEventoGA } from './analytics';

// Componentes
import Header from './components/Header';
import Footer from './components/Footer';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Promocoes from './pages/Promocoes';
import Parceiros from './pages/Parceiros';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [skins, setSkins] = useState([]);
  const [banners, setBanners] = useState([]);
  
  // Estado da barra de pesquisa
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispararEventoGA('page_view', {
      page_title: currentView.toUpperCase(),
      page_location: window.location.href,
      page_path: `/${currentView}`
    });
  }, [currentView]);

  // 1. Ouvinte de Autenticação do Supabase
  useEffect(() => {
    // Verifica se já existe um usuário logado ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session?.user);
      setAuthReady(true);
    });

    // Fica escutando as mudanças (quando faz login ou logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Busca de Dados do Supabase
  const fetchDados = async () => {
    const { data: skinsData } = await supabase.from('skins').select('*');
    if (skinsData) setSkins(skinsData);

    const { data: bannersData } = await supabase.from('configuracoes').select('banners').eq('id', 'homepage').single();
    if (bannersData) setBanners(bannersData.banners || []);
  };

  useEffect(() => {
    fetchDados();
  }, []);

  // Tela de carregamento enquanto verifica o login
  if (!authReady) {
    return <div className="min-h-screen bg-[#080038] flex items-center justify-center text-cyan-400 font-black">CARREGANDO ICEDSKINS...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0b121e]">
      {/* Passamos o searchTerm para o Header poder digitar */}
      {currentView !== 'login' && <Header isAdmin={isAdmin} setCurrentView={setCurrentView} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
      
      {/* Rotas de Visualização (Views) */}
      {currentView === 'home' && <Home skins={skins} banners={banners} searchTerm={searchTerm} />}
      {currentView === 'promocoes' && <Promocoes skins={skins} />}
      {currentView === 'parceiros' && <Parceiros />}
      {currentView === 'login' && <Login setCurrentView={setCurrentView} />}
      {currentView === 'admin' && <Admin skins={skins} banners={banners} setCurrentView={setCurrentView} fetchDados={fetchDados} />}

      {currentView !== 'login' && <Footer isAdmin={isAdmin} setCurrentView={setCurrentView} />}

      {/* Ferramentas da Vercel */}
      <SpeedInsights />
      <Analytics />
    </div>
  );
}