import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const [historicos, total] = await Promise.all([
      prisma.historicoCalculo.findMany({
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
        include: {
          produto: { select: { id: true, nome: true, codigo: true } },
          perfilFiscal: { select: { id: true, nome: true } },
        },
      }),
      prisma.historicoCalculo.count(),
    ]);

    return NextResponse.json({
      data: historicos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao listar histórico:", error);
    return NextResponse.json(
      { error: "Erro ao listar histórico" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const historico = await prisma.historicoCalculo.create({
      data: {
        produtoId: body.produtoId || null,
        produtoNome: body.produtoNome || "Produto avulso",
        produtoCodigo: body.produtoCodigo || "---",
        perfilFiscalId: body.perfilFiscalId || null,
        perfilFiscalNome: body.perfilFiscalNome || "Manual",
        custoUnitario: body.custoUnitario,
        icms: body.icms,
        pis: body.pis,
        cofins: body.cofins,
        ipi: body.ipi,
        margemLucro: body.margemLucro,
        comissaoVendedor: body.comissaoVendedor,
        despesasOperacionais: body.despesasOperacionais,
        fretePercentual: body.fretePercentual || null,
        freteFixo: body.freteFixo || null,
        totalImpostos: body.totalImpostos,
        totalDespesas: body.totalDespesas,
        markupDivisor: body.markupDivisor,
        markupMultiplicador: body.markupMultiplicador,
        precoVenda: body.precoVenda,
        lucroUnitario: body.lucroUnitario,
        valorImpostos: body.valorImpostos,
        valorComissao: body.valorComissao,
        valorDespesas: body.valorDespesas,
        valorFrete: body.valorFrete,
        valorLucro: body.valorLucro,
        observacao: body.observacao || null,
      },
    });

    return NextResponse.json(historico, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
    return NextResponse.json(
      { error: "Erro ao salvar histórico" },
      { status: 500 }
    );
  }
}
