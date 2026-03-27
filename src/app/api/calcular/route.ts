import { NextRequest, NextResponse } from "next/server";
import { calculoInputSchema } from "@/lib/validation";
import { calcularPreco } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = calculoInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      custoUnitario,
      icms,
      pis,
      cofins,
      ipi,
      margemLucro,
      comissaoVendedor,
      despesasOperacionais,
      fretePercentual,
      freteFixo,
    } = parsed.data;

    const resultado = calcularPreco({
      custoUnitario,
      icms,
      pis,
      cofins,
      ipi,
      margemLucro,
      comissaoVendedor,
      despesasOperacionais,
      fretePercentual,
      freteFixo,
    });

    return NextResponse.json(resultado);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao calcular preço";
    console.error("Erro ao calcular:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
