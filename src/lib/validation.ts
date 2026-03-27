import { z } from "zod";

export const produtoSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório"),
  custoUnitario: z.number().positive("Custo deve ser maior que zero"),
  unidade: z.string().default("UN"),
  ncm: z.string().optional(),
});

export const perfilFiscalSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  icms: z.number().min(0).max(100),
  pis: z.number().min(0).max(100),
  cofins: z.number().min(0).max(100),
  ipi: z.number().min(0).max(100),
  icmsST: z.number().min(0).max(100).optional().nullable(),
  padrao: z.boolean().default(false),
});

export const calculoInputSchema = z
  .object({
    custoUnitario: z.number().positive("Custo deve ser maior que zero"),
    icms: z.number().min(0).max(99.99),
    pis: z.number().min(0).max(99.99),
    cofins: z.number().min(0).max(99.99),
    ipi: z.number().min(0).max(99.99),
    margemLucro: z.number().min(0).max(99.99),
    comissaoVendedor: z.number().min(0).max(99.99),
    despesasOperacionais: z.number().min(0).max(99.99),
    fretePercentual: z.number().min(0).max(99.99).optional(),
    freteFixo: z.number().min(0).optional(),
    produtoId: z.string().optional(),
    produtoNome: z.string().optional(),
    produtoCodigo: z.string().optional(),
    perfilFiscalId: z.string().optional(),
    perfilFiscalNome: z.string().optional(),
  })
  .refine(
    (data) => {
      const total =
        data.icms +
        data.pis +
        data.cofins +
        data.margemLucro +
        data.comissaoVendedor +
        data.despesasOperacionais +
        (data.freteFixo ? 0 : data.fretePercentual || 0);
      return total < 100;
    },
    { message: "A soma dos percentuais deve ser menor que 100%" }
  );

export const configuracaoSchema = z.object({
  despesasOperacionais: z.number().min(0).max(100),
  comissaoVendedor: z.number().min(0).max(100),
  fretePercentual: z.number().min(0).max(100).optional().nullable(),
  freteFixo: z.number().min(0).optional().nullable(),
  margemLucroPadrao: z.number().min(0).max(100),
});
