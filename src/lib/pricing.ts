export interface CalculoInput {
  custoUnitario: number;

  // Impostos
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;

  // Ajustes de ICMS (campos opcionais para expansão)
  reducaoBaseICMS?: number;   // Ex: 61.11% -> ICMS efetivo = 18% * (1 - 0.6111) = 7%
  descontoICMS?: number;      // Desconto direto no % do ICMS (ex: crédito presumido)
  icmsST?: number;            // ICMS Substituição Tributária (% adicional "por fora")

  // Outros custos opcionais
  outrasDespesas?: number;    // % adicional de despesas diversas

  // Operacional
  margemLucro: number;
  comissaoVendedor: number;
  despesasOperacionais: number;
  fretePercentual?: number;
  freteFixo?: number;
}

export interface CalculoResult {
  custoBase: number;

  // ICMS efetivo após ajustes
  icmsEfetivo: number;

  totalImpostosPercent: number;
  totalDespesasPercent: number;
  markupDivisor: number;
  markupMultiplicador: number;
  precoVendaSemIPI: number;
  valorIPI: number;
  valorICMSST: number;
  precoVendaFinal: number;
  valorICMS: number;
  valorPIS: number;
  valorCOFINS: number;
  valorComissao: number;
  valorDespesas: number;
  valorOutrasDespesas: number;
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
    reducaoBaseICMS = 0,
    descontoICMS = 0,
    icmsST = 0,
    outrasDespesas = 0,
    margemLucro,
    comissaoVendedor,
    despesasOperacionais,
    fretePercentual = 0,
    freteFixo,
  } = input;

  // 1. Custo base (custo + frete fixo se houver)
  const custoBase = freteFixo ? custoUnitario + freteFixo : custoUnitario;

  // 2. ICMS efetivo: aplica redução de base e/ou desconto direto
  //    Redução de base: alíquota efetiva = icms * (1 - reducao/100)
  //    Desconto direto: subtrai do resultado (crédito presumido, etc.)
  let icmsEfetivo = icms;
  if (reducaoBaseICMS > 0) {
    icmsEfetivo = icms * (1 - reducaoBaseICMS / 100);
  }
  if (descontoICMS > 0) {
    icmsEfetivo = Math.max(0, icmsEfetivo - descontoICMS);
  }
  icmsEfetivo = round4(icmsEfetivo);

  // 3. Soma de todos os percentuais "por dentro" (IPI e ICMS-ST ficam de fora)
  const totalImpostosPercent = icmsEfetivo + pis + cofins;
  const fretePercUsado = freteFixo ? 0 : fretePercentual;
  const totalDespesasPercent =
    totalImpostosPercent +
    margemLucro +
    comissaoVendedor +
    despesasOperacionais +
    outrasDespesas +
    fretePercUsado;

  // 4. Divisor do markup
  const markupDivisor = 1 - totalDespesasPercent / 100;

  if (markupDivisor <= 0) {
    throw new Error(
      'A soma dos percentuais excede ou iguala 100%. Ajuste os valores.'
    );
  }

  // 5. Multiplicador do markup
  const markupMultiplicador = 1 / markupDivisor;

  // 6. Preço de venda sem IPI/ST
  const precoVendaSemIPI = custoBase / markupDivisor;

  // 7. Impostos "por fora"
  const valorIPI = precoVendaSemIPI * (ipi / 100);
  const valorICMSST = precoVendaSemIPI * (icmsST / 100);
  const precoVendaFinal = precoVendaSemIPI + valorIPI + valorICMSST;

  // 8. Breakdown em BRL (baseado no precoVendaSemIPI pois impostos são "por dentro")
  const valorICMS = precoVendaSemIPI * (icmsEfetivo / 100);
  const valorPIS = precoVendaSemIPI * (pis / 100);
  const valorCOFINS = precoVendaSemIPI * (cofins / 100);
  const valorComissao = precoVendaSemIPI * (comissaoVendedor / 100);
  const valorDespesas = precoVendaSemIPI * (despesasOperacionais / 100);
  const valorOutrasDespesas = precoVendaSemIPI * (outrasDespesas / 100);
  const valorFrete = freteFixo
    ? freteFixo
    : precoVendaSemIPI * (fretePercentual / 100);
  const valorLucro = precoVendaSemIPI * (margemLucro / 100);

  // 9. Lucro unitário e margem real
  const lucroUnitario = valorLucro;
  const margemReal = (valorLucro / precoVendaFinal) * 100;

  return {
    custoBase: round2(custoBase),
    icmsEfetivo: round4(icmsEfetivo),
    totalImpostosPercent: round2(totalImpostosPercent),
    totalDespesasPercent: round2(totalDespesasPercent),
    markupDivisor: round4(markupDivisor),
    markupMultiplicador: round4(markupMultiplicador),
    precoVendaSemIPI: round2(precoVendaSemIPI),
    valorIPI: round2(valorIPI),
    valorICMSST: round2(valorICMSST),
    precoVendaFinal: round2(precoVendaFinal),
    valorICMS: round2(valorICMS),
    valorPIS: round2(valorPIS),
    valorCOFINS: round2(valorCOFINS),
    valorComissao: round2(valorComissao),
    valorDespesas: round2(valorDespesas),
    valorOutrasDespesas: round2(valorOutrasDespesas),
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
