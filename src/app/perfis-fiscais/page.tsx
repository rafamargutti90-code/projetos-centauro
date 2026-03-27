'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPercent } from '@/lib/formatting';
import { getPerfisFiscais, deletePerfilFiscal, type PerfilFiscal } from '@/lib/storage';

export default function PerfisFiscaisPage() {
  const [perfis, setPerfis] = useState<PerfilFiscal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setPerfis(getPerfisFiscais());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    try {
      deletePerfilFiscal(id);
      setPerfis((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erro ao excluir perfil fiscal');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1B2A4A]">Perfis Fiscais</h1>
        <Link
          href="/perfis-fiscais/novo"
          className="bg-[#C9A84C] text-white px-6 py-2 rounded-lg hover:opacity-90 transition font-medium text-center"
        >
          Novo Perfil Fiscal
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : perfis.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Nenhum perfil fiscal cadastrado.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1B2A4A] text-white">
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Descricao</th>
                  <th className="text-right py-3 px-4">ICMS</th>
                  <th className="text-right py-3 px-4">PIS</th>
                  <th className="text-right py-3 px-4">COFINS</th>
                  <th className="text-right py-3 px-4">IPI</th>
                  <th className="text-center py-3 px-4">Padrao</th>
                  <th className="text-center py-3 px-4">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {perfis.map((perfil) => (
                  <tr key={perfil.id} className="border-b border-gray-100 hover:bg-[#F8F6F0]">
                    <td className="py-3 px-4 font-medium text-[#1B2A4A]">{perfil.nome}</td>
                    <td className="py-3 px-4 text-gray-600">{perfil.descricao || '-'}</td>
                    <td className="py-3 px-4 text-right">{formatPercent(perfil.icms)}</td>
                    <td className="py-3 px-4 text-right">{formatPercent(perfil.pis)}</td>
                    <td className="py-3 px-4 text-right">{formatPercent(perfil.cofins)}</td>
                    <td className="py-3 px-4 text-right">{formatPercent(perfil.ipi)}</td>
                    <td className="py-3 px-4 text-center">
                      {perfil.padrao ? (
                        <span className="bg-[#C9A84C] text-white text-xs px-2 py-1 rounded-full">Sim</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/perfis-fiscais/${perfil.id}`}
                          className="text-[#C9A84C] hover:underline font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(perfil.id, perfil.nome)}
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
        {perfis.length} perfil(is) fiscal(is) encontrado(s)
      </div>
    </div>
  );
}
