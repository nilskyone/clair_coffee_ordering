import React from "react";
import { Card, Button } from "@claircoffee/ui";
import { useCartStore } from "../store/cart";
import { calculateSubtotal } from "../utils/pricing";

export const CartPage: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = calculateSubtotal(items);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-espresso-900">Cart</h2>
      {items.length === 0 ? (
        <Card>No items yet. Head back to the menu.</Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-espresso-900">{item.name}</p>
                <p className="text-sm text-slate-500">
                  {item.options.map((option) => option.name).join(", ") || "No options"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}>
                  -
                </Button>
                <span className="min-w-[32px] text-center">{item.quantity}</span>
                <Button variant="secondary" onClick={() => updateQty(item.id, item.quantity + 1)}>
                  +
                </Button>
              </div>
              <div className="text-sm text-slate-600">₱{item.unitPrice.toFixed(2)}</div>
              <Button variant="ghost" onClick={() => removeItem(item.id)}>
                Remove
              </Button>
            </Card>
          ))}
          <Card className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Subtotal</span>
            <span className="text-lg font-semibold text-espresso-900">₱{subtotal.toFixed(2)}</span>
          </Card>
        </div>
      )}
    </div>
  );
};
