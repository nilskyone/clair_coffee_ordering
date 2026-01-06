import { CartItem } from "../store/cart";

export function calculateSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => {
    const optionTotal = item.options.reduce((optSum, opt) => optSum + opt.priceDelta, 0);
    return sum + (item.unitPrice + optionTotal) * item.quantity;
  }, 0);
}

export function applyDiscount(subtotal: number, discountPercent: number) {
  const discount = subtotal * (discountPercent / 100);
  return {
    discount,
    total: subtotal - discount
  };
}

export function computeVatBreakdown(total: number, vatRate = 0.12) {
  const net = total / (1 + vatRate);
  const vat = total - net;
  return { net, vat };
}
