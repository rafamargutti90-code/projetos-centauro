'use client';

import { useEffect, useState } from 'react';
import { getConfiguracao, saveConfiguracao } from '@/lib/storage';

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    despesasOperacionais: '',
    comissaoVendedor: '',
    fretePercentual: '',
    freteFixo: '',
    margemLucroPadrao: '',
  });

  useEffect(() => {
    try {
      const config = getConfiguracao();
      setForm({
        despesasOperacionais: config.despesasOperacionais?.toString() || '8',
        comissaoVendedor: config.comissaoVendedor?.toString() || '3',
        fretePercentual: config.fretePercentual?.toString() || '',
        freteFixo: config.freteFixo?.toString() || '',
        margemLucroPadrao: config.margemLucroPadrao?.toString() || '15',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configuracoes');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      saveConfiguracao({
        despesasOperacionais: parseFloat(form.despesasOperacionais) || 0,
        comissaoVendedor: parseFloat(form.comissaoVendedor) || 0,
        fretePercentual: form.fretePercentual ? parseFloat(form.fretePercentual) : null,
        freteFixo: form.freteFixo ? parseFloat(form.freteFixo) : null,
        margemLucroPadrao: parseFloat(form.margemLucroPadrao) || 0,
      });
      setSuccess('Configuracoes salvas com sucesso!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#1B2A4A] text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] mb-4 sm:mb-6">Configurações</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-5">
        <p className="text-sm text-gray-500 mb-2">
          Estes valores serao usados como padrao na calculadora de precos. Voce pode alterar individualmente em cada calculo.
        </p>

        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
            Despesas Operacionais (%)
          </label>
          <input
            type="number"
            name="despesasOperacionais"
            value={form.despesasOperacionais}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
          <p className="text-xs text-gray-400 mt-1">Percentual de despesas operacionais sobre o preco de venda.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
            Comissao do Vendedor (%)
          </label>
          <input
            type="number"
            name="comissaoVendedor"
            value={form.comissaoVendedor}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
              Frete Percentual (%)
            </label>
            <input
              type="number"
              name="fretePercentual"
              value={form.fretePercentual}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              placeholder="Opcional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
              Frete Fixo (R$)
            </label>
            <input
              type="number"
              name="freteFixo"
              value={form.freteFixo}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Opcional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
            Margem de Lucro Padrao (%)
          </label>
          <input
            type="number"
            name="margemLucroPadrao"
            value={form.margemLucroPadrao}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#C9A84C] text-white py-3 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Configuracoes'}
        </button>
      </form>
    </div>
  );
}
