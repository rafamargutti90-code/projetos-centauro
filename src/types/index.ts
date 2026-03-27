export type { CalculoInput, CalculoResult } from "@/lib/pricing";

export interface ProdutoForm {
  codigo: string;
  nome: string;
  categoria: string;
  fornecedor: string;
  custoUnitario: number;
  unidade: string;
  ncm?: string;
}

export interface PerfilFiscalForm {
  nome: string;
  descricao?: string;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  icmsST?: number | null;
  padrao: boolean;
}

export interface ConfiguracaoForm {
  despesasOperacionais: number;
  comissaoVendedor: number;
  fretePercentual?: number | null;
  freteFixo?: number | null;
  margemLucroPadrao: number;
}
