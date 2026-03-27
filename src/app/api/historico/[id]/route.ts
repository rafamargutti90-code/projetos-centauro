import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const historico = await prisma.historicoCalculo.findUnique({
      where: { id: params.id },
      include: {
        produto: { select: { id: true, nome: true, codigo: true } },
        perfilFiscal: { select: { id: true, nome: true } },
      },
    });

    if (!historico) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.historicoCalculo.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    await prisma.historicoCalculo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Registro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir histórico:", error);
    return NextResponse.json(
      { error: "Erro ao excluir histórico" },
      { status: 500 }
    );
  }
}
