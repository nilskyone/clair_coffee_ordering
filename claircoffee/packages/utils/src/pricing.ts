import { computeVatFromGross, roundMoney } from "./vat";

export type LineItem = {
  unitPrice: number;
  quantity: number;
};

export type PricingResult = {
  subtotal: number;
  discountTotal: number;
  grossTotal: number;
  vat: number;
  net: number;
};

export function computePricing(lines: LineItem[], discountTotal = 0, vatRate = 0.12): PricingResult {
  const subtotal = roundMoney(
    lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  );
  const grossTotal = roundMoney(Math.max(0, subtotal - discountTotal));
  const vatBreakdown = computeVatFromGross(grossTotal, vatRate);
  return {
    subtotal,
    discountTotal: roundMoney(discountTotal),
    grossTotal,
    vat: vatBreakdown.vat,
    net: vatBreakdown.net
  };
}
