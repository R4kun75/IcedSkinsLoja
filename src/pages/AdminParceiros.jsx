import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Plus, Trash2, Pencil, UploadCloud, Link as LinkIcon, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminParceiros() {
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');
  const [imagem, setImagem] = useState('');
  const [link, setLink] = useState('');
  
  const [tipoImagem, setTipoImagem] = useState('link');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchParceiros();
  }, []);

  const fetchParceiros = async () => {
    try {
      // Busca ordenando primeiro pela ordem manual, depois pela data
      const { data, error } = await supabase.from('parceiros').select('*').order('ordem', { ascending: true }).order('created_at', { ascending: false });
      if (error) throw error;
      setParceiros(data || []);
    } catch (err) {
      console.error('Erro ao buscar parceiros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('skins').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('skins').getPublicUrl(fileName);
      setImagem(data.publicUrl);
    } catch (error) {
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Se for novo, coloca no final da lista (maior ordem)
      const novaOrdem = parceiros.length; 
      const parceiroData = { nome, texto, imagem, link };

      if (editingId) {
        const { error } = await supabase.from('parceiros').update(parceiroData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('parceiros').insert([{ ...parceiroData, ordem: novaOrdem }]);
        if (error) throw error;
      }

      cancelEdit();
      fetchParceiros();
    } catch (err) {
      alert('Erro ao salvar parceiro.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p) => {
    setNome(p.nome); setTexto(p.texto); setImagem(p.imagem); setLink(p.link || '');
    setTipoImagem('link'); setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setNome(''); setTexto(''); setImagem(''); setLink('');
    setTipoImagem('upload'); setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este parceiro?')) return;
    try {
      const { error } = await supabase.from('parceiros').delete().eq('id', id);
      if (error) throw error;
      fetchParceiros();
    } catch (err) {
      alert('Erro ao excluir parceiro.');
    }
  };

  // FUNÇÃO DE REORDENAR
  const handleMove = async (idx, direction) => {
    const newList = [...parceiros];
    if (direction === 'up' && idx > 0) {
      [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    } else if (direction === 'down' && idx < newList.length - 1) {
      [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
    } else { return; }
    
    // Atualiza a tela instantaneamente
    setParceiros(newList);

    // Salva a nova ordem no banco de dados silenciosamente
    for (let i = 0; i < newList.length; i++) {
      await supabase.from('parceiros').update({ ordem: i }).eq('id', newList[i].id);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-10">
      <div className="bg-[#132032] border border-[#1e324c] p-6 rounded-xl shadow-2xl lg:col-span-1 h-fit">
        <h2 className="font-bold text-lg mb-6 flex items-center text-cyan-400">
          <Plus className="mr-2"/> {editingId ? 'EDITAR PARCEIRO' : 'NOVO PARCEIRO'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome do Parceiro..." value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400 text-white" required />
          <textarea placeholder="Pequeno texto descritivo..." value={texto} onChange={e => setTexto(e.target.value)} rows={6} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400 text-white" required />
          <input type="url" placeholder="Link (ex: canal da Twitch)..." value={link} onChange={e => setLink(e.target.value)} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400 text-white" />
          
          <div className="space-y-2 border border-[#1e324c] bg-black/20 p-3 rounded-lg">
            <div className="flex gap-2">
              <button type="button" onClick={() => setTipoImagem('upload')} className={`flex items-center flex-1 justify-center px-3 py-2 rounded text-xs font-bold transition-all ${tipoImagem === 'upload' ? 'bg-cyan-500 text-black' : 'bg-black/40 text-gray-400 hover:text-white'}`}><UploadCloud size={14} className="mr-2" /> ARQUIVO</button>
              <button type="button" onClick={() => setTipoImagem('link')} className={`flex items-center flex-1 justify-center px-3 py-2 rounded text-xs font-bold transition-all ${tipoImagem === 'link' ? 'bg-cyan-500 text-black' : 'bg-black/40 text-gray-400 hover:text-white'}`}><LinkIcon size={14} className="mr-2" /> LINK URL</button>
            </div>
            {tipoImagem === 'upload' ? (
              <div className="relative mt-2">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:bg-cyan-500 file:text-black cursor-pointer" />
                {uploading && <span className="text-xs text-yellow-400 font-bold block mt-2">Enviando imagem...</span>}
              </div>
            ) : (
              <input type="url" placeholder="URL da logo/imagem..." value={imagem} onChange={e => setImagem(e.target.value)} className="w-full mt-2 bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400 text-white" required={tipoImagem==='link'} />
            )}
          </div>
          
          <button type="submit" disabled={submitting || uploading} className="w-full bg-cyan-500 py-3 rounded font-black hover:bg-cyan-400 text-black transition-all">
            {submitting ? 'SALVANDO...' : editingId ? 'GUARDAR ALTERAÇÕES' : 'CADASTRAR PARCEIRO'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="w-full mt-2 text-xs text-gray-500 hover:text-white transition-colors">Cancelar Edição</button>
          )}
        </form>
      </div>

      <div className="lg:col-span-2 bg-[#132032] border border-[#1e324c] rounded-xl p-8 shadow-2xl">
        <h2 className="font-bold text-lg mb-6 flex items-center text-cyan-400">PARCEIROS CADASTRADOS</h2>
        <div className="grid grid-cols-1 gap-4">
          {parceiros.map((p, i) => (
            <div key={p.id} className={`bg-black/30 border p-4 rounded-lg flex items-center gap-4 transition-colors ${p.id === editingId ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-[#1e324c]'}`}>
              <img src={p.imagem} alt={p.nome} className="w-12 h-12 rounded-full object-cover border border-[#1e324c]" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">{p.nome}</h3>
                <p className="text-gray-400 text-[10px] truncate max-w-[250px]">{p.texto}</p>
              </div>
              
              {/* Botões de Mover */}
              <div className="flex flex-col gap-1 border-r border-[#1e324c] pr-4 mr-2">
                <button onClick={() => handleMove(i, 'up')} disabled={i === 0} className="p-1 text-blue-400 hover:text-white disabled:opacity-30"><ArrowUp size={16}/></button>
                <button onClick={() => handleMove(i, 'down')} disabled={i === parceiros.length - 1} className="p-1 text-blue-400 hover:text-white disabled:opacity-30"><ArrowDown size={16}/></button>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-2">
                <button onClick={() => handleEdit(p)} className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white transition-colors"><Pencil size={14}/></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          {parceiros.length === 0 && !loading && <p className="text-gray-500 text-sm italic col-span-full">Nenhum parceiro cadastrado ainda.</p>}
        </div>
      </div>
    </div>
  );
}