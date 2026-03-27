// localStorage-based storage layer replacing Prisma/SQLite

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  fornecedor: string;
  custoUnitario: number;
  unidade: string;
  ncm: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PerfilFiscal {
  id: string;
  nome: string;
  descricao: string | null;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  icmsST: number | null;
  padrao: boolean;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Configuracao {
  despesasOperacionais: number;
  comissaoVendedor: number;
  fretePercentual: number | null;
  freteFixo: number | null;
  margemLucroPadrao: number;
}

export interface HistoricoItem {
  id: string;
  produtoId: string | null;
  produtoNome: string;
  produtoCodigo: string;
  perfilFiscalId: string | null;
  perfilFiscalNome: string;
  custoUnitario: number;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  margemLucro: number;
  comissaoVendedor: number;
  despesasOperacionais: number;
  fretePercentual: number | null;
  freteFixo: number | null;
  totalImpostos: number;
  totalDespesas: number;
  markupDivisor: number;
  markupMultiplicador: number;
  precoVenda: number;
  lucroUnitario: number;
  valorImpostos: number;
  valorComissao: number;
  valorDespesas: number;
  valorFrete: number;
  valorLucro: number;
  observacao: string | null;
  criadoEm: string;
}

// --- Storage keys ---
const KEYS = {
  produtos: 'centauro_produtos',
  perfisFiscais: 'centauro_perfis_fiscais',
  configuracao: 'centauro_configuracao',
  historico: 'centauro_historico',
  initialized: 'centauro_initialized',
} as const;

// --- Helpers ---
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Initialize defaults (seed data) ---
export function initializeDefaults(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEYS.initialized)) return;

  const now = new Date().toISOString();

  // Default tax profiles
  const defaultPerfis: PerfilFiscal[] = [
    {
      id: generateId(), nome: 'Lucro Presumido - Padrão BA', descricao: 'Regime de Lucro Presumido com alíquotas padrão BA',
      icms: 18, pis: 0.65, cofins: 3, ipi: 0, icmsST: null, padrao: true, ativo: true, criadoEm: now, atualizadoEm: now,
    },
    {
      id: generateId(), nome: 'Lucro Real - Padrão BA', descricao: 'Regime de Lucro Real com alíquotas padrão BA',
      icms: 18, pis: 1.65, cofins: 7.6, ipi: 0, icmsST: null, padrao: false, ativo: true, criadoEm: now, atualizadoEm: now,
    },
    {
      id: generateId(), nome: 'Simples Nacional - Faixa 1', descricao: 'Simples Nacional faixa inicial',
      icms: 0, pis: 0, cofins: 0, ipi: 0, icmsST: null, padrao: false, ativo: true, criadoEm: now, atualizadoEm: now,
    },
    {
      id: generateId(), nome: 'ICMS-ST (Substituído)', descricao: 'Produtos com substituição tributária de ICMS',
      icms: 0, pis: 0.65, cofins: 3, ipi: 0, icmsST: null, padrao: false, ativo: true, criadoEm: now, atualizadoEm: now,
    },
    {
      id: generateId(), nome: 'Bebidas com IPI', descricao: 'Perfil para bebidas com incidência de IPI',
      icms: 18, pis: 0.65, cofins: 3, ipi: 5, icmsST: null, padrao: false, ativo: true, criadoEm: now, atualizadoEm: now,
    },
  ];

  // Default config
  const defaultConfig: Configuracao = {
    despesasOperacionais: 8,
    comissaoVendedor: 3,
    fretePercentual: 2,
    freteFixo: null,
    margemLucroPadrao: 15,
  };

  // Default products
  const defaultProdutos: Produto[] = [
    {
      id: generateId(), codigo: 'ARR001', nome: 'Arroz 5kg', categoria: 'Grãos e Cereais',
      fornecedor: 'Distribuidora Grãos do Sul', custoUnitario: 18.50, unidade: 'UN', ncm: '1006.30.21',
      ativo: true, criadoEm: now, atualizadoEm: now,
    },
    {
      id: generateId(), codigo: 'FEI001', nome: 'Feijão 1kg', categoria: 'Grãos e Cereais',
      fornecedor: 'Distribuidora Grãos do Sul', custoUnitario: 7.90, unidade: 'UN', ncm: '0713.33.19',
      ativo: true, criadoEm: now, atualizadoEm: now,
    },
    {
      id: generateId(), codigo: 'OLE001', nome: 'Óleo 900ml', categoria: 'Óleos e Gorduras',
      fornecedor: 'Óleos Brasil Ltda', custoUnitario: 5.20, unidade: 'UN', ncm: '1507.90.11',
      ativo: true, criadoEm: now, atualizadoEm: now,
    },
    {
      id: generateId(), codigo: 'ACU001', nome: 'Açúcar 5kg', categoria: 'Açúcar e Adoçantes',
      fornecedor: 'Usina Doce Mel', custoUnitario: 14.80, unidade: 'UN', ncm: '1701.14.00',
      ativo: true, criadoEm: now, atualizadoEm: now,
    },
    {
      id: generateId(), codigo: 'REF001', nome: 'Refrigerante 2L', categoria: 'Bebidas',
      fornecedor: 'Bebidas Nordeste SA', custoUnitario: 4.50, unidade: 'UN', ncm: '2202.10.00',
      ativo: true, criadoEm: now, atualizadoEm: now,
    },
  ];

  setItem(KEYS.perfisFiscais, defaultPerfis);
  setItem(KEYS.configuracao, defaultConfig);
  setItem(KEYS.produtos, defaultProdutos);
  setItem(KEYS.historico, []);
  localStorage.setItem(KEYS.initialized, 'true');
}

