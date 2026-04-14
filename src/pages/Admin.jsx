import React, { useState } from 'react';
import { LogOut, Plus, Trash2, Pencil, Image as ImageIcon, Lock } from 'lucide-react';
import { db, auth } from '../config/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Admin({ skins, banners, setCurrentView }) {
  const [editingId, setEditingId] = useState(null);
  const [newSkin, setNewSkin] = useState({
    weapon: '', name: '', condition: 'Factory-New', image: '', steamPrice: '', price: '', float: 0, pattern: 0, buyLink: ''
  });
  const [newBanner, setNewBanner] = useState('');

  const formatCurrency = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
      const id = url.split('/').pop();
      return `https://i.imgur.com/${id}.png`;
    }
    return url;
  };

  const handleSaveSkin = async (e) => {
    e.preventDefault();
    const data = { ...newSkin, 
      image: formatImageUrl(newSkin.image),
      price: parseFloat(newSkin.price), 
      steamPrice: parseFloat(newSkin.steamPrice), 
      float: parseFloat(newSkin.float), 
      pattern: parseInt(newSkin.pattern) 
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, 'skins', editingId), data);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'skins'), data);
      }
      setNewSkin({ weapon: '', name: '', condition: 'Factory-New', image: '', steamPrice: '', price: '', float: 0, pattern: 0, buyLink: '' });
    } catch (err) { alert("Erro ao salvar! Verifique as permissões da base de dados."); }
  };

  const handleRemoveSkin = async (id) => {
    if (confirm("Apagar item permanentemente?")) await deleteDoc(doc(db, 'skins', id));
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!newBanner) return;
    const formattedUrl = formatImageUrl(newBanner);
    const newList = [...banners, formattedUrl];
    await setDoc(doc(db, 'configuracoes', 'homepage'), { banners: newList }, { merge: true });
    setNewBanner('');
  };

  const handleRemoveBanner = async (idx) => {
    const newList = banners.filter((_, i) => i !== idx);
    await setDoc(doc(db, 'configuracoes', 'homepage'), { banners: newList }, { merge: true });
  };

  return (
    <div className="max-w-7xl mx-auto p-8 text-white">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-cyan-400 flex items-center italic"><Lock className="mr-3" /> PAINEL ADMINISTRATIVO</h1>
        <button onClick={() => { signOut(auth); setCurrentView('home'); }} className="flex items-center text-red-500 font-bold hover:bg-red-500/10 px-5 py-2 rounded-lg border border-red-500/30 transition-colors">
          <LogOut className="mr-2 w-5 h-5"/> ENCERRAR SESSÃO
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="space-y-8 lg:col-span-1">
          
          {/* Formulário de Skins */}
          <div className="bg-[#132032] border border-[#1e324c] p-6 rounded-xl shadow-2xl">
            <h2 className="font-bold text-lg mb-6 flex items-center text-cyan-400"><Plus className="mr-2"/> {editingId ? 'EDITAR' : 'NOVO'} ITEM</h2>
            <form onSubmit={handleSaveSkin} className="space-y-4">
              <input type="text" placeholder="Arma (ex: AK-47)..." value={newSkin.weapon} onChange={e => setNewSkin({...newSkin, weapon: e.target.value})} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
              <input type="text" placeholder="Nome (ex: Linha Vermelha)..." value={newSkin.name} onChange={e => setNewSkin({...newSkin, name: e.target.value})} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
              <div className="grid grid-cols-2 gap-4">
                <select value={newSkin.condition} onChange={e => setNewSkin({...newSkin, condition: e.target.value})} className="bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400">
                  <option>Factory-New</option><option>Minimal-Wear</option><option>Field-Tested</option><option>Well-Worn</option><option>Battle-Scarred</option>
                </select>
                <input type="number" placeholder="Pattern..." value={newSkin.pattern} onChange={e => setNewSkin({...newSkin, pattern: e.target.value})} className="bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
              </div>
              <input type="number" step="0.000000001" placeholder="Float (0 a 1)..." value={newSkin.float} onChange={e => setNewSkin({...newSkin, float: e.target.value})} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Preço Steam..." value={newSkin.steamPrice} onChange={e => setNewSkin({...newSkin, steamPrice: e.target.value})} className="bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
                <input type="number" step="0.01" placeholder="Preço Loja..." value={newSkin.price} onChange={e => setNewSkin({...newSkin, price: e.target.value})} className="bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
              </div>
              <input type="url" placeholder="URL da Imagem..." value={newSkin.image} onChange={e => setNewSkin({...newSkin, image: e.target.value})} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" />
              <input type="url" placeholder="Link de Compra..." value={newSkin.buyLink} onChange={e => setNewSkin({...newSkin, buyLink: e.target.value})} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
              <button type="submit" className="w-full bg-cyan-500 py-3 rounded font-black hover:bg-cyan-400 text-black transition-all">
                {editingId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR NO BANCO'}
              </button>
              {editingId && (
                <button type="button" onClick={() => {setEditingId(null); setNewSkin({weapon:'',name:'',condition:'Factory-New',image:'',steamPrice:'',price:'',float:0,pattern:0,buyLink:''})}} className="w-full mt-2 text-xs text-gray-500 hover:text-white">Cancelar Edição</button>
              )}
            </form>
          </div>

          {/* Formulário de Banners (AGORA DE VOLTA!) */}
          <div className="bg-[#132032] border border-[#1e324c] p-6 rounded-xl shadow-2xl">
            <h2 className="font-bold text-lg mb-6 flex items-center text-cyan-400"><ImageIcon className="mr-2"/> GESTÃO DE BANNERS</h2>
            <form onSubmit={handleAddBanner} className="flex gap-2 mb-6">
              <input type="url" placeholder="Colar URL do banner..." value={newBanner} onChange={e => setNewBanner(e.target.value)} className="flex-1 bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
              <button type="submit" className="bg-cyan-500 p-3 rounded hover:bg-cyan-400 text-black transition-colors"><Plus/></button>
            </form>
            <div className="space-y-3 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
              {banners.map((b, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-[#1e324c]">
                  <span className="text-[10px] text-gray-400 truncate w-40" title={b}>{b}</span>
                  <button onClick={() => handleRemoveBanner(i)} className="text-red-500 hover:text-white transition-colors p-1"><Trash2 size={16}/></button>
                </div>
              ))}
              {banners.length === 0 && <p className="text-xs text-gray-500 text-center italic">Nenhum banner ativo.</p>}
            </div>
          </div>

        </div>

        {/* Tabela de Skins */}
        <div className="lg:col-span-2 bg-[#132032] border border-[#1e324c] rounded-xl p-8 shadow-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-[#1e324c] tracking-widest font-black">
                <th className="pb-6">PRODUTO</th>
                <th className="pb-6">PREÇO</th>
                <th className="pb-6 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {skins.map(s => (
                <tr key={s.id} className="border-b border-[#1e324c]/30 hover:bg-cyan-500/5 transition-colors">
                  <td className="py-5 flex items-center">
                    <img src={s.image} className="w-12 h-12 object-contain mr-4 bg-black/20 p-1 rounded" onError={(e) => e.target.src = 'https://placehold.co/300x200/080038/ef4444?text=Imagem+Indisponivel'} alt="skin" />
                    <div><p className="font-black text-white">{s.weapon}</p><p className="text-[11px] text-cyan-400">{s.name}</p></div>
                  </td>
                  <td className="py-5"><p className="text-cyan-400 font-black">{formatCurrency(s.price)}</p></td>
                  <td className="py-5 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => {setNewSkin({...s}); setEditingId(s.id); window.scrollTo({top: 0, behavior: 'smooth'})}} className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition-all" title="Editar"><Pencil size={18}/></button>
                    <button onClick={() => handleRemoveSkin(s.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Remover"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
              {skins.length === 0 && <tr><td colSpan="3" className="py-20 text-center text-gray-500 italic font-bold">O banco de dados de skins está vazio.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}