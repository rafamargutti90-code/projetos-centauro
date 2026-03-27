'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatBRL, formatPercent } from '@/lib/formatting';
import { getHistoricoById, type HistoricoItem } from '@/lib/storage';

export default function HistoricoDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<HistoricoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const item = getHistoricoById(id);
      if (!item) {
        setError('Registro nao encontrado');
      } else {
        setData(item);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar registro');
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#1B2A4A] text-lg">Carregando...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link href="/historico" className="text-[#C9A84C] hover:underline text-sm">
          &larr; Voltar para Historico
        </Link>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mt-4">{error || 'Registro nao encontrado'}</div>
      </div>
    );
  }

  const infoRows = [
    { label: 'Produto', value: `${data.produtoNome} (${data.produtoCodigo})` },
    { label: 'Perfil Fiscal', value: data.perfilFiscalNome },
    { label: 'Data do Calculo', value: new Date(data.criadoEm).toLocaleString('pt-BR') },
  ];

  const inputRows = [
    { label: 'Custo Unitario', value: formatBRL(data.custoUnitario) },
    { label: 'ICMS', value: formatPercent(data.icms) },
    { label: 'PIS', value: formatPercent(data.pis) },
    { label: 'COFINS', value: formatPercent(data.cofins) },
    { label: 'IPI', value: formatPercent(data.ipi) },
    { label: 'Margem de Lucro', value: formatPercent(data.margemLucro) },
    { label: 'Comissao Vendedor', value: formatPercent(data.comissaoVendedor) },
    { label: 'Despesas Operacionais', value: formatPercent(data.despesasOperacionais) },
    { label: 'Frete Percentual', value: data.fretePercentual != null ? formatPercent(data.fretePercentual) : '-' },
    { label: 'Frete Fixo', value: data.freteFixo != null ? formatBRL(data.freteFixo) : '-' },
  ];

  const resultRows = [
    { label: 'Total Impostos', value: formatPercent(data.totalImpostos) },
    { label: 'Total Despesas', value: formatPercent(data.totalDespesas) },
    { label: 'Markup Divisor', value: data.markupDivisor.toFixed(4) },
    { label: 'Markup Multiplicador', value: `${data.markupMultiplicador.toFixed(4)}x` },
    { label: 'Valor Impostos', value: formatBRL(data.valorImpostos) },
    { label: 'Valor Comissao', value: formatBRL(data.valorComissao) },
    { label: 'Valor Despesas', value: formatBRL(data.valorDespesas) },
    { label: 'Valor Frete', value: formatBRL(data.valorFrete) },
    { label: 'Valor Lucro', value: formatBRL(data.valorLucro) },
    { label: 'Lucro Unitario', value: formatBRL(data.lucroUnitario) },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/historico" className="text-[#C9A84C] hover:underline text-sm">
          &larr; Voltar para Historico
        </Link>
        <h1 className="text-3xl font-bold text-[#1B2A4A] mt-2">Detalhe do Calculo</h1>
      </div>

      {/* Big price */}
      <div className="bg-[#1B2A4A] rounded-xl p-6 text-center mb-6">
        <div className="text-[#C9A84C] text-sm font-medium mb-1">Preco de Venda</div>
        <div className="text-white text-4xl font-bold">{formatBRL(data.precoVenda)}</div>
        <div className="text-gray-300 text-sm mt-2">
          Markup: {data.markupMultiplicador.toFixed(4)}x | Lucro: {formatBRL(data.lucroUnitario)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 border-b pb-2">Informacoes</h2>
          <dl className="space-y-2">
            {infoRows.map((row) => (
              <div key={row.label} className="flex justify-between">
                <dt className="text-gray-500 text-sm">{row.label}</dt>
                <dd className="font-medium text-[#1B2A4A] text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Input params */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 border-b pb-2">Parametros de Entrada</h2>
          <dl className="space-y-2">
            {inputRows.map((row) => (
              <div key={row.label} className="flex justify-between">
                <dt className="text-gray-500 text-sm">{row.label}</dt>
                <dd className="font-medium text-[#1B2A4A] text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 border-b pb-2">Resultados Detalhados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          {resultRows.map((row) => (
            <div key={row.label} className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500 text-sm">{row.label}</span>
              <span className="font-medium text-[#1B2A4A] text-sm">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {data.observacao && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
          <div className="text-sm font-medium text-yellow-800 mb-1">Observacao</div>
          <div className="text-sm text-yellow-700">{data.observacao}</div>
        </div>
      )}
    </div>
  );
}
