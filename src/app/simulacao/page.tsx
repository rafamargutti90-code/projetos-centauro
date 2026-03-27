'use client';

import { useEffect, useState } from 'react';
import { formatBRL, formatPercent } from '@/lib/formatting';
import { calcularPreco, type CalculoResult } from '@/lib/pricing';
import { getProdutos, getPerfisFiscais, getConfiguracao, type Produto, type PerfilFiscal } from '@/lib/storage';

interface Cenario {
  id: number;
  nome: string;
  form: {
    custoUnitario: string;
    icms: string;
    pis: string;
    cofins: string;
    ipi: string;
    margemLucro: string;
    comissaoVendedor: string;
    despesasOperacionais: string;
    fretePercentual: string;
  };
  resultado: CalculoResult | null;
  loading: boolean;
  error: string;
}

const defaultForm = {
  custoUnitario: '',
  icms: '18',
  pis: '0.65',
  cofins: '3',
  ipi: '0',
  margemLucro: '15',
  comissaoVendedor: '3',
  despesasOperacionais: '8',
  fretePercentual: '0',
};

export default function SimulacaoPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [perfis, setPerfis] = useState<PerfilFiscal[]>([]);
  const [cenarios, setCenarios] = useState<Cenario[]>([
    { id: 1, nome: 'Cenario 1', form: { ...defaultForm }, resultado: null, loading: false, error: '' },
  ]);
  let nextId = cenarios.length + 1;

  useEffect(() => {
    const prods = getProdutos();
    const perfs = getPerfisFiscais();
    const config = getConfiguracao();
    setProdutos(prods);
    setPerfis(perfs);
    const updatedForm = {
      ...defaultForm,
      despesasOperacionais: config.despesasOperacionais?.toString() || '8',
      comissaoVendedor: config.comissaoVendedor?.toString() || '3',
      margemLucro: config.margemLucroPadrao?.toString() || '15',
      fretePercentual: config.fretePercentual?.toString() || '0',
    };
    setCenarios((prev) =>
      prev.map((c) => ({ ...c, form: { ...c.form, ...updatedForm } }))
    );
  }, []);

  const addCenario = () => {
    if (cenarios.length >= 3) return;
    const newId = nextId++;
    setCenarios((prev) => [
      ...prev,
      {
        id: newId,
        nome: `Cenario ${newId}`,
        form: { ...prev[prev.length - 1].form },
        resultado: null,
        loading: false,
        error: '',
      },
    ]);
  };

  const removeCenario = (id: number) => {
    if (cenarios.length <= 1) return;
    setCenarios((prev) => prev.filter((c) => c.id !== id));
  };

  const updateForm = (id: number, field: string, value: string) => {
    setCenarios((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, form: { ...c.form, [field]: value }, resultado: null, error: '' } : c
      )
    );
  };

  const handleProdutoChange = (cenarioId: number, produtoId: string) => {
    const produto = produtos.find((p) => p.id === produtoId);
    if (produto) {
      setCenarios((prev) =>
        prev.map((c) =>
          c.id === cenarioId
            ? { ...c, form: { ...c.form, custoUnitario: produto.custoUnitario.toString() }, resultado: null }
            : c
        )
      );
    }
  };

  const handlePerfilChange = (cenarioId: number, perfilId: string) => {
    const perfil = perfis.find((p) => p.id === perfilId);
    if (perfil) {
      setCenarios((prev) =>
        prev.map((c) =>
          c.id === cenarioId
            ? {
                ...c,
                form: {
                  ...c.form,
                  icms: perfil.icms.toString(),
                  pis: perfil.pis.toString(),
                  cofins: perfil.cofins.toString(),
                  ipi: perfil.ipi.toString(),
                },
                resultado: null,
              }
            : c
        )
      );
    }
  };

  const calcular = (cenarioId: number) => {
    const cenario = cenarios.find((c) => c.id === cenarioId);
    if (!cenario) return;

    setCenarios((prev) =>
      prev.map((c) => (c.id === cenarioId ? { ...c, loading: true, error: '' } : c))
    );

    try {
      const resultado = calcularPreco({
        custoUnitario: parseFloat(cenario.form.custoUnitario),
        icms: parseFloat(cenario.form.icms),
        pis: parseFloat(cenario.form.pis),
        cofins: parseFloat(cenario.form.cofins),
        ipi: parseFloat(cenario.form.ipi),
        margemLucro: parseFloat(cenario.form.margemLucro),
        comissaoVendedor: parseFloat(cenario.form.comissaoVendedor),
        despesasOperacionais: parseFloat(cenario.form.despesasOperacionais),
        fretePercentual: parseFloat(cenario.form.fretePercentual),
      });
      setCenarios((prev) =>
        prev.map((c) => (c.id === cenarioId ? { ...c, resultado, loading: false } : c))
      );
    } catch (err) {
      setCenarios((prev) =>
        prev.map((c) =>
          c.id === cenarioId
            ? { ...c, error: err instanceof Error ? err.message : 'Erro', loading: false }
            : c
        )
      );
    }
  };

  const calcularTodos = () => {
    cenarios.forEach((c) => {
      if (c.form.custoUnitario) calcular(c.id);
    });
  };

  // Find best/worst across scenarios that have results
  const resultados = cenarios.filter((c) => c.resultado);
  const bestPreco = resultados.length > 1
    ? Math.min(...resultados.map((c) => c.resultado!.precoVendaFinal))
    : null;
  const bestMargem = resultados.length > 1
    ? Math.max(...resultados.map((c) => c.resultado!.margemReal))
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1B2A4A]">Simulacao de Cenarios</h1>
        <div className="flex gap-2">
          {cenarios.length < 3 && (
            <button
              onClick={addCenario}
              className="bg-[#C9A84C] text-white px-4 py-2 rounded-lg hover:opacity-90 transition font-medium text-sm"
            >
              Adicionar Cenario
            </button>
          )}
          {resultados.length === 0 && cenarios.length > 0 && (
            <button
              onClick={calcularTodos}
              className="bg-[#1B2A4A] text-white px-4 py-2 rounded-lg hover:opacity-90 transition font-medium text-sm"
            >
              Calcular Todos
            </button>
          )}
        </div>
      </div>

      <div className={`grid gap-6 ${cenarios.length === 1 ? 'grid-cols-1 max-w-xl' : cenarios.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
        {cenarios.map((cenario) => (
          <div key={cenario.id} className="bg-white rounded-xl shadow-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={cenario.nome}
                onChange={(e) =>
                  setCenarios((prev) =>
                    prev.map((c) => (c.id === cenario.id ? { ...c, nome: e.target.value } : c))
                  )
                }
                className="text-lg font-semibold text-[#1B2A4A] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#C9A84C] focus:outline-none"
              />
              {cenarios.length > 1 && (
                <button
                  onClick={() => removeCenario(cenario.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Remover
                </button>
              )}
            </div>

            {/* Selectors */}
            <select
              onChange={(e) => handleProdutoChange(cenario.id, e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
            >
              <option value="">Produto (opcional)</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>{p.codigo} - {p.nome}</option>
              ))}
            </select>

            <select
              onChange={(e) => handlePerfilChange(cenario.id, e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
            >
              <option value="">Perfil Fiscal (opcional)</option>
              {perfis.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>

            {/* Fields */}
            <div className="space-y-2">
              {[
                { name: 'custoUnitario', label: 'Custo (R$)' },
                { name: 'icms', label: 'ICMS (%)' },
                { name: 'pis', label: 'PIS (%)' },
                { name: 'cofins', label: 'COFINS (%)' },
                { name: 'ipi', label: 'IPI (%)' },
                { name: 'margemLucro', label: 'Margem (%)' },
                { name: 'comissaoVendedor', label: 'Comissao (%)' },
                { name: 'despesasOperacionais', label: 'Desp. Op. (%)' },
                { name: 'fretePercentual', label: 'Frete (%)' },
              ].map((field) => (
                <div key={field.name} className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-24 shrink-0">{field.label}</label>
                  <input
                    type="number"
                    value={cenario.form[field.name as keyof typeof cenario.form]}
                    onChange={(e) => updateForm(cenario.id, field.name, e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => calcular(cenario.id)}
              disabled={cenario.loading || !cenario.form.custoUnitario}
              className="w-full bg-[#C9A84C] text-white py-2 rounded-lg hover:opacity-90 transition font-medium text-sm disabled:opacity-50"
            >
              {cenario.loading ? 'Calculando...' : 'Calcular'}
            </button>

            {cenario.error && (
              <div className="text-red-500 text-xs p-2 bg-red-50 rounded">{cenario.error}</div>
            )}

            {/* Result */}
            {cenario.resultado && (
              <div className="bg-[#F8F6F0] rounded-lg p-3 space-y-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Preco de Venda</div>
                  <div className={`text-2xl font-bold ${
                    bestPreco != null && cenario.resultado.precoVendaFinal === bestPreco
                      ? 'text-green-600'
                      : 'text-[#1B2A4A]'
                  }`}>
                    {formatBRL(cenario.resultado.precoVendaFinal)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-500">Markup</div>
                    <div className="font-semibold">{cenario.resultado.markupMultiplicador.toFixed(4)}x</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Margem Real</div>
                    <div className={`font-semibold ${
                      bestMargem != null && cenario.resultado.margemReal === bestMargem
                        ? 'text-green-600'
                        : cenario.resultado.margemReal < 5
                        ? 'text-red-600'
                        : ''
                    }`}>
                      {formatPercent(cenario.resultado.margemReal)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Lucro Unit.</div>
                    <div className="font-semibold">{formatBRL(cenario.resultado.lucroUnitario)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Custo Base</div>
                    <div className="font-semibold">{formatBRL(cenario.resultado.custoBase)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {resultados.length > 1 && (
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Comparativo</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#1B2A4A]">
                  <th className="text-left py-2 px-3">Metrica</th>
                  {resultados.map((c) => (
                    <th key={c.id} className="text-right py-2 px-3">{c.nome}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Preco Venda', key: 'precoVendaFinal', fmt: formatBRL, best: 'min' },
                  { label: 'Margem Real', key: 'margemReal', fmt: formatPercent, best: 'max' },
                  { label: 'Lucro Unit.', key: 'lucroUnitario', fmt: formatBRL, best: 'max' },
                  { label: 'Markup', key: 'markupMultiplicador', fmt: (v: number) => `${v.toFixed(4)}x`, best: 'min' },
                  { label: 'Custo Base', key: 'custoBase', fmt: formatBRL, best: 'min' },
                ].map((metric) => {
                  const values = resultados.map((c) => (c.resultado as unknown as Record<string, number>)[metric.key]);
                  const bestVal = metric.best === 'min' ? Math.min(...values) : Math.max(...values);

                  return (
                    <tr key={metric.label} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-600">{metric.label}</td>
                      {resultados.map((c) => {
                        const val = (c.resultado as unknown as Record<string, number>)[metric.key];
                        const isBest = val === bestVal;
                        return (
                          <td
                            key={c.id}
                            className={`text-right py-2 px-3 font-medium ${isBest ? 'text-green-600 font-bold' : 'text-[#1B2A4A]'}`}
                          >
                            {metric.fmt(val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
