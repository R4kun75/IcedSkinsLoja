import React, { useState, useEffect } from 'react';
import { auth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot } from 'firebase/firestore';

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

  // 1. Ouvinte de Autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. Ouvinte de Dados (Skins e Banners)
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
      {currentView !== 'login' && <Header isAdmin={isAdmin} setCurrentView={setCurrentView} />}
      
      {currentView === 'home' && <Home skins={skins} banners={banners} />}
      {currentView === 'login' && <Login setCurrentView={setCurrentView} />}
      {currentView === 'admin' && <Admin skins={skins} banners={banners} setCurrentView={setCurrentView} />}

      {currentView !== 'login' && <Footer isAdmin={isAdmin} setCurrentView={setCurrentView} />}
    </div>
  );
}