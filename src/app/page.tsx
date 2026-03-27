'use client';

import { useEffect, useState, useRef } from 'react';
import { formatBRL, formatPercent } from '@/lib/formatting';
import { calcularPreco, type CalculoResult } from '@/lib/pricing';
import { getConfiguracao } from '@/lib/storage';

export default function HomePage() {
  const [resultado, setResultado] = useState<CalculoResult | null>(null);
  const [error, setError] = useState('');
  const [freteMode, setFreteMode] = useState<'percentual' | 'fixo'>('percentual');
  const [showAjustesICMS, setShowAjustesICMS] = useState(false);
  const [animateResult, setAnimateResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    custoUnitario: '',
    icms: '18',
    pis: '0.65',
    cofins: '3',
    ipi: '0',
    reducaoBaseICMS: '0',
    descontoICMS: '0',
    icmsST: '0',
    outrasDespesas: '0',
    margemLucro: '15',
    comissaoVendedor: '3',
    despesasOperacionais: '8',
    fretePercentual: '0',
    freteFixo: '0',
  });

  useEffect(() => {
    const config = getConfiguracao();
    setForm((prev) => ({
      ...prev,
      despesasOperacionais: config.despesasOperacionais?.toString() || prev.despesasOperacionais,
      comissaoVendedor: config.comissaoVendedor?.toString() || prev.comissaoVendedor,
      margemLucro: config.margemLucroPadrao?.toString() || prev.margemLucro,
      fretePercentual: config.fretePercentual?.toString() || '0',
      freteFixo: config.freteFixo?.toString() || '0',
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setResultado(null);
    setAnimateResult(false);
  };

  const handleCalcular = () => {
    setError('');
    setResultado(null);
    setAnimateResult(false);

    try {
      const result = calcularPreco({
        custoUnitario: parseFloat(form.custoUnitario),
        icms: parseFloat(form.icms),
        pis: parseFloat(form.pis),
        cofins: parseFloat(form.cofins),
        ipi: parseFloat(form.ipi),
        reducaoBaseICMS: parseFloat(form.reducaoBaseICMS) || 0,
        descontoICMS: parseFloat(form.descontoICMS) || 0,
        icmsST: parseFloat(form.icmsST) || 0,
        outrasDespesas: parseFloat(form.outrasDespesas) || 0,
        margemLucro: parseFloat(form.margemLucro),
        comissaoVendedor: parseFloat(form.comissaoVendedor),
        despesasOperacionais: parseFloat(form.despesasOperacionais),
        fretePercentual: freteMode === 'percentual' ? parseFloat(form.fretePercentual) : undefined,
        freteFixo: freteMode === 'fixo' ? parseFloat(form.freteFixo) : undefined,
      });
      setResultado(result);
      setTimeout(() => setAnimateResult(true), 50);
      // Scroll to result on mobile
      if (window.innerWidth < 1024) {
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular preco');
    }
  };

  const handleLimpar = () => {
    setForm((prev) => ({ ...prev, custoUnitario: '' }));
    setResultado(null);
    setAnimateResult(false);
    setError('');
  };

  const breakdownItems = resultado
    ? [
        { label: 'Custo', valor: resultado.custoBase, color: '#6B7280' },
        { label: resultado.icmsEfetivo !== parseFloat(form.icms) ? 'ICMS (efetivo)' : 'ICMS', percent: resultado.icmsEfetivo, valor: resultado.valorICMS, color: '#DC2626' },
        { label: 'PIS', percent: parseFloat(form.pis), valor: resultado.valorPIS, color: '#EF4444' },
        { label: 'COFINS', percent: parseFloat(form.cofins), valor: resultado.valorCOFINS, color: '#F87171' },
        { label: 'IPI', percent: parseFloat(form.ipi), valor: resultado.valorIPI, color: '#F59E0B' },
        { label: 'ICMS-ST', percent: parseFloat(form.icmsST), valor: resultado.valorICMSST, color: '#FBBF24' },
        { label: 'Comissao', percent: parseFloat(form.comissaoVendedor), valor: resultado.valorComissao, color: '#3B82F6' },
        { label: 'Despesas Op.', percent: parseFloat(form.despesasOperacionais), valor: resultado.valorDespesas, color: '#60A5FA' },
        { label: 'Outras Desp.', percent: parseFloat(form.outrasDespesas), valor: resultado.valorOutrasDespesas, color: '#93C5FD' },
        { label: 'Frete', percent: freteMode === 'percentual' ? parseFloat(form.fretePercentual) : null, valor: resultado.valorFrete, color: '#8B5CF6' },
        { label: 'Lucro', percent: parseFloat(form.margemLucro), valor: resultado.valorLucro, color: '#22C55E' },
      ].filter((item) => item.valor > 0 || item.label === 'Custo')
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Form */}
        <div className="lg:col-span-7 space-y-5">

          {/* Custo - Hero input */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2B4C9B] px-5 py-3">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Custo do Produto
              </h3>
            </div>
            <div className="p-5">
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Custo Unitario (R$)</label>
              <input
                type="number"
                name="custoUnitario"
                value={form.custoUnitario}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="0,00"
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] focus:bg-white text-2xl font-bold text-[#1E3A8A] transition-all placeholder:text-gray-300 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Impostos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 py-3">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/></svg>
                Impostos
              </h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InputField label="ICMS" suffix="%" name="icms" value={form.icms} onChange={handleChange} />
                <InputField label="PIS" suffix="%" name="pis" value={form.pis} onChange={handleChange} />
                <InputField label="COFINS" suffix="%" name="cofins" value={form.cofins} onChange={handleChange} />
                <InputField label="IPI" suffix="%" name="ipi" value={form.ipi} onChange={handleChange} />
              </div>

              {/* Ajustes ICMS toggle */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAjustesICMS((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#1E3A8A] hover:text-[#2B4C9B] transition-colors"
                >
                  <svg className={`w-3.5 h-3.5 transition-transform ${showAjustesICMS ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  Ajustes ICMS (reducao, desconto, ST)
                </button>
                <div className={`grid transition-all duration-300 ${showAjustesICMS ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <InputField label="Reducao Base ICMS" suffix="%" name="reducaoBaseICMS" value={form.reducaoBaseICMS} onChange={handleChange} hint="Ex: 61.11" />
                      <InputField label="Desconto ICMS" suffix="%" name="descontoICMS" value={form.descontoICMS} onChange={handleChange} hint="Cred. presumido" />
                      <InputField label="ICMS-ST" suffix="%" name="icmsST" value={form.icmsST} onChange={handleChange} hint="Subst. tributaria" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Despesas e Margem */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-5 py-3">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
                Despesas e Margem
              </h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InputField label="Margem de Lucro" suffix="%" name="margemLucro" value={form.margemLucro} onChange={handleChange} accent />
                <InputField label="Comissao" suffix="%" name="comissaoVendedor" value={form.comissaoVendedor} onChange={handleChange} />
                <InputField label="Despesas Op." suffix="%" name="despesasOperacionais" value={form.despesasOperacionais} onChange={handleChange} />
                <InputField label="Outras Desp." suffix="%" name="outrasDespesas" value={form.outrasDespesas} onChange={handleChange} hint="Opcional" />
              </div>
            </div>
          </div>

          {/* Frete */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-3 flex items-center justify-between">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
                Frete
              </h3>
              <div className="flex bg-white/20 rounded-lg overflow-hidden backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setFreteMode('percentual')}
                  className={`px-3 py-1 text-xs font-medium transition-all ${
                    freteMode === 'percentual'
                      ? 'bg-white text-purple-700'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setFreteMode('fixo')}
                  className={`px-3 py-1 text-xs font-medium transition-all ${
                    freteMode === 'fixo'
                      ? 'bg-white text-purple-700'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  R$
                </button>
              </div>
            </div>
            <div className="p-5">
              {freteMode === 'percentual' ? (
                <InputField label="Frete" suffix="%" name="fretePercentual" value={form.fretePercentual} onChange={handleChange} />
              ) : (
                <InputField label="Frete" suffix="R$" name="freteFixo" value={form.freteFixo} onChange={handleChange} />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCalcular}
              disabled={!form.custoUnitario}
              className="flex-1 bg-gradient-to-r from-[#CC2229] to-[#E03E3E] text-white py-4 rounded-xl hover:shadow-lg hover:shadow-red-200 active:scale-[0.98] transition-all font-bold text-lg disabled:opacity-40 disabled:hover:shadow-none disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.498-6h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm2.504-6h.006v.008h-.006v-.008zm0 2.25h.006v.008h-.006v-.008zm0 2.25h.006v.008h-.006v-.008zm0 2.25h.006v.008h-.006v-.008zm2.505-6h.005v.008h-.005v-.008zm0 2.25h.005v.008h-.005v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Calcular Preco
            </button>
            <button
              onClick={handleLimpar}
              className="px-5 bg-white border-2 border-gray-200 text-gray-500 py-4 rounded-xl hover:border-gray-300 hover:text-gray-700 active:scale-[0.98] transition-all font-medium"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* RIGHT: Result */}
        <div className="lg:col-span-5" ref={resultRef}>
          {resultado ? (
            <div className={`space-y-4 lg:sticky lg:top-6 transition-all duration-500 ${animateResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

              {/* Main price card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#2B4C9B] p-6 text-center shadow-xl shadow-blue-900/20">
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

                <div className="relative">
                  <p className="text-blue-200/80 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Preco de Venda</p>
                  <p className="text-white text-5xl sm:text-5xl font-black tracking-tight">{formatBRL(resultado.precoVendaFinal)}</p>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-blue-100">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                      Markup {resultado.markupMultiplicador.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              {resultado.margemReal < 5 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  Margem real de {formatPercent(resultado.margemReal)} esta abaixo de 5%
                </div>
              )}

              {/* Summary grid */}
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard label="Custo Base" value={formatBRL(resultado.custoBase)} icon="cost" />
                <SummaryCard label="Lucro Unitario" value={formatBRL(resultado.lucroUnitario)} icon="profit" variant="success" />
                <SummaryCard label="Margem Real" value={formatPercent(resultado.margemReal)} icon="percent" variant={resultado.margemReal >= 5 ? 'success' : 'danger'} />
                {resultado.icmsEfetivo !== parseFloat(form.icms) ? (
                  <SummaryCard label="ICMS Efetivo" value={formatPercent(resultado.icmsEfetivo)} icon="tax" />
                ) : (
                  <SummaryCard label="Markup Divisor" value={resultado.markupDivisor.toFixed(4)} icon="calc" />
                )}
              </div>

              {/* Composition */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#1E3A8A] mb-4">Composicao do Preco</h3>

                {/* Stacked bar */}
                <div className="flex h-8 rounded-xl overflow-hidden mb-4 shadow-inner bg-gray-100">
                  {breakdownItems
                    .filter((item) => item.valor > 0)
                    .map((item, i) => {
                      const width = (item.valor / resultado.precoVendaFinal) * 100;
                      return (
                        <div
                          key={item.label}
                          className="relative group transition-all duration-500 hover:opacity-80"
                          style={{
                            width: `${Math.max(width, 1.5)}%`,
                            backgroundColor: item.color,
                            transitionDelay: `${i * 50}ms`,
                          }}
                          title={`${item.label}: ${formatBRL(item.valor)} (${width.toFixed(1)}%)`}
                        />
                      );
                    })}
                </div>

                {/* Detail rows */}
                <div className="space-y-2">
                  {breakdownItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 group hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                        {'percent' in item && item.percent != null && item.percent > 0 && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{formatPercent(item.percent)}</span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{formatBRL(item.valor)}</span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-[#1E3A8A]/10">
                    <span className="text-sm font-black text-[#1E3A8A] uppercase tracking-wider">Total</span>
                    <span className="text-lg font-black text-[#1E3A8A]">{formatBRL(resultado.precoVendaFinal)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed p-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.498-6h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm2.504-6h.006v.008h-.006v-.008zm0 2.25h.006v.008h-.006v-.008zm0 2.25h.006v.008h-.006v-.008zm0 2.25h.006v.008h-.006v-.008zm2.505-6h.005v.008h-.005v-.008zm0 2.25h.005v.008h-.005v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Informe o custo do produto e clique em</p>
                <p className="text-[#CC2229] font-bold text-sm mt-1">Calcular Preco</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function InputField({
  label,
  name,
  value,
  onChange,
  suffix,
  hint,
  accent,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suffix?: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min="0"
          step="0.01"
          placeholder={hint || '0'}
          className={`w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:bg-white focus:ring-1 focus:ring-[#1E3A8A]/20 text-sm font-semibold transition-all ${accent ? 'text-green-700 bg-green-50/50 border-green-200 focus:border-green-500 focus:ring-green-500/20' : 'text-gray-800'}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  variant,
  icon,
}: {
  label: string;
  value: string;
  variant?: 'success' | 'danger';
  icon: string;
}) {
  const iconMap: Record<string, JSX.Element> = {
    cost: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    profit: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    percent: <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />,
    tax: <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />,
    calc: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.498-6h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm2.504-6h.006v.008h-.006v-.008zm0 2.25h.006v.008h-.006v-.008zm0 2.25h.006v.008h-.006v-.008zm0 2.25h.006v.008h-.006v-.008zm2.505-6h.005v.008h-.005v-.008zm0 2.25h.005v.008h-.005v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  const colors = {
    success: 'text-green-600 bg-green-50 border-green-100',
    danger: 'text-red-600 bg-red-50 border-red-100',
    default: 'text-[#1E3A8A] bg-blue-50/50 border-blue-100/50',
  };
  const colorClass = colors[variant || 'default'];

  return (
    <div className={`rounded-xl border p-3.5 text-center transition-all hover:shadow-sm ${colorClass}`}>
      <div className="flex items-center justify-center mb-1.5">
        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          {iconMap[icon]}
        </svg>
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-0.5">{label}</div>
      <div className="font-black text-base">{value}</div>
    </div>
  );
}
