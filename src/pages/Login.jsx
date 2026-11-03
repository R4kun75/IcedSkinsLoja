import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import { Lock, ArrowLeft } from 'lucide-react';

export default function Login({ setCurrentView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError('Credenciais inválidas! Verifique o e-mail e a palavra-passe.');
      setLoading(false);
    } else {
      setCurrentView('admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b121e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#132032] border border-[#1e324c] rounded-xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-cyan-500/10 p-4 rounded-full">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white text-center mb-8 tracking-wider">ACESSO RESTRITO</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm text-center mb-6 font-bold">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="E-mail do Administrador" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-[#1e324c] text-white p-3 rounded text-sm outline-none focus:border-cyan-400" required />
          <input type="password" placeholder="Palavra-passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-[#1e324c] text-white p-3 rounded text-sm outline-none focus:border-cyan-400" required />
          <button type="submit" disabled={loading} className="w-full bg-cyan-500 py-3 rounded font-black hover:bg-cyan-400 text-black transition-all disabled:opacity-50">
            {loading ? 'A AUTENTICAR...' : 'ENTRAR NO PAINEL'}
          </button>
        </form>
        
        <button onClick={() => setCurrentView('home')} className="w-full mt-6 flex items-center justify-center text-sm text-gray-500 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar à Loja
        </button>
      </div>
    </div>
  );
}