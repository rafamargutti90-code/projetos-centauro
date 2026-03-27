import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { produtoSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
        ...(search
          ? {
              OR: [
                { nome: { contains: search } },
                { codigo: { contains: search } },
                { fornecedor: { contains: search } },
                { categoria: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(produtos);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao listar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = produtoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.produto.findUnique({
      where: { codigo: parsed.data.codigo },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um produto com este código" },
        { status: 409 }
      );
    }

    const produto = await prisma.produto.create({
      data: parsed.data,
    });

    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
