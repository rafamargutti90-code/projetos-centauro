import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { perfilFiscalSchema } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const perfil = await prisma.perfilFiscal.findUnique({
      where: { id: params.id },
    });

    if (!perfil) {
      return NextResponse.json(
        { error: "Perfil fiscal não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(perfil);
  } catch (error) {
    console.error("Erro ao buscar perfil fiscal:", error);
    return NextResponse.json(
      { error: "Erro ao buscar perfil fiscal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = perfilFiscalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.perfilFiscal.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Perfil fiscal não encontrado" },
        { status: 404 }
      );
    }

    if (parsed.data.padrao) {
      await prisma.perfilFiscal.updateMany({
        where: { padrao: true, id: { not: params.id } },
        data: { padrao: false },
      });
    }

    const perfil = await prisma.perfilFiscal.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json(perfil);
  } catch (error) {
    console.error("Erro ao atualizar perfil fiscal:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil fiscal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.perfilFiscal.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Perfil fiscal não encontrado" },
        { status: 404 }
      );
    }

    await prisma.perfilFiscal.update({
      where: { id: params.id },
      data: { ativo: false },
    });

    return NextResponse.json({ message: "Perfil fiscal desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir perfil fiscal:", error);
    return NextResponse.json(
      { error: "Erro ao excluir perfil fiscal" },
      { status: 500 }
    );
  }
}