// --- Produtos ---
export function getProdutos(search?: string): Produto[] {
  const produtos = getItem<Produto[]>(KEYS.produtos, []);
  const active = produtos.filter((p) => p.ativo);
  if (!search) return active;
  const q = search.toLowerCase();
  return active.filter(
    (p) =>
      p.nome.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q) ||
      p.fornecedor.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
  );
}

export function getProdutoById(id: string): Produto | undefined {
  const produtos = getItem<Produto[]>(KEYS.produtos, []);
  return produtos.find((p) => p.id === id && p.ativo);
}

export function saveProduto(data: Omit<Produto, 'id' | 'ativo' | 'criadoEm' | 'atualizadoEm'> & { id?: string }): Produto {
  const produtos = getItem<Produto[]>(KEYS.produtos, []);
  const now = new Date().toISOString();

  if (data.id) {
    // Update
    const idx = produtos.findIndex((p) => p.id === data.id);
    if (idx === -1) throw new Error('Produto não encontrado');
    produtos[idx] = { ...produtos[idx], ...data, atualizadoEm: now };
    setItem(KEYS.produtos, produtos);
    return produtos[idx];
  } else {
    // Create
    const novo: Produto = {
      ...data,
      id: generateId(),
      ativo: true,
      criadoEm: now,
      atualizadoEm: now,
    };
    produtos.push(novo);
    setItem(KEYS.produtos, produtos);
    return novo;
  }
}

export function deleteProduto(id: string): void {
  const produtos = getItem<Produto[]>(KEYS.produtos, []);
  const idx = produtos.findIndex((p) => p.id === id);
  if (idx !== -1) {
    produtos[idx].ativo = false;
    setItem(KEYS.produtos, produtos);
  }
}

// --- Perfis Fiscais ---
export function getPerfisFiscais(): PerfilFiscal[] {
  const perfis = getItem<PerfilFiscal[]>(KEYS.perfisFiscais, []);
  return perfis.filter((p) => p.ativo);
}

export function getPerfilFiscalById(id: string): PerfilFiscal | undefined {
  const perfis = getItem<PerfilFiscal[]>(KEYS.perfisFiscais, []);
  return perfis.find((p) => p.id === id && p.ativo);
}

export function savePerfilFiscal(data: Omit<PerfilFiscal, 'id' | 'ativo' | 'criadoEm' | 'atualizadoEm'> & { id?: string }): PerfilFiscal {
  const perfis = getItem<PerfilFiscal[]>(KEYS.perfisFiscais, []);
  const now = new Date().toISOString();

  // If setting as padrao, unset others
  if (data.padrao) {
    perfis.forEach((p) => { p.padrao = false; });
  }

  if (data.id) {
    const idx = perfis.findIndex((p) => p.id === data.id);
    if (idx === -1) throw new Error('Perfil fiscal não encontrado');
    perfis[idx] = { ...perfis[idx], ...data, atualizadoEm: now };
    setItem(KEYS.perfisFiscais, perfis);
    return perfis[idx];
  } else {
    const novo: PerfilFiscal = {
      ...data,
      id: generateId(),
      ativo: true,
      criadoEm: now,
      atualizadoEm: now,
    };
    perfis.push(novo);
    setItem(KEYS.perfisFiscais, perfis);
    return novo;
  }
}

export function deletePerfilFiscal(id: string): void {
  const perfis = getItem<PerfilFiscal[]>(KEYS.perfisFiscais, []);
  const idx = perfis.findIndex((p) => p.id === id);
  if (idx !== -1) {
    perfis[idx].ativo = false;
    setItem(KEYS.perfisFiscais, perfis);
  }
}

// --- Configuracao ---
export function getConfiguracao(): Configuracao {
  return getItem<Configuracao>(KEYS.configuracao, {
    despesasOperacionais: 8,
    comissaoVendedor: 3,
    fretePercentual: 2,
    freteFixo: null,
    margemLucroPadrao: 15,
  });
}

export function saveConfiguracao(config: Configuracao): Configuracao {
  setItem(KEYS.configuracao, config);
  return config;
}

