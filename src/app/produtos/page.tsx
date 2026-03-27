'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1B2A4A]">Produtos</h1>
        <Link
          href="/produtos/novo"
          className="bg-[#C9A84C] text-white px-6 py-2 rounded-lg hover:opacity-90 transition font-medium text-center"
        >
          Novo Produto
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome, código, fornecedor ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {search ? 'Nenhum produto encontrado para esta busca.' : 'Nenhum produto cadastrado.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1B2A4A] text-white">
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Categoria</th>
                  <th className="text-left py-3 px-4">Fornecedor</th>
                  <th className="text-right py-3 px-4">Custo Unit.</th>
                  <th className="text-center py-3 px-4">Unidade</th>
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
                          className="text-[#C9A84C] hover:underline font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(produto.id, produto.nome)}
                          className="text-red-500 hover:underline font-medium"
                        >
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
      )}

      <div className="mt-4 text-sm text-gray-500">
        {produtos.length} produto(s) encontrado(s)
      </div>
    </div>
  );
}
