'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus } from 'lucide-react';
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A]">Perfis Fiscais</h1>
        <Link
          href="/perfis-fiscais/novo"
          className="flex items-center gap-2 bg-[#C9A84C] text-white px-4 sm:px-6 py-2 rounded-lg hover:opacity-90 transition font-medium text-sm sm:text-base"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Novo Perfil</span>
          <span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : perfis.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Nenhum perfil fiscal cadastrado.</div>
      ) : (
        <>
          {/* Mobile: Card view */}
          <div className="sm:hidden space-y-3">
            {perfis.map((perfil) => (
              <div key={perfil.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#1B2A4A] truncate">{perfil.nome}</div>
                    {perfil.descricao && (
                      <div className="text-xs text-gray-500 mt-0.5">{perfil.descricao}</div>
                    )}
                  </div>
                  {perfil.padrao && (
                    <span className="bg-[#C9A84C] text-white text-xs px-2 py-0.5 rounded-full shrink-0">Padrão</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 text-center bg-[#F8F6F0] rounded-lg p-2 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">ICMS</div>
                    <div className="text-sm font-semibold text-[#1B2A4A]">{formatPercent(perfil.icms)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">PIS</div>
                    <div className="text-sm font-semibold text-[#1B2A4A]">{formatPercent(perfil.pis)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">COFINS</div>
                    <div className="text-sm font-semibold text-[#1B2A4A]">{formatPercent(perfil.cofins)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">IPI</div>
                    <div className="text-sm font-semibold text-[#1B2A4A]">{formatPercent(perfil.ipi)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <Link
                    href={`/perfis-fiscais/${perfil.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#C9A84C] text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                  >
                    <Pencil size={14} />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(perfil.id, perfil.nome)}
                    className="flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                  >
                    <Trash2 size={14} />
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
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Descrição</th>
                    <th className="text-right py-3 px-4">ICMS</th>
                    <th className="text-right py-3 px-4">PIS</th>
                    <th className="text-right py-3 px-4">COFINS</th>
                    <th className="text-right py-3 px-4">IPI</th>
                    <th className="text-center py-3 px-4">Padrão</th>
                    <th className="text-center py-3 px-4">Ações</th>
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
        </>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {perfis.length} perfil(is) fiscal(is)
      </div>
    </div>
  );
}
