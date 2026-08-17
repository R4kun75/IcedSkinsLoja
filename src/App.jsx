import React, { useState, useEffect } from 'react';
import { auth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { SpeedInsights } from "@vercel/speed-insights/react";

// Componentes
import Header from './components/Header';
import Footer from './components/Footer';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [skins, setSkins] = useState([]);
  const [banners, setBanners] = useState([]);
  
  // NOVO: Estado da barra de pesquisa
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Ouvinte de Autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. Ouvinte de Dados
  useEffect(() => {
    const unsubsSkins = onSnapshot(collection(db, 'skins'), (snapshot) => {
      setSkins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubsBanners = onSnapshot(doc(db, 'configuracoes', 'homepage'), (docSnap) => {
      if (docSnap.exists()) setBanners(docSnap.data().banners || []);
    });

    return () => { unsubsSkins(); unsubsBanners(); };
  }, []);

  if (!authReady) return <div className="min-h-screen bg-[#080038] flex items-center justify-center text-cyan-400 font-black">CARREGANDO ICEDSKINS...</div>;

  return (
    <div className="min-h-screen bg-[#0b121e]">
      {/* Passamos o searchTerm para o Header poder digitar */}
      {currentView !== 'login' && <Header isAdmin={isAdmin} setCurrentView={setCurrentView} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
      
      {/* Passamos o searchTerm para a Home poder filtrar */}
      {currentView === 'home' && <Home skins={skins} banners={banners} searchTerm={searchTerm} />}
      {currentView === 'login' && <Login setCurrentView={setCurrentView} />}
      {currentView === 'admin' && <Admin skins={skins} banners={banners} setCurrentView={setCurrentView} />}

      {currentView !== 'login' && <Footer isAdmin={isAdmin} setCurrentView={setCurrentView} />}
      <SpeedInsights />
    </div>
  );
}