export interface CalculoInput {
  custoUnitario: number;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  margemLucro: number;
  comissaoVendedor: number;
  despesasOperacionais: number;
  fretePercentual?: number;
  freteFixo?: number;
}

export interface CalculoResult {
  custoBase: number;
  totalImpostosPercent: number;
  totalDespesasPercent: number;
  markupDivisor: number;
  markupMultiplicador: number;
  precoVendaSemIPI: number;
  valorIPI: number;
  precoVendaFinal: number;
  valorICMS: number;
  valorPIS: number;
  valorCOFINS: number;
  valorComissao: number;
  valorDespesas: number;
  valorFrete: number;
  valorLucro: number;
  lucroUnitario: number;
  margemReal: number;
}

export function calcularPreco(input: CalculoInput): CalculoResult {
  const {
    custoUnitario,
    icms,
    pis,
    cofins,
    ipi,
    margemLucro,
    comissaoVendedor,
    despesasOperacionais,
    fretePercentual = 0,
    freteFixo,
  } = input;

  // 1. Custo base (custo + frete fixo se houver)
  const custoBase = freteFixo ? custoUnitario + freteFixo : custoUnitario;

  // 2. Soma de todos os percentuais (IPI fica de fora - é "por fora")
  const totalImpostosPercent = icms + pis + cofins;
  const fretePercUsado = freteFixo ? 0 : fretePercentual;
  const totalDespesasPercent =
    totalImpostosPercent +
    margemLucro +
    comissaoVendedor +
    despesasOperacionais +
    fretePercUsado;

  // 3. Divisor do markup
  const markupDivisor = 1 - totalDespesasPercent / 100;

  if (markupDivisor <= 0) {
    throw new Error(
      "A soma dos percentuais excede ou iguala 100%. Ajuste os valores."
    );
  }

  // 4. Multiplicador do markup
  const markupMultiplicador = 1 / markupDivisor;

  // 5. Preço de venda sem IPI
  const precoVendaSemIPI = custoBase / markupDivisor;

  // 6. IPI é aplicado "por fora"
  const valorIPI = precoVendaSemIPI * (ipi / 100);
  const precoVendaFinal = precoVendaSemIPI + valorIPI;

  // 7. Breakdown em BRL (baseado no precoVendaSemIPI pois impostos são "por dentro")
  const valorICMS = precoVendaSemIPI * (icms / 100);
  const valorPIS = precoVendaSemIPI * (pis / 100);
  const valorCOFINS = precoVendaSemIPI * (cofins / 100);
  const valorComissao = precoVendaSemIPI * (comissaoVendedor / 100);
  const valorDespesas = precoVendaSemIPI * (despesasOperacionais / 100);
  const valorFrete = freteFixo
    ? freteFixo
    : precoVendaSemIPI * (fretePercentual / 100);
  const valorLucro = precoVendaSemIPI * (margemLucro / 100);

  // 8. Lucro unitário e margem real
  const lucroUnitario = valorLucro;
  const margemReal = (valorLucro / precoVendaFinal) * 100;

  return {
    custoBase: round2(custoBase),
    totalImpostosPercent: round2(totalImpostosPercent),
    totalDespesasPercent: round2(totalDespesasPercent),
    markupDivisor: round4(markupDivisor),
    markupMultiplicador: round4(markupMultiplicador),
    precoVendaSemIPI: round2(precoVendaSemIPI),
    valorIPI: round2(valorIPI),
    precoVendaFinal: round2(precoVendaFinal),
    valorICMS: round2(valorICMS),
    valorPIS: round2(valorPIS),
    valorCOFINS: round2(valorCOFINS),
    valorComissao: round2(valorComissao),
    valorDespesas: round2(valorDespesas),
    valorFrete: round2(valorFrete),
    valorLucro: round2(valorLucro),
    lucroUnitario: round2(lucroUnitario),
    margemReal: round2(margemReal),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
