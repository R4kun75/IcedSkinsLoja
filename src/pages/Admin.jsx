import React, { useState } from 'react';
import { LogOut, Plus, Trash2, Pencil, Image as ImageIcon, Lock, ArrowUp, ArrowDown, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../config/supabase';
import AdminPromocoes from './AdminPromocoes';
import AdminParceiros from './AdminParceiros';

export default function Admin({ skins, banners, setCurrentView, fetchDados }) {
  const [tipoImagem, setTipoImagem] = useState('upload'); 
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tipoBanner, setTipoBanner] = useState('upload');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('skins');
  
  const [newSkin, setNewSkin] = useState({
    weapon: '', name: '', condition: 'Factory-New', category: 'RIFLES', image: '', steamPrice: '', price: '', float: 0, pattern: 0, buyLink: ''
  });
  const [newBanner, setNewBanner] = useState('');

  // UPLOAD DE IMAGENS PARA O SUPABASE STORAGE
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '')}`;
      
      const { error: uploadError } = await supabase.storage.from('skins').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage.from('skins').getPublicUrl(fileName);
      setNewSkin((prev) => ({ ...prev, image: urlData.publicUrl }));
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao enviar a imagem. Verifique as permissões do Storage.");
    } finally {
      setUploading(false);
    }
  };

  // UPLOAD DE IMAGEM DO BANNER PARA O SUPABASE STORAGE
  const handleBannerFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const fileName = `banner_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '')}`;
      
      const { error: uploadError } = await supabase.storage.from('skins').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage.from('skins').getPublicUrl(fileName);
      setNewBanner(urlData.publicUrl);
    } catch (error) {
      console.error("Erro no upload do banner:", error);
      alert("Erro ao enviar a imagem do banner.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const formatCurrency = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
      const id = url.split('/').pop();
      return `https://i.imgur.com/${id}.png`;
    }
    return url;
  };

  // GUARDAR PRODUTO NO SUPABASE
  const handleSaveSkin = async (e) => {
    e.preventDefault();
    const skinData = { 
      weapon: newSkin.weapon, 
      name: newSkin.name, 
      condition: newSkin.condition, 
      category: newSkin.category, 
      image: formatImageUrl(newSkin.image), 
      steamPrice: parseFloat(newSkin.steamPrice), 
      price: parseFloat(newSkin.price), 
      float: parseFloat(newSkin.float), 
      pattern: parseInt(newSkin.pattern), 
      "buyLink": newSkin.buyLink 
    };
    
    try {
      if (editingId) {
        await supabase.from('skins').update(skinData).eq('id', editingId);
        setEditingId(null);
      } else {
        skinData.id = Date.now().toString(); 
        await supabase.from('skins').insert([skinData]);
      }
      setNewSkin({ weapon: '', name: '', condition: 'Factory-New', category: 'RIFLES', image: '', steamPrice: '', price: '', float: 0, pattern: 0, buyLink: '' });
      setTipoImagem('upload');
      fetchDados();
    } catch (err) { 
      alert("Erro ao guardar dados no Supabase!"); 
    }
  };

  const handleRemoveSkin = async (id) => {
    if (confirm("Apagar item permanentemente?")) {
      await supabase.from('skins').delete().eq('id', id);
      fetchDados();
    }
  };

  // GESTÃO DE BANNERS NO SUPABASE
  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!newBanner) return;
    const formattedUrl = formatImageUrl(newBanner);
    const newList = [...banners, formattedUrl];
    await supabase.from('configuracoes').upsert({ id: 'homepage', banners: newList });
    setNewBanner('');
  };

  const handleRemoveBanner = async (idx) => {
    const newList = banners.filter((_, i) => i !== idx);
    await supabase.from('configuracoes').upsert({ id: 'homepage', banners: newList });
    fetchDados();
  };

  const handleMoveBanner = async (idx, direction) => {
    const newList = [...banners];
    if (direction === 'up' && idx > 0) {
      [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    } else if (direction === 'down' && idx < newList.length - 1) {
      [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
    } else { return; }
    await supabase.from('configuracoes').upsert({ id: 'homepage', banners: newList });
    fetchDados();
  };

  return (
    <div className="max-w-7xl mx-auto p-8 text-white">
      
      {/* 1. SEU CABEÇALHO (Intacto) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-cyan-400 flex items-center italic"><Lock className="mr-3" /> PAINEL ADMINISTRATIVO</h1>
        <button onClick={async () => { await supabase.auth.signOut(); setCurrentView('home'); }} className="flex items-center text-red-500 font-bold hover:bg-red-500/10 px-5 py-2 rounded-lg border border-red-500/30 transition-colors">
          <LogOut className="mr-2 w-5 h-5"/> ENCERRAR SESSÃO
        </button>
      </div>

      {/* 2. MENU DE ABAS (NOVO) */}
      <div className="flex gap-4 mb-10 border-b border-[#1e324c] pb-2">
        <button 
          onClick={() => setAbaAtiva('skins')} 
          className={`pb-2 px-4 font-bold text-sm transition-all ${
            abaAtiva === 'skins' 
              ? 'text-cyan-400 border-b-2 border-cyan-400' 
              : 'text-gray-500 hover:text-white'
          }`}
        >
          🎮 GESTÃO DE SKINS
        </button>
        
        <button 
          onClick={() => setAbaAtiva('promocoes')} 
          className={`pb-2 px-4 font-bold text-sm transition-all ${
            abaAtiva === 'promocoes' 
              ? 'text-cyan-400 border-b-2 border-cyan-400' 
              : 'text-gray-500 hover:text-white'
          }`}
        >
          📢 GESTÃO DE PROMOÇÕES
        </button>

       <button 
          onClick={() => setAbaAtiva('parceiros')} 
          className={`pb-2 px-4 font-bold text-sm transition-all ${
            abaAtiva === 'parceiros' 
              ? 'text-cyan-400 border-b-2 border-cyan-400' 
              : 'text-gray-500 hover:text-white'
          }`}
        >
          🤝 GESTÃO DE PARCEIROS
        </button>
      </div>

        {/* 3. ABA DE SKINS (Seu código atual inteiro fica aqui dentro) */}
        {abaAtiva === 'skins' && (
        <div className="grid lg:grid-cols-3 gap-10">
          
          <div className="space-y-8 lg:col-span-1">
            <div className="bg-[#132032] border border-[#1e324c] p-6 rounded-xl shadow-2xl">
              <h2 className="font-bold text-lg mb-6 flex items-center text-cyan-400"><Plus className="mr-2"/> {editingId ? 'EDITAR' : 'NOVO'} ITEM</h2>
              <form onSubmit={handleSaveSkin} className="space-y-4">
                <input type="text" placeholder="Arma (ex: AK-47)..." value={newSkin.weapon} onChange={e => setNewSkin({...newSkin, weapon: e.target.value})} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
                <input type="text" placeholder="Nome (ex: Linha Vermelha)..." value={newSkin.name} onChange={e => setNewSkin({...newSkin, name: e.target.value})} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
                
                <div className="grid grid-cols-2 gap-4">
                  <select value={newSkin.category || "RIFLES"} onChange={e => setNewSkin({...newSkin, category: e.target.value})} className="bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400">
                    <option value="FACAS">Facas</option>
                    <option value="LUVAS">Luvas</option>
                    <option value="PISTOLAS">Pistolas</option>
                    <option value="SMGS">SMGs</option>
                    <option value="RIFLES">Rifles</option>
                    <option value="SNIPERS">Snipers</option>
                    <option value="ESCOPETAS">Escopetas</option>
                    <option value="ESPECIAIS">Especiais</option>
                  </select>

                  <select value={newSkin.condition} onChange={e => setNewSkin({...newSkin, condition: e.target.value})} className="bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400">
                    <option>Factory-New</option><option>Minimal-Wear</option><option>Field-Tested</option><option>Well-Worn</option><option>Battle-Scarred</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.000000001" placeholder="Float (0 a 1)..." value={newSkin.float} onChange={e => setNewSkin({...newSkin, float: e.target.value})} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
                  <input type="number" placeholder="Pattern..." value={newSkin.pattern} onChange={e => setNewSkin({...newSkin, pattern: e.target.value})} className="bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.01" placeholder="Preço Steam..." value={newSkin.steamPrice} onChange={e => setNewSkin({...newSkin, steamPrice: e.target.value})} className="bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
                  <input type="number" step="0.01" placeholder="Preço Loja..." value={newSkin.price} onChange={e => setNewSkin({...newSkin, price: e.target.value})} className="bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
                </div>

                <div className="space-y-2 border border-[#1e324c] bg-black/20 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTipoImagem('upload')} className={`flex items-center flex-1 justify-center px-3 py-2 rounded text-xs font-bold transition-all ${tipoImagem === 'upload' ? 'bg-cyan-500 text-black' : 'bg-black/40 text-gray-400 hover:text-white'}`}>
                      <UploadCloud size={14} className="mr-2" /> ARQUIVO
                    </button>
                    <button type="button" onClick={() => setTipoImagem('link')} className={`flex items-center flex-1 justify-center px-3 py-2 rounded text-xs font-bold transition-all ${tipoImagem === 'link' ? 'bg-cyan-500 text-black' : 'bg-black/40 text-gray-400 hover:text-white'}`}>
                      <LinkIcon size={14} className="mr-2" /> LINK URL
                    </button>
                  </div>

                  {tipoImagem === 'upload' ? (
                    <div className="relative mt-2">
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-black hover:file:bg-cyan-400 cursor-pointer" />
                      {uploading && <span className="text-xs text-yellow-400 font-bold block mt-2">A enviar imagem...</span>}
                      {!uploading && newSkin.image && <span className="text-xs text-green-400 font-bold block mt-2">Imagem pronta!</span>}
                    </div>
                  ) : (
                    <input type="url" placeholder="https://exemplo.com/imagem.png" value={newSkin.image} onChange={e => setNewSkin({...newSkin, image: e.target.value})} className="w-full mt-2 bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" />
                  )}
                </div>

                <input type="url" placeholder="Link de Compra..." value={newSkin.buyLink} onChange={e => setNewSkin({...newSkin, buyLink: e.target.value})} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" required />
                
                <button type="submit" className="w-full bg-cyan-500 py-3 rounded font-black hover:bg-cyan-400 text-black transition-all disabled:opacity-50" disabled={uploading}>
                  {editingId ? 'GUARDAR ALTERAÇÕES' : 'CADASTRAR NO BANCO'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {setEditingId(null); setNewSkin({weapon:'',name:'',condition:'Factory-New', category: 'RIFLES', image:'',steamPrice:'',price:'',float:0,pattern:0,buyLink:''}); setTipoImagem('upload');}} className="w-full mt-2 text-xs text-gray-500 hover:text-white">Cancelar Edição</button>
                )}
              </form>
            </div>

            <div className="bg-[#132032] border border-[#1e324c] p-6 rounded-xl shadow-2xl">
              <h2 className="font-bold text-lg mb-6 flex items-center text-cyan-400"><ImageIcon className="mr-2"/> GESTÃO DE BANNERS</h2>
              <form onSubmit={handleAddBanner} className="space-y-4 mb-6">
                <div className="space-y-2 border border-[#1e324c] bg-black/20 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTipoBanner('upload')} className={`flex items-center flex-1 justify-center px-3 py-2 rounded text-xs font-bold transition-all ${tipoBanner === 'upload' ? 'bg-cyan-500 text-black' : 'bg-black/40 text-gray-400 hover:text-white'}`}>
                      <UploadCloud size={14} className="mr-2" /> ARQUIVO
                    </button>
                    <button type="button" onClick={() => setTipoBanner('link')} className={`flex items-center flex-1 justify-center px-3 py-2 rounded text-xs font-bold transition-all ${tipoBanner === 'link' ? 'bg-cyan-500 text-black' : 'bg-black/40 text-gray-400 hover:text-white'}`}>
                      <LinkIcon size={14} className="mr-2" /> LINK URL
                    </button>
                  </div>

                  {tipoBanner === 'upload' ? (
                    <div className="relative mt-2">
                      <input type="file" accept="image/*" onChange={handleBannerFileUpload} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-black hover:file:bg-cyan-400 cursor-pointer" />
                      {uploadingBanner && <span className="text-xs text-yellow-400 font-bold block mt-2">A enviar banner...</span>}
                      {!uploadingBanner && newBanner && <span className="text-xs text-green-400 font-bold block mt-2">Banner pronto para adicionar!</span>}
                    </div>
                  ) : (
                    <input type="url" placeholder="https://exemplo.com/banner.png" value={newBanner} onChange={e => setNewBanner(e.target.value)} className="w-full mt-2 bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400" />
                  )}
                </div>

                <button type="submit" disabled={uploadingBanner} className="w-full bg-cyan-500 py-3 rounded font-black hover:bg-cyan-400 text-black transition-all disabled:opacity-50 flex items-center justify-center">
                  <Plus size={16} className="mr-2"/> ADICIONAR BANNER
                </button>
              </form>
              <div className="space-y-3 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                {banners.map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-[#1e324c]">
                    <span className="text-[10px] text-gray-400 truncate w-32" title={b}>{b}</span>
                    <div className="flex gap-1">
                      {i > 0 && <button onClick={() => handleMoveBanner(i, 'up')} className="text-blue-400 hover:text-white p-1" title="Mover para cima"><ArrowUp size={16}/></button>}
                      {i < banners.length - 1 && <button onClick={() => handleMoveBanner(i, 'down')} className="text-blue-400 hover:text-white p-1" title="Mover para baixo"><ArrowDown size={16}/></button>}
                      <button onClick={() => handleRemoveBanner(i)} className="text-red-500 hover:text-white transition-colors p-1" title="Apagar"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
                {banners.length === 0 && <p className="text-xs text-gray-500 text-center italic">Nenhum banner ativo.</p>}
              </div>
            </div>

          </div>

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
                      <button onClick={() => {setNewSkin({...s}); setEditingId(s.id); setTipoImagem('link'); window.scrollTo({top: 0, behavior: 'smooth'})}} className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition-all" title="Editar"><Pencil size={18}/></button>
                      <button onClick={() => handleRemoveSkin(s.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Remover"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
                {skins.length === 0 && <tr><td colSpan="3" className="py-20 text-center text-gray-500 italic font-bold">O banco de dados de skins está vazio.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ABA DE PROMOÇÕES (NOVO) */}
      {abaAtiva === 'promocoes' && (
        <AdminPromocoes />
      )}

      {/* 5. ABA DE PARCEIROS (ADICIONADO AQUI) */}
      {abaAtiva === 'parceiros' && (
        <AdminParceiros />
      )}

    </div>
  );
}