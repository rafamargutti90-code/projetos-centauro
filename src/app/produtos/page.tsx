'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { formatBRL } from '@/lib/formatting';
import { getProdutos, deleteProduto, type Produto } from '@/lib/storage';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProdutos = (query: string) => {
    setLoading(true);
    try {
      const result = getProdutos(query || undefined);
      setProdutos(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos('');
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProdutos(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    try {
      deleteProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erro ao excluir produto');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A]">Produtos</h1>
        <Link
          href="/produtos/novo"
          className="flex items-center gap-2 bg-[#C9A84C] text-white px-4 sm:px-6 py-2 rounded-lg hover:opacity-90 transition font-medium text-sm sm:text-base"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Novo Produto</span>
          <span className="sm:hidden">Novo</span>
        </Link>
      </div>

      <div className="relative mb-4 sm:mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, código, fornecedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white text-sm sm:text-base"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {search ? 'Nenhum produto encontrado para esta busca.' : 'Nenhum produto cadastrado.'}
        </div>
      ) : (
        <>
          {/* Mobile: Card view */}
          <div className="sm:hidden space-y-3">
            {produtos.map((produto) => (
              <div key={produto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#1B2A4A] truncate">{produto.nome}</div>
                    <div className="text-xs font-mono text-gray-500">{produto.codigo}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1B2A4A]">{formatBRL(produto.custoUnitario)}</div>
                    <div className="text-xs text-gray-400">{produto.unidade}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{produto.categoria}</span>
                  <span>{produto.fornecedor}</span>
                </div>
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <Link
                    href={`/produtos/${produto.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#C9A84C] text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                  >
                    <Pencil size={14} />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(produto.id, produto.nome)}
                    className="flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table view */}
          <div className="hidden sm:block bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1B2A4A] text-white">
                    <th className="text-left py-3 px-4">Código</th>
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Categoria</th>
                    <th className="text-left py-3 px-4">Fornecedor</th>
                    <th className="text-right py-3 px-4">Custo Unit.</th>
                    <th className="text-center py-3 px-4">Unid.</th>
                    <th className="text-center py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id} className="border-b border-gray-100 hover:bg-[#F8F6F0]">
                      <td className="py-3 px-4 font-mono text-[#1B2A4A]">{produto.codigo}</td>
                      <td className="py-3 px-4 font-medium">{produto.nome}</td>
                      <td className="py-3 px-4 text-gray-600">{produto.categoria}</td>
                      <td className="py-3 px-4 text-gray-600">{produto.fornecedor}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[#1B2A4A]">
                        {formatBRL(produto.custoUnitario)}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500">{produto.unidade}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/produtos/${produto.id}`}
                            className="text-[#C9A84C] hover:underline font-medium flex items-center gap-1"
                          >
                            <Pencil size={14} />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(produto.id, produto.nome)}
                            className="text-red-500 hover:underline font-medium flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {produtos.length} produto(s) encontrado(s)
      </div>
    </div>
  );
}
