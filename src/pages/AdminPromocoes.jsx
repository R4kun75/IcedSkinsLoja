import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase'; // Ajuste o caminho se necessário
import { Pencil, Trash2 } from 'lucide-react';

export default function AdminPromocoes() {
  const [promocoes, setPromocoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [texto, setTexto] = useState('');
  const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);
  const [ativa, setAtiva] = useState(true);
  const [feedback, setFeedback] = useState({ tipo: '', msg: '' });

  useEffect(() => {
    fetchPromocoes();
  }, []);

  const fetchPromocoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('promocoes').select('*').order('data_lancamento', { ascending: false });
      if (error) throw error;
      setPromocoes(data || []);
    } catch (err) {
      setFeedback({ tipo: 'erro', msg: 'Erro ao carregar lista de promoções.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!texto.trim() || !dataLancamento) {
      setFeedback({ tipo: 'erro', msg: 'Preencha o texto e a data de lançamento.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback({ tipo: '', msg: '' });
      const promoData = { texto: texto.trim(), data_lancamento: dataLancamento, ativa: ativa };

      if (editingId) {
        const { error } = await supabase.from('promocoes').update(promoData).eq('id', editingId);
        if (error) throw error;
        setFeedback({ tipo: 'sucesso', msg: 'Promoção atualizada com sucesso!' });
      } else {
        const { error } = await supabase.from('promocoes').insert([promoData]);
        if (error) throw error;
        setFeedback({ tipo: 'sucesso', msg: 'Promoção cadastrada com sucesso!' });
      }

      cancelEdit();
      fetchPromocoes();
    } catch (err) {
      setFeedback({ tipo: 'erro', msg: 'Falha ao salvar a promoção.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (promo) => {
    setTexto(promo.texto);
    setDataLancamento(promo.data_lancamento);
    setAtiva(promo.ativa);
    setEditingId(promo.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setTexto('');
    setDataLancamento(new Date().toISOString().split('T')[0]);
    setAtiva(true);
    setEditingId(null);
  };

  const handleToggleStatus = async (id, statusAtual) => {
    try {
      const { error } = await supabase.from('promocoes').update({ ativa: !statusAtual }).eq('id', id);
      if (error) throw error;
      setPromocoes(promocoes.map((p) => (p.id === id ? { ...p, ativa: !statusAtual } : p)));
    } catch (err) {
      alert('Não foi possível alterar o status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta promoção?')) return;
    try {
      const { error } = await supabase.from('promocoes').delete().eq('id', id);
      if (error) throw error;
      setPromocoes(promocoes.filter((p) => p.id !== id));
    } catch (err) {
      alert('Erro ao excluir promoção.');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-10">
      <div className="bg-[#132032] border border-[#1e324c] p-6 rounded-xl shadow-2xl lg:col-span-1 h-fit">
        <h2 className="font-bold text-lg mb-6 flex items-center text-cyan-400">
          📢 {editingId ? 'EDITAR PROMOÇÃO' : 'NOVA PROMOÇÃO'}
        </h2>
        {feedback.msg && (
          <div className={`p-3 mb-4 rounded text-sm ${feedback.tipo === 'sucesso' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
            {feedback.msg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea rows={15} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Texto do Discord..." className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400 text-white whitespace-pre-wrap" required />
          <input type="date" value={dataLancamento} onChange={(e) => setDataLancamento(e.target.value)} className="w-full bg-black/40 border border-[#1e324c] p-3 rounded text-sm outline-none focus:border-cyan-400 text-white" required />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} className="w-5 h-5 rounded border-[#1e324c] text-cyan-500 bg-black/40" />
            <span className="text-sm font-medium text-gray-300">Promoção Ativa</span>
          </label>
          <button type="submit" disabled={submitting} className="w-full bg-cyan-500 py-3 rounded font-black hover:bg-cyan-400 text-black transition-all">
            {submitting ? 'A GUARDAR...' : editingId ? 'GUARDAR ALTERAÇÕES' : 'PUBLICAR PROMOÇÃO'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="w-full mt-2 text-xs text-gray-500 hover:text-white transition-colors">Cancelar Edição</button>
          )}
        </form>
      </div>

      <div className="lg:col-span-2 bg-[#132032] border border-[#1e324c] rounded-xl p-8 shadow-2xl">
        <h3 className="font-bold text-lg mb-6 text-cyan-400">PROMOÇÕES CADASTRADAS ({promocoes.length})</h3>
        {loading ? <p className="text-gray-400 text-sm">Carregando...</p> : (
          <div className="space-y-4">
            {promocoes.map((promo) => (
              <div key={promo.id} className={`p-4 bg-black/30 border rounded-lg space-y-3 transition-colors ${promo.id === editingId ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-[#1e324c]'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e324c] pb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black tracking-widest ${promo.ativa ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                      {promo.ativa ? 'ATIVA' : 'ENCERRADA'}
                    </span>
                    <span className="text-xs text-gray-500">{promo.data_lancamento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleStatus(promo.id, promo.ativa)} className="text-xs px-3 py-1.5 bg-black/40 hover:bg-black/60 text-gray-300 border border-[#1e324c] rounded transition-colors">
                      {promo.ativa ? 'Marcar Encerrada' : 'Marcar Ativa'}
                    </button>
                    <button onClick={() => handleEdit(promo)} className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white transition-colors" title="Editar"><Pencil size={16}/></button>
                    <button onClick={() => handleDelete(promo.id)} className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors" title="Apagar"><Trash2 size={16}/></button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed line-clamp-3">{promo.texto}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}