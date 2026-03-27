'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Trash2, Eye } from 'lucide-react';
import { formatBRL, formatPercent } from '@/lib/formatting';
import { getHistorico, deleteHistoricoItem, exportHistoricoCSV } from '@/lib/storage';

interface HistoricoItem {
  id: string;
  produtoNome: string;
  produtoCodigo: string;
  precoVenda: number;
  margemLucro: number;
  criadoEm: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HistoricoPage() {
  const [historicos, setHistoricos] = useState<HistoricoItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadHistorico = (page: number) => {
    setLoading(true);
    try {
      const result = getHistorico(page, 20);
      setHistoricos(result.data);
      setPagination(result.pagination);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorico(1);
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    try {
      deleteHistoricoItem(id);
      loadHistorico(pagination.page);
    } catch {
      alert('Erro ao excluir registro');
    }
  };

  const handleExportar = () => {
    setExporting(true);
    try {
      const ids = historicos.map((h) => h.id);
      exportHistoricoCSV(ids);
    } catch {
      alert('Erro ao exportar CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A]">Histórico</h1>
        {historicos.length > 0 && (
          <button
            onClick={handleExportar}
            disabled={exporting}
            className="flex items-center gap-2 bg-[#1B2A4A] text-white px-4 sm:px-6 py-2 rounded-lg hover:opacity-90 transition font-medium text-sm disabled:opacity-50"
          >
            <Download size={16} />
            <span className="hidden sm:inline">{exporting ? 'Exportando...' : 'Exportar CSV'}</span>
            <span className="sm:hidden">CSV</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : historicos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum calculo registrado no historico.
        </div>
      ) : (
        <>
          {/* Mobile: Card view */}
          <div className="sm:hidden space-y-3">
            {historicos.map((h) => (
              <div key={h.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#1B2A4A] truncate">{h.produtoNome}</div>
                    <div className="text-xs font-mono text-gray-500">{h.produtoCodigo}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1B2A4A]">{formatBRL(h.precoVenda)}</div>
                    <div className="text-xs text-gray-400">{formatPercent(h.margemLucro)} margem</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {new Date(h.criadoEm).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <Link
                    href={`/historico/${h.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#C9A84C] text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                  >
                    <Eye size={14} />
                    Ver
                  </Link>
                  <button
                    onClick={() => handleDelete(h.id)}
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
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Produto</th>
                    <th className="text-right py-3 px-4">Preco Venda</th>
                    <th className="text-right py-3 px-4">Margem</th>
                    <th className="text-center py-3 px-4">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {historicos.map((h) => (
                    <tr key={h.id} className="border-b border-gray-100 hover:bg-[#F8F6F0]">
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(h.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#1B2A4A]">{h.produtoNome}</div>
                        <div className="text-xs text-gray-400">{h.produtoCodigo}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#1B2A4A]">
                        {formatBRL(h.precoVenda)}
                      </td>
                      <td className="py-3 px-4 text-right">{formatPercent(h.margemLucro)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/historico/${h.id}`}
                            className="text-[#C9A84C] hover:underline font-medium"
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => handleDelete(h.id)}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => loadHistorico(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => loadHistorico(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
