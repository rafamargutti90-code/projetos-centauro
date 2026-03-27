'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { CATEGORIAS, UNIDADES } from '@/lib/constants';
import { getProdutoById, saveProduto } from '@/lib/storage';

export default function EditarProdutoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    codigo: '',
    nome: '',
    categoria: '',
    fornecedor: '',
    custoUnitario: '',
    unidade: 'UN',
    ncm: '',
  });

  useEffect(() => {
    try {
      const produto = getProdutoById(id);
      if (!produto) {
        setError('Produto não encontrado');
      } else {
        setForm({
          codigo: produto.codigo,
          nome: produto.nome,
          categoria: produto.categoria,
          fornecedor: produto.fornecedor,
          custoUnitario: produto.custoUnitario.toString(),
          unidade: produto.unidade,
          ncm: produto.ncm || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      saveProduto({
        id,
        codigo: form.codigo,
        nome: form.nome,
        categoria: form.categoria,
        fornecedor: form.fornecedor,
        custoUnitario: parseFloat(form.custoUnitario),
        unidade: form.unidade,
        ncm: form.ncm || null,
      });
      router.push('/produtos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
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
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <Link href="/produtos" className="inline-flex items-center gap-1 text-[#C9A84C] hover:underline text-sm">
          <ArrowLeft size={14} />
          Voltar para Produtos
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mt-2">Editar Produto</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Código (SKU) *</label>
            <input
              type="text"
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Nome *</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Categoria *</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
            >
              <option value="">Selecione...</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Fornecedor *</label>
            <input
              type="text"
              name="fornecedor"
              value={form.fornecedor}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Custo (R$) *</label>
            <input
              type="number"
              name="custoUnitario"
              value={form.custoUnitario}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Unidade</label>
            <select
              name="unidade"
              value={form.unidade}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
            >
              {UNIDADES.map((u) => (
                <option key={u.value} value={u.value}>{u.label} ({u.value})</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">NCM</label>
            <input
              type="text"
              name="ncm"
              value={form.ncm}
              onChange={handleChange}
              placeholder="Ex: 1006.30.21"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#C9A84C] text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Salvando...' : 'Atualizar Produto'}
          </button>
          <Link
            href="/produtos"
            className="flex-1 sm:flex-none text-center bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
