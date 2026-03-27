'use client';

import { useEffect, useState } from 'react';
import { formatBRL, formatPercent } from '@/lib/formatting';
import { getDashboardData } from '@/lib/storage';
import Link from 'next/link';

interface DashboardData {
  totalProdutos: number;
  totalCalculos: number;
  margemMedia: number;
  perfisFiscais: number;
  calculosRecentes: Array<{
    id: string;
    produtoNome: string;
    produtoCodigo: string;
    precoVenda: number;
    margemLucro: number;
    lucroUnitario: number;
    custoUnitario: number;
    markupMultiplicador: number;
    criadoEm: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const dashData = getDashboardData();
      setData(dashData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#1B2A4A] text-lg">Carregando...</div>
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { label: 'Total Produtos', value: data.totalProdutos.toString() },
    { label: 'Total Calculos', value: data.totalCalculos.toString() },
    { label: 'Margem Media', value: formatPercent(data.margemMedia) },
    { label: 'Perfis Fiscais', value: data.perfisFiscais.toString() },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-6 sm:mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-md p-3 sm:p-6 border-l-4 border-[#C9A84C]"
          >
            <div className="text-xs sm:text-sm text-gray-500 mb-1">{card.label}</div>
            <div className="text-xl sm:text-3xl font-bold text-[#1B2A4A]">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A4A]">Ultimos Calculos</h2>
          <Link
            href="/historico"
            className="text-[#C9A84C] hover:underline text-sm font-medium"
          >
            Ver todos
          </Link>
        </div>

        {data.calculosRecentes.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">Nenhum calculo realizado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#1B2A4A]">
                  <th className="text-left py-3 px-2 text-[#1B2A4A]">Produto</th>
                  <th className="text-right py-3 px-2 text-[#1B2A4A]">Preco Venda</th>
                  <th className="text-right py-3 px-2 text-[#1B2A4A]">Margem</th>
                  <th className="text-right py-3 px-2 text-[#1B2A4A]">Markup</th>
                  <th className="text-right py-3 px-2 text-[#1B2A4A]">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.calculosRecentes.map((calc) => (
                  <tr key={calc.id} className="border-b border-gray-100 hover:bg-[#F8F6F0]">
                    <td className="py-3 px-2">
                      <div className="font-medium text-[#1B2A4A]">{calc.produtoNome}</div>
                      <div className="text-xs text-gray-400">{calc.produtoCodigo}</div>
                    </td>
                    <td className="text-right py-3 px-2 font-semibold text-[#1B2A4A]">
                      {formatBRL(calc.precoVenda)}
                    </td>
                    <td className="text-right py-3 px-2">{formatPercent(calc.margemLucro)}</td>
                    <td className="text-right py-3 px-2">{calc.markupMultiplicador.toFixed(4)}x</td>
                    <td className="text-right py-3 px-2 text-gray-500">
                      {new Date(calc.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
        <Link
          href="/calculadora"
          className="bg-[#C9A84C] text-white rounded-xl p-6 text-center hover:opacity-90 transition font-semibold text-lg shadow-md"
        >
          Nova Calculacao
        </Link>
        <Link
          href="/produtos/novo"
          className="bg-[#1B2A4A] text-white rounded-xl p-6 text-center hover:opacity-90 transition font-semibold text-lg shadow-md"
        >
          Novo Produto
        </Link>
        <Link
          href="/simulacao"
          className="bg-white text-[#1B2A4A] border-2 border-[#1B2A4A] rounded-xl p-6 text-center hover:bg-[#F8F6F0] transition font-semibold text-lg shadow-md"
        >
          Simulacao
        </Link>
      </div>
    </div>
  );
}
