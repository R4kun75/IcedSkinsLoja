import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login({ setCurrentView }) {
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setCurrentView('admin');
    } catch (err) {
      setError('E-mail ou senha de administrador inválidos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080038] text-white">
      <div className="bg-[#111d2e] border border-cyan-500/30 p-10 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <h2 className="text-2xl font-black mb-8 text-cyan-400 uppercase tracking-widest">Acesso Restrito</h2>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 text-xs p-3 rounded mb-6">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <input type="email" name="email" placeholder="E-mail de admin..." className="w-full bg-black/40 border border-[#1e324c] rounded-lg p-3 outline-none focus:border-cyan-400" required />
          <input type="password" name="password" placeholder="Senha..." className="w-full bg-black/40 border border-[#1e324c] rounded-lg p-3 outline-none focus:border-cyan-400" required />
          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-3 rounded-lg mt-4 transition-all uppercase">Entrar no Painel</button>
        </form>
        <button onClick={() => setCurrentView('home')} className="mt-6 text-gray-500 hover:text-white text-sm">Voltar à loja</button>
      </div>
    </div>
  );
}