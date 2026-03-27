'use client';

import { useEffect, useState } from 'react';
import { formatBRL, formatPercent } from '@/lib/formatting';
import { calcularPreco, type CalculoResult } from '@/lib/pricing';
import { getConfiguracao } from '@/lib/storage';

export default function HomePage() {
  const [resultado, setResultado] = useState<CalculoResult | null>(null);
  const [error, setError] = useState('');
  const [freteMode, setFreteMode] = useState<'percentual' | 'fixo'>('percentual');
  const [showAjustesICMS, setShowAjustesICMS] = useState(false);

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
  };

  const handleCalcular = () => {
    setError('');
    setResultado(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular preco');
    }
  };

  const handleLimpar = () => {
    setForm((prev) => ({ ...prev, custoUnitario: '' }));
    setResultado(null);
    setError('');
  };

  const breakdownItems = resultado
    ? [
        { label: 'Custo', valor: resultado.custoBase, color: 'bg-gray-500' },
        { label: resultado.icmsEfetivo !== parseFloat(form.icms) ? `ICMS (efetivo)` : 'ICMS', percent: resultado.icmsEfetivo, valor: resultado.valorICMS, color: 'bg-red-500' },
        { label: 'PIS', percent: parseFloat(form.pis), valor: resultado.valorPIS, color: 'bg-red-400' },
        { label: 'COFINS', percent: parseFloat(form.cofins), valor: resultado.valorCOFINS, color: 'bg-red-300' },
        { label: 'IPI', percent: parseFloat(form.ipi), valor: resultado.valorIPI, color: 'bg-orange-400' },
        { label: 'ICMS-ST', percent: parseFloat(form.icmsST), valor: resultado.valorICMSST, color: 'bg-orange-300' },
        { label: 'Comissao', percent: parseFloat(form.comissaoVendedor), valor: resultado.valorComissao, color: 'bg-blue-400' },
        { label: 'Despesas Op.', percent: parseFloat(form.despesasOperacionais), valor: resultado.valorDespesas, color: 'bg-blue-300' },
        { label: 'Outras Desp.', percent: parseFloat(form.outrasDespesas), valor: resultado.valorOutrasDespesas, color: 'bg-blue-200' },
        { label: 'Frete', percent: freteMode === 'percentual' ? parseFloat(form.fretePercentual) : null, valor: resultado.valorFrete, color: 'bg-purple-400' },
        { label: 'Lucro', percent: parseFloat(form.margemLucro), valor: resultado.valorLucro, color: 'bg-green-500' },
      ].filter((item) => item.valor > 0 || item.label === 'Custo')
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* LEFT: Form - 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          {/* Custo */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">
              Custo Unitario (R$)
            </label>
            <input
              type="number"
              name="custoUnitario"
              value={form.custoUnitario}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="Ex: 18.50"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#CC2229] text-lg font-medium"
            />
          </div>

          {/* Impostos */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-[#1E3A8A] mb-3">Impostos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField label="ICMS (%)" name="icms" value={form.icms} onChange={handleChange} />
              <InputField label="PIS (%)" name="pis" value={form.pis} onChange={handleChange} />
              <InputField label="COFINS (%)" name="cofins" value={form.cofins} onChange={handleChange} />
              <InputField label="IPI (%)" name="ipi" value={form.ipi} onChange={handleChange} />
            </div>

            {/* Ajustes ICMS */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAjustesICMS((v) => !v)}
                className="text-xs text-[#CC2229] font-medium hover:underline"
              >
                {showAjustesICMS ? '− Ocultar ajustes ICMS' : '+ Ajustes ICMS (reducao, desconto, ST)'}
              </button>
              {showAjustesICMS && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <InputField label="Reducao Base ICMS (%)" name="reducaoBaseICMS" value={form.reducaoBaseICMS} onChange={handleChange} hint="Ex: 61.11 para cesta basica" />
                  <InputField label="Desconto ICMS (%)" name="descontoICMS" value={form.descontoICMS} onChange={handleChange} hint="Credito presumido, etc." />
                  <InputField label="ICMS-ST (%)" name="icmsST" value={form.icmsST} onChange={handleChange} hint="Substituicao tributaria" />
                </div>
              )}
            </div>
          </div>

          {/* Despesas e Margem */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-[#1E3A8A] mb-3">Despesas e Margem</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField label="Margem de Lucro (%)" name="margemLucro" value={form.margemLucro} onChange={handleChange} />
              <InputField label="Comissao (%)" name="comissaoVendedor" value={form.comissaoVendedor} onChange={handleChange} />
              <InputField label="Despesas Op. (%)" name="despesasOperacionais" value={form.despesasOperacionais} onChange={handleChange} />
              <InputField label="Outras Desp. (%)" name="outrasDespesas" value={form.outrasDespesas} onChange={handleChange} hint="Opcional" />
            </div>
          </div>

          {/* Frete */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1E3A8A]">Frete</h3>
              <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFreteMode('percentual')}
                  className={`px-3 py-1.5 text-xs font-medium transition ${
                    freteMode === 'percentual'
                      ? 'bg-[#1E3A8A] text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Percentual
                </button>
                <button
                  type="button"
                  onClick={() => setFreteMode('fixo')}
                  className={`px-3 py-1.5 text-xs font-medium transition ${
                    freteMode === 'fixo'
                      ? 'bg-[#1E3A8A] text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Fixo (R$)
                </button>
              </div>
            </div>
            {freteMode === 'percentual' ? (
              <InputField label="Frete (%)" name="fretePercentual" value={form.fretePercentual} onChange={handleChange} />
            ) : (
              <InputField label="Frete (R$)" name="freteFixo" value={form.freteFixo} onChange={handleChange} />
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCalcular}
              disabled={!form.custoUnitario}
              className="flex-1 bg-[#CC2229] text-white py-3 rounded-lg hover:bg-[#B01E24] transition font-semibold text-lg disabled:opacity-50"
            >
              Calcular Preco
            </button>
            <button
              onClick={handleLimpar}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* RIGHT: Result - 2 cols */}
        <div className="lg:col-span-2">
          {resultado ? (
            <div className="space-y-4 lg:sticky lg:top-6">
              {/* Main price card */}
              <div className="bg-[#1E3A8A] rounded-xl p-5 text-center">
                <div className="text-blue-200 text-xs font-medium tracking-wider uppercase mb-1">Preco de Venda</div>
                <div className="text-white text-4xl font-bold">{formatBRL(resultado.precoVendaFinal)}</div>
                <div className="text-gray-400 text-sm mt-2">
                  Markup {resultado.markupMultiplicador.toFixed(2)}x
                </div>
              </div>

              {/* Warning */}
              {resultado.margemReal < 5 && (
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-lg text-sm">
                  Margem real ({formatPercent(resultado.margemReal)}) abaixo de 5%
                </div>
              )}

              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard label="Custo Base" value={formatBRL(resultado.custoBase)} />
                <SummaryCard label="Lucro Unitario" value={formatBRL(resultado.lucroUnitario)} highlight />
                <SummaryCard label="Margem Real" value={formatPercent(resultado.margemReal)} highlight={resultado.margemReal >= 5} warn={resultado.margemReal < 5} />
                {resultado.icmsEfetivo !== parseFloat(form.icms) ? (
                  <SummaryCard label="ICMS Efetivo" value={formatPercent(resultado.icmsEfetivo)} />
                ) : (
                  <SummaryCard label="Markup Divisor" value={resultado.markupDivisor.toFixed(4)} />
                )}
              </div>

              {/* Composition bar + breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-semibold text-[#1E3A8A] mb-3">Composicao do Preco</h3>
                <div className="flex h-5 rounded-lg overflow-hidden mb-3">
                  {breakdownItems
                    .filter((item) => item.valor > 0)
                    .map((item) => {
                      const width = (item.valor / resultado.precoVendaFinal) * 100;
                      return (
                        <div
                          key={item.label}
                          className={`${item.color}`}
                          style={{ width: `${Math.max(width, 1)}%` }}
                          title={`${item.label}: ${formatBRL(item.valor)}`}
                        />
                      );
                    })}
                </div>

                <div className="space-y-1.5">
                  {breakdownItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-gray-600">{item.label}</span>
                        {'percent' in item && item.percent != null && item.percent > 0 && (
                          <span className="text-gray-400 text-xs">({formatPercent(item.percent)})</span>
                        )}
                      </div>
                      <span className="font-medium text-[#1E3A8A]">{formatBRL(item.valor)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
                    <span className="text-[#1E3A8A]">Total</span>
                    <span className="text-[#1E3A8A]">{formatBRL(resultado.precoVendaFinal)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 lg:sticky lg:top-6">
              <div className="text-5xl mb-3 opacity-30">&#9881;</div>
              <p className="text-sm">Preencha o custo e clique em <strong>Calcular</strong> para ver o resultado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min="0"
        step="0.01"
        placeholder={hint}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#CC2229] text-sm"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`font-bold text-sm ${warn ? 'text-red-600' : highlight ? 'text-green-600' : 'text-[#1E3A8A]'}`}>
        {value}
      </div>
    </div>
  );
}
