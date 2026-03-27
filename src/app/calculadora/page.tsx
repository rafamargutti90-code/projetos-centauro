'use client';

import { useEffect, useState } from 'react';
import { formatBRL, formatPercent } from '@/lib/formatting';
import { calcularPreco, type CalculoResult } from '@/lib/pricing';
import { getProdutos, getPerfisFiscais, getConfiguracao, saveHistoricoItem, type Produto, type PerfilFiscal } from '@/lib/storage';

export default function CalculadoraPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [perfis, setPerfis] = useState<PerfilFiscal[]>([]);
  const [resultado, setResultado] = useState<CalculoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [freteMode, setFreteMode] = useState<'percentual' | 'fixo'>('percentual');

  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [selectedPerfilId, setSelectedPerfilId] = useState('');

  const [form, setForm] = useState({
    custoUnitario: '',
    icms: '18',
    pis: '0.65',
    cofins: '3',
    ipi: '0',
    margemLucro: '15',
    comissaoVendedor: '3',
    despesasOperacionais: '8',
    fretePercentual: '0',
    freteFixo: '0',
  });

  // Load produtos, perfis, and config on mount
  useEffect(() => {
    const prods = getProdutos();
    const perfs = getPerfisFiscais();
    const config = getConfiguracao();
    setProdutos(prods);
    setPerfis(perfs);
    setForm((prev) => ({
      ...prev,
      despesasOperacionais: config.despesasOperacionais?.toString() || prev.despesasOperacionais,
      comissaoVendedor: config.comissaoVendedor?.toString() || prev.comissaoVendedor,
      margemLucro: config.margemLucroPadrao?.toString() || prev.margemLucro,
      fretePercentual: config.fretePercentual?.toString() || '0',
      freteFixo: config.freteFixo?.toString() || '0',
    }));
  }, []);

  // When product selected, fill custoUnitario
  const handleProdutoChange = (produtoId: string) => {
    setSelectedProdutoId(produtoId);
    const produto = produtos.find((p) => p.id === produtoId);
    if (produto) {
      setForm((prev) => ({ ...prev, custoUnitario: produto.custoUnitario.toString() }));
    }
    setResultado(null);
    setSaved(false);
  };

  // When profile selected, fill tax fields
  const handlePerfilChange = (perfilId: string) => {
    setSelectedPerfilId(perfilId);
    const perfil = perfis.find((p) => p.id === perfilId);
    if (perfil) {
      setForm((prev) => ({
        ...prev,
        icms: perfil.icms.toString(),
        pis: perfil.pis.toString(),
        cofins: perfil.cofins.toString(),
        ipi: perfil.ipi.toString(),
      }));
    }
    setResultado(null);
    setSaved(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setResultado(null);
    setSaved(false);
  };

  const handleCalcular = () => {
    setError('');
    setLoading(true);
    setResultado(null);
    setSaved(false);

    try {
      const result = calcularPreco({
        custoUnitario: parseFloat(form.custoUnitario),
        icms: parseFloat(form.icms),
        pis: parseFloat(form.pis),
        cofins: parseFloat(form.cofins),
        ipi: parseFloat(form.ipi),
        margemLucro: parseFloat(form.margemLucro),
        comissaoVendedor: parseFloat(form.comissaoVendedor),
        despesasOperacionais: parseFloat(form.despesasOperacionais),
        fretePercentual: freteMode === 'percentual' ? parseFloat(form.fretePercentual) : undefined,
        freteFixo: freteMode === 'fixo' ? parseFloat(form.freteFixo) : undefined,
      });
      setResultado(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular preco');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = () => {
    if (!resultado) return;
    setSaving(true);

    const produto = produtos.find((p) => p.id === selectedProdutoId);
    const perfil = perfis.find((p) => p.id === selectedPerfilId);

    try {
      saveHistoricoItem({
        produtoId: selectedProdutoId || null,
        produtoNome: produto?.nome || 'Produto avulso',
        produtoCodigo: produto?.codigo || '---',
        perfilFiscalId: selectedPerfilId || null,
        perfilFiscalNome: perfil?.nome || 'Manual',
        custoUnitario: parseFloat(form.custoUnitario),
        icms: parseFloat(form.icms),
        pis: parseFloat(form.pis),
        cofins: parseFloat(form.cofins),
        ipi: parseFloat(form.ipi),
        margemLucro: parseFloat(form.margemLucro),
        comissaoVendedor: parseFloat(form.comissaoVendedor),
        despesasOperacionais: parseFloat(form.despesasOperacionais),
        fretePercentual: freteMode === 'percentual' ? parseFloat(form.fretePercentual) : null,
        freteFixo: freteMode === 'fixo' ? parseFloat(form.freteFixo) : null,
        totalImpostos: resultado.totalImpostosPercent,
        totalDespesas: resultado.totalDespesasPercent,
        markupDivisor: resultado.markupDivisor,
        markupMultiplicador: resultado.markupMultiplicador,
        precoVenda: resultado.precoVendaFinal,
        lucroUnitario: resultado.lucroUnitario,
        valorImpostos: resultado.valorICMS + resultado.valorPIS + resultado.valorCOFINS + resultado.valorIPI,
        valorComissao: resultado.valorComissao,
        valorDespesas: resultado.valorDespesas,
        valorFrete: resultado.valorFrete,
        valorLucro: resultado.valorLucro,
        observacao: null,
      });
      setSaved(true);
    } catch {
      alert('Erro ao salvar no historico');
    } finally {
      setSaving(false);
    }
  };

  const breakdownItems = resultado
    ? [
        { label: 'Custo Base', percent: null, valor: resultado.custoBase, color: 'bg-gray-500' },
        { label: 'ICMS', percent: parseFloat(form.icms), valor: resultado.valorICMS, color: 'bg-red-500' },
        { label: 'PIS', percent: parseFloat(form.pis), valor: resultado.valorPIS, color: 'bg-red-400' },
        { label: 'COFINS', percent: parseFloat(form.cofins), valor: resultado.valorCOFINS, color: 'bg-red-300' },
        { label: 'IPI', percent: parseFloat(form.ipi), valor: resultado.valorIPI, color: 'bg-orange-400' },
        { label: 'Comissao', percent: parseFloat(form.comissaoVendedor), valor: resultado.valorComissao, color: 'bg-blue-400' },
        { label: 'Despesas Op.', percent: parseFloat(form.despesasOperacionais), valor: resultado.valorDespesas, color: 'bg-blue-300' },
        { label: 'Frete', percent: freteMode === 'percentual' ? parseFloat(form.fretePercentual) : null, valor: resultado.valorFrete, color: 'bg-purple-400' },
        { label: 'Lucro', percent: parseFloat(form.margemLucro), valor: resultado.valorLucro, color: 'bg-green-500' },
      ]
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1B2A4A] mb-6">Calculadora de Precos</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#1B2A4A] border-b border-gray-200 pb-2">
            Dados do Calculo
          </h2>

          {/* Product selector */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Produto</label>
            <select
              value={selectedProdutoId}
              onChange={(e) => handleProdutoChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            >
              <option value="">Selecione um produto (opcional)</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} - {p.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Tax profile selector */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Perfil Fiscal</label>
            <select
              value={selectedPerfilId}
              onChange={(e) => handlePerfilChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            >
              <option value="">Selecione um perfil (opcional)</option>
              {perfis.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Custo Unitario (R$) *</label>
            <input
              type="number"
              name="custoUnitario"
              value={form.custoUnitario}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>

          {/* Tax fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1B2A4A] mb-1">ICMS (%)</label>
              <input
                type="number"
                name="icms"
                value={form.icms}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1B2A4A] mb-1">PIS (%)</label>
              <input
                type="number"
                name="pis"
                value={form.pis}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1B2A4A] mb-1">COFINS (%)</label>
              <input
                type="number"
                name="cofins"
                value={form.cofins}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1B2A4A] mb-1">IPI (%)</label>
              <input
                type="number"
                name="ipi"
                value={form.ipi}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
            </div>
          </div>

          {/* Operational fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1B2A4A] mb-1">Margem Lucro (%)</label>
              <input
                type="number"
                name="margemLucro"
                value={form.margemLucro}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1B2A4A] mb-1">Comissao (%)</label>
              <input
                type="number"
                name="comissaoVendedor"
                value={form.comissaoVendedor}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1B2A4A] mb-1">Despesas Op. (%)</label>
              <input
                type="number"
                name="despesasOperacionais"
                value={form.despesasOperacionais}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
            </div>
          </div>

          {/* Frete toggle */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <label className="block text-sm font-medium text-[#1B2A4A]">Frete</label>
              <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFreteMode('percentual')}
                  className={`px-3 py-1 text-xs font-medium transition ${
                    freteMode === 'percentual'
                      ? 'bg-[#1B2A4A] text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Percentual
                </button>
                <button
                  type="button"
                  onClick={() => setFreteMode('fixo')}
                  className={`px-3 py-1 text-xs font-medium transition ${
                    freteMode === 'fixo'
                      ? 'bg-[#1B2A4A] text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Fixo (R$)
                </button>
              </div>
            </div>
            {freteMode === 'percentual' ? (
              <input
                type="number"
                name="fretePercentual"
                value={form.fretePercentual}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Frete em %"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
            ) : (
              <input
                type="number"
                name="freteFixo"
                value={form.freteFixo}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Frete em R$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-sm"
              />
            )}
          </div>

          <button
            onClick={handleCalcular}
            disabled={loading || !form.custoUnitario}
            className="w-full bg-[#C9A84C] text-white py-3 rounded-lg hover:opacity-90 transition font-semibold text-lg disabled:opacity-50"
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>

        {/* RIGHT: Result */}
        <div>
          {resultado ? (
            <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
              {/* Main price */}
              <div className="bg-[#1B2A4A] rounded-xl p-6 text-center">
                <div className="text-[#C9A84C] text-sm font-medium mb-1">Preco de Venda</div>
                <div className="text-white text-4xl font-bold">
                  {formatBRL(resultado.precoVendaFinal)}
                </div>
                <div className="text-gray-300 text-sm mt-2">
                  Markup: {resultado.markupMultiplicador.toFixed(4)}x
                </div>
              </div>

              {/* Warning */}
              {resultado.margemReal < 5 && (
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-lg text-sm font-medium">
                  Atencao: Margem real ({formatPercent(resultado.margemReal)}) esta abaixo de 5%. Considere ajustar os parametros.
                </div>
              )}

              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F8F6F0] rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Custo Base</div>
                  <div className="font-semibold text-[#1B2A4A]">{formatBRL(resultado.custoBase)}</div>
                </div>
                <div className="bg-[#F8F6F0] rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Lucro Unit.</div>
                  <div className="font-semibold text-green-600">{formatBRL(resultado.lucroUnitario)}</div>
                </div>
                <div className="bg-[#F8F6F0] rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Margem Real</div>
                  <div className={`font-semibold ${resultado.margemReal < 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatPercent(resultado.margemReal)}
                  </div>
                </div>
              </div>

              {/* Composition bar */}
              <div>
                <div className="text-sm font-medium text-[#1B2A4A] mb-2">Composicao do Preco</div>
                <div className="flex h-6 rounded-lg overflow-hidden">
                  {breakdownItems
                    .filter((item) => item.valor > 0)
                    .map((item) => {
                      const width = (item.valor / resultado.precoVendaFinal) * 100;
                      return (
                        <div
                          key={item.label}
                          className={`${item.color} relative group`}
                          style={{ width: `${Math.max(width, 1)}%` }}
                          title={`${item.label}: ${formatBRL(item.valor)}`}
                        />
                      );
                    })}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {breakdownItems
                    .filter((item) => item.valor > 0)
                    .map((item) => (
                      <div key={item.label} className="flex items-center gap-1 text-xs">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-gray-600">{item.label}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Breakdown table */}
              <div>
                <div className="text-sm font-medium text-[#1B2A4A] mb-2">Detalhamento</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Componente</th>
                      <th className="text-right py-2">%</th>
                      <th className="text-right py-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownItems.map((item) => (
                      <tr key={item.label} className="border-b border-gray-50">
                        <td className="py-2 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          {item.label}
                        </td>
                        <td className="text-right py-2 text-gray-500">
                          {item.percent != null ? formatPercent(item.percent) : '-'}
                        </td>
                        <td className="text-right py-2 font-medium">{formatBRL(item.valor)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-[#1B2A4A] font-bold">
                      <td className="py-2">Preco Final</td>
                      <td className="text-right py-2"></td>
                      <td className="text-right py-2 text-[#1B2A4A]">{formatBRL(resultado.precoVendaFinal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Save button */}
              <button
                onClick={handleSalvar}
                disabled={saving || saved}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  saved
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-[#1B2A4A] text-white hover:opacity-90 disabled:opacity-50'
                }`}
              >
                {saved ? 'Salvo no Historico!' : saving ? 'Salvando...' : 'Salvar no Historico'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-400">
              <div className="text-5xl mb-4">&#9881;</div>
              <p className="text-lg">Preencha os dados e clique em Calcular para ver o resultado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
