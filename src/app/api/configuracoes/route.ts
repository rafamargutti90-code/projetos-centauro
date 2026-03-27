import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { configuracaoSchema } from "@/lib/validation";

export async function GET() {
  try {
    let config = await prisma.configuracaoOperacional.findFirst();

    if (!config) {
      config = await prisma.configuracaoOperacional.create({
        data: {
          despesasOperacionais: 8.0,
          comissaoVendedor: 3.0,
          fretePercentual: null,
          freteFixo: null,
          margemLucroPadrao: 15.0,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = configuracaoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let config = await prisma.configuracaoOperacional.findFirst();

    if (!config) {
      config = await prisma.configuracaoOperacional.create({
        data: parsed.data,
      });
    } else {
      config = await prisma.configuracaoOperacional.update({
        where: { id: config.id },
        data: parsed.data,
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
