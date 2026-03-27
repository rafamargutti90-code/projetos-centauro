'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditarPerfilFiscalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    icms: '18',
    pis: '0.65',
    cofins: '3',
    ipi: '0',
    icmsST: '',
    padrao: false,
  });

  useEffect(() => {
    fetch(`/api/perfis-fiscais/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Perfil fiscal nao encontrado');
        return res.json();
      })
      .then((perfil) => {
        setForm({
          nome: perfil.nome,
          descricao: perfil.descricao || '',
          icms: perfil.icms.toString(),
          pis: perfil.pis.toString(),
          cofins: perfil.cofins.toString(),
          ipi: perfil.ipi.toString(),
          icmsST: perfil.icmsST != null ? perfil.icmsST.toString() : '',
          padrao: perfil.padrao,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/perfis-fiscais/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao || undefined,
          icms: parseFloat(form.icms),
          pis: parseFloat(form.pis),
          cofins: parseFloat(form.cofins),
          ipi: parseFloat(form.ipi),
          icmsST: form.icmsST ? parseFloat(form.icmsST) : null,
          padrao: form.padrao,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao atualizar perfil fiscal');
      }

      router.push('/perfis-fiscais');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil fiscal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#1B2A4A] text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/perfis-fiscais" className="text-[#C9A84C] hover:underline text-sm">
          &larr; Voltar para Perfis Fiscais
        </Link>
        <h1 className="text-3xl font-bold text-[#1B2A4A] mt-2">Editar Perfil Fiscal</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Nome *</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Descricao</label>
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">ICMS (%)</label>
            <input
              type="number"
              name="icms"
              value={form.icms}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">PIS (%)</label>
            <input
              type="number"
              name="pis"
              value={form.pis}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">COFINS (%)</label>
            <input
              type="number"
              name="cofins"
              value={form.cofins}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">IPI (%)</label>
            <input
              type="number"
              name="ipi"
              value={form.ipi}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">ICMS-ST (%)</label>
            <input
              type="number"
              name="icmsST"
              value={form.icmsST}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              placeholder="Opcional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="padrao"
                checked={form.padrao}
                onChange={handleChange}
                className="w-4 h-4 text-[#C9A84C] rounded"
              />
              <span className="text-sm font-medium text-[#1B2A4A]">Perfil padrao</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#C9A84C] text-white px-6 py-2 rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Atualizar Perfil'}
          </button>
          <Link
            href="/perfis-fiscais"
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
