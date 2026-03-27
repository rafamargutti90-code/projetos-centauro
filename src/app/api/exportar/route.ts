import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = body.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "É necessário fornecer ao menos um ID" },
        { status: 400 }
      );
    }

    const historicos = await prisma.historicoCalculo.findMany({
      where: { id: { in: ids } },
      orderBy: { criadoEm: "desc" },
    });

    if (historicos.length === 0) {
      return NextResponse.json(
        { error: "Nenhum registro encontrado" },
        { status: 404 }
      );
    }

    const headers = [
      "Data",
      "Produto",
      "Código",
      "Perfil Fiscal",
      "Custo Unitário",
      "ICMS (%)",
      "PIS (%)",
      "COFINS (%)",
      "IPI (%)",
      "Margem Lucro (%)",
      "Comissão (%)",
      "Despesas Operacionais (%)",
      "Frete Percentual (%)",
      "Frete Fixo (R$)",
      "Total Impostos (%)",
      "Total Despesas (%)",
      "Markup Divisor",
      "Markup Multiplicador",
      "Preço de Venda (R$)",
      "Lucro Unitário (R$)",
      "Valor Impostos (R$)",
      "Valor Comissão (R$)",
      "Valor Despesas (R$)",
      "Valor Frete (R$)",
      "Valor Lucro (R$)",
    ];

    const rows = historicos.map((h) => [
      new Date(h.criadoEm).toLocaleString("pt-BR"),
      `"${h.produtoNome}"`,
      `"${h.produtoCodigo}"`,
      `"${h.perfilFiscalNome}"`,
      h.custoUnitario.toFixed(2).replace(".", ","),
      h.icms.toFixed(2).replace(".", ","),
      h.pis.toFixed(2).replace(".", ","),
      h.cofins.toFixed(2).replace(".", ","),
      h.ipi.toFixed(2).replace(".", ","),
      h.margemLucro.toFixed(2).replace(".", ","),
      h.comissaoVendedor.toFixed(2).replace(".", ","),
      h.despesasOperacionais.toFixed(2).replace(".", ","),
      (h.fretePercentual ?? 0).toFixed(2).replace(".", ","),
      (h.freteFixo ?? 0).toFixed(2).replace(".", ","),
      h.totalImpostos.toFixed(2).replace(".", ","),
      h.totalDespesas.toFixed(2).replace(".", ","),
      h.markupDivisor.toFixed(4).replace(".", ","),
      h.markupMultiplicador.toFixed(4).replace(".", ","),
      h.precoVenda.toFixed(2).replace(".", ","),
      h.lucroUnitario.toFixed(2).replace(".", ","),
      h.valorImpostos.toFixed(2).replace(".", ","),
      h.valorComissao.toFixed(2).replace(".", ","),
      h.valorDespesas.toFixed(2).replace(".", ","),
      h.valorFrete.toFixed(2).replace(".", ","),
      h.valorLucro.toFixed(2).replace(".", ","),
    ]);

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="historico-calculos.csv"',
      },
    });
  } catch (error) {
    console.error("Erro ao exportar:", error);
    return NextResponse.json(
      { error: "Erro ao exportar dados" },
      { status: 500 }
    );
  }
}
