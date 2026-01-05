export type VatBreakdown = {
  net: number;
  vat: number;
  gross: number;
};

export function computeVatFromGross(gross: number, vatRate = 0.12): VatBreakdown {
  const net = roundMoney(gross / (1 + vatRate));
  const vat = roundMoney(gross - net);
  return { net, vat, gross: roundMoney(gross) };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
