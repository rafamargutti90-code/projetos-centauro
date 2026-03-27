import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { produtoSchema } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: params.id },
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
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
    const parsed = produtoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.produto.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const duplicateCodigo = await prisma.produto.findFirst({
      where: {
        codigo: parsed.data.codigo,
        id: { not: params.id },
      },
    });

    if (duplicateCodigo) {
      return NextResponse.json(
        { error: "Já existe outro produto com este código" },
        { status: 409 }
      );
    }

    const produto = await prisma.produto.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json(produto);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.produto.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    await prisma.produto.update({
      where: { id: params.id },
      data: { ativo: false },
    });

    return NextResponse.json({ message: "Produto desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