// --- Historico ---
export function getHistorico(page = 1, limit = 20): { data: HistoricoItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } } {
  const all = getItem<HistoricoItem[]>(KEYS.historico, []);
  // Sort by date descending
  all.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, pagination: { page, limit, total, totalPages } };
}

export function getHistoricoById(id: string): HistoricoItem | undefined {
  const all = getItem<HistoricoItem[]>(KEYS.historico, []);
  return all.find((h) => h.id === id);
}

export function getHistoricoByIds(ids: string[]): HistoricoItem[] {
  const all = getItem<HistoricoItem[]>(KEYS.historico, []);
  const idSet = new Set(ids);
  return all.filter((h) => idSet.has(h.id)).sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
}

export function saveHistoricoItem(data: Omit<HistoricoItem, 'id' | 'criadoEm'>): HistoricoItem {
  const all = getItem<HistoricoItem[]>(KEYS.historico, []);
  const novo: HistoricoItem = {
    ...data,
    id: generateId(),
    criadoEm: new Date().toISOString(),
  };
  all.push(novo);
  setItem(KEYS.historico, all);
  return novo;
}

export function deleteHistoricoItem(id: string): void {
  const all = getItem<HistoricoItem[]>(KEYS.historico, []);
  const filtered = all.filter((h) => h.id !== id);
  setItem(KEYS.historico, filtered);
}

// --- Dashboard data ---
export function getDashboardData() {
  const produtos = getProdutos();
  const perfis = getPerfisFiscais();
  const all = getItem<HistoricoItem[]>(KEYS.historico, []);
  all.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const totalProdutos = produtos.length;
  const totalCalculos = all.length;
  const perfisFiscais = perfis.length;

  const margemMedia = all.length > 0
    ? all.reduce((sum, h) => sum + h.margemLucro, 0) / all.length
    : 0;

  const calculosRecentes = all.slice(0, 5).map((h) => ({
    id: h.id,
    produtoNome: h.produtoNome,
    produtoCodigo: h.produtoCodigo,
    precoVenda: h.precoVenda,
    margemLucro: h.margemLucro,
    lucroUnitario: h.lucroUnitario,
    custoUnitario: h.custoUnitario,
    markupMultiplicador: h.markupMultiplicador,
    criadoEm: h.criadoEm,
  }));

  return {
    totalProdutos,
    totalCalculos,
    margemMedia,
    perfisFiscais,
    calculosRecentes,
  };
}

// --- CSV export (client-side) ---
export function exportHistoricoCSV(ids: string[]): void {
  const historicos = getHistoricoByIds(ids);
  if (historicos.length === 0) return;

  const headers = [
    'Data', 'Produto', 'Código', 'Perfil Fiscal', 'Custo Unitário',
    'ICMS (%)', 'PIS (%)', 'COFINS (%)', 'IPI (%)', 'Margem Lucro (%)',
    'Comissão (%)', 'Despesas Operacionais (%)', 'Frete Percentual (%)',
    'Frete Fixo (R$)', 'Total Impostos (%)', 'Total Despesas (%)',
    'Markup Divisor', 'Markup Multiplicador', 'Preço de Venda (R$)',
    'Lucro Unitário (R$)', 'Valor Impostos (R$)', 'Valor Comissão (R$)',
    'Valor Despesas (R$)', 'Valor Frete (R$)', 'Valor Lucro (R$)',
  ];

  const rows = historicos.map((h) => [
    new Date(h.criadoEm).toLocaleString('pt-BR'),
    `"${h.produtoNome}"`,
    `"${h.produtoCodigo}"`,
    `"${h.perfilFiscalNome}"`,
    h.custoUnitario.toFixed(2).replace('.', ','),
    h.icms.toFixed(2).replace('.', ','),
    h.pis.toFixed(2).replace('.', ','),
    h.cofins.toFixed(2).replace('.', ','),
    h.ipi.toFixed(2).replace('.', ','),
    h.margemLucro.toFixed(2).replace('.', ','),
    h.comissaoVendedor.toFixed(2).replace('.', ','),
    h.despesasOperacionais.toFixed(2).replace('.', ','),
    (h.fretePercentual ?? 0).toFixed(2).replace('.', ','),
    (h.freteFixo ?? 0).toFixed(2).replace('.', ','),
    h.totalImpostos.toFixed(2).replace('.', ','),
    h.totalDespesas.toFixed(2).replace('.', ','),
    h.markupDivisor.toFixed(4).replace('.', ','),
    h.markupMultiplicador.toFixed(4).replace('.', ','),
    h.precoVenda.toFixed(2).replace('.', ','),
    h.lucroUnitario.toFixed(2).replace('.', ','),
    h.valorImpostos.toFixed(2).replace('.', ','),
    h.valorComissao.toFixed(2).replace('.', ','),
    h.valorDespesas.toFixed(2).replace('.', ','),
    h.valorFrete.toFixed(2).replace('.', ','),
    h.valorLucro.toFixed(2).replace('.', ','),
  ]);

  const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historico-calculos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
