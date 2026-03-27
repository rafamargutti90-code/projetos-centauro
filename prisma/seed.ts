import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Perfis Fiscais padrão para Bahia
  await prisma.perfilFiscal.createMany({
    data: [
      {
        nome: "Lucro Presumido - Padrão BA",
        descricao: "Regime Lucro Presumido com alíquotas padrão da Bahia",
        icms: 18.0,
        pis: 0.65,
        cofins: 3.0,
        ipi: 0.0,
        padrao: true,
      },
      {
        nome: "Lucro Real - Padrão BA",
        descricao: "Regime Lucro Real com PIS/COFINS não-cumulativo",
        icms: 18.0,
        pis: 1.65,
        cofins: 7.6,
        ipi: 0.0,
      },
      {
        nome: "Simples Nacional - Faixa 1",
        descricao: "Simples Nacional - impostos inclusos no DAS (inserir taxa em despesas)",
        icms: 0.0,
        pis: 0.0,
        cofins: 0.0,
        ipi: 0.0,
      },
      {
        nome: "ICMS-ST (Substituído)",
        descricao: "Produto com Substituição Tributária - ICMS já recolhido",
        icms: 0.0,
        pis: 0.65,
        cofins: 3.0,
        ipi: 0.0,
      },
      {
        nome: "Bebidas com IPI",
        descricao: "Perfil para bebidas sujeitas a IPI",
        icms: 18.0,
        pis: 0.65,
        cofins: 3.0,
        ipi: 5.0,
      },
    ],
  });

  // Configuração operacional padrão
  await prisma.configuracaoOperacional.create({
    data: {
      despesasOperacionais: 8.0,
      comissaoVendedor: 3.0,
      fretePercentual: 2.0,
      margemLucroPadrao: 15.0,
    },
  });

  // Produtos de exemplo
  await prisma.produto.createMany({
    data: [
      {
        codigo: "PRD001",
        nome: "Arroz Tipo 1 - 5kg",
        categoria: "Grãos e Cereais",
        fornecedor: "Distribuidora Nordeste",
        custoUnitario: 18.5,
        unidade: "PCT",
      },
      {
        codigo: "PRD002",
        nome: "Feijão Carioca - 1kg",
        categoria: "Grãos e Cereais",
        fornecedor: "Distribuidora Nordeste",
        custoUnitario: 7.9,
        unidade: "PCT",
      },
      {
        codigo: "PRD003",
        nome: "Óleo de Soja - 900ml",
        categoria: "Óleos e Gorduras",
        fornecedor: "Cargill Alimentos",
        custoUnitario: 5.2,
        unidade: "UN",
      },
      {
        codigo: "PRD004",
        nome: "Açúcar Cristal - 5kg",
        categoria: "Açúcar e Adoçantes",
        fornecedor: "Usina Bahia",
        custoUnitario: 14.8,
        unidade: "PCT",
      },
      {
        codigo: "PRD005",
        nome: "Refrigerante Cola - 2L",
        categoria: "Bebidas",
        fornecedor: "Ambev",
        custoUnitario: 4.5,
        unidade: "UN",
      },
    ],
  });

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
