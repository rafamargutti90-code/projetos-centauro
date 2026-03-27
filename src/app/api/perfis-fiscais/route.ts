import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { perfilFiscalSchema } from "@/lib/validation";

export async function GET() {
  try {
    const perfis = await prisma.perfilFiscal.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(perfis);
  } catch (error) {
    console.error("Erro ao listar perfis fiscais:", error);
    return NextResponse.json(
      { error: "Erro ao listar perfis fiscais" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = perfilFiscalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.padrao) {
      await prisma.perfilFiscal.updateMany({
        where: { padrao: true },
        data: { padrao: false },
      });
    }

    const perfil = await prisma.perfilFiscal.create({
      data: parsed.data,
    });

    return NextResponse.json(perfil, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar perfil fiscal:", error);
    return NextResponse.json(
      { error: "Erro ao criar perfil fiscal" },
      { status: 500 }
    );
  }
}
