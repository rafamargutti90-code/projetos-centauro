import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalProdutos, totalCalculos, perfisFiscais, calculosRecentes, margemAggregate] =
      await Promise.all([
        prisma.produto.count({ where: { ativo: true } }),
        prisma.historicoCalculo.count(),
        prisma.perfilFiscal.count({ where: { ativo: true } }),
        prisma.historicoCalculo.findMany({
          take: 5,
          orderBy: { criadoEm: "desc" },
          select: {
            id: true,
            produtoNome: true,
            produtoCodigo: true,
            precoVenda: true,
            margemLucro: true,
            lucroUnitario: true,
            custoUnitario: true,
            markupMultiplicador: true,
            criadoEm: true,
          },
        }),
        prisma.historicoCalculo.aggregate({
          _avg: { margemLucro: true },
        }),
      ]);

    const margemMedia = margemAggregate._avg.margemLucro ?? 0;

    return NextResponse.json({
      totalProdutos,
      totalCalculos,
      margemMedia,
      perfisFiscais,
      calculosRecentes,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do dashboard" },
      { status: 500 }
    );
  }
}
