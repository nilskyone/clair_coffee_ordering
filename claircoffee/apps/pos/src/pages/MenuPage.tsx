import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Button } from "@claircoffee/ui";
import { useApiClient } from "../hooks/useApiClient";
import { useCartStore, CartOption } from "../store/cart";

const DEFAULT_BRANCH = 1;

export const MenuPage: React.FC = () => {
  const api = useApiClient();
  const addItem = useCartStore((state) => state.addItem);
  const { data } = useQuery({
    queryKey: ["menu", DEFAULT_BRANCH],
    queryFn: () => api.getMenu(DEFAULT_BRANCH)
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, CartOption[]>>({});

  const products = data?.products ?? [];
  const optionsByProduct = useMemo(() => {
    const map = new Map<number, CartOption[]>();
    (data?.options ?? []).forEach((option) => {
      const existing = map.get(option.product_id) ?? [];
      existing.push({ optionId: option.id, name: option.name, priceDelta: option.price_delta });
      map.set(option.product_id, existing);
    });
    return map;
  }, [data]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-espresso-900">Menu</h2>
        <p className="text-sm text-slate-500">Branch {DEFAULT_BRANCH}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const options = optionsByProduct.get(product.id) ?? [];
          return (
            <Card key={product.id} className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-espresso-900">{product.name}</h3>
                <p className="text-sm text-slate-500">{product.description}</p>
              </div>
              <div className="text-xl font-bold text-espresso-700">₱{product.price.toFixed(2)}</div>
              {options.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-600">Options</p>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => {
                      const isSelected =
                        selectedOptions[product.id]?.some((selected) => selected.optionId === option.optionId) ??
                        false;
                      return (
                        <button
                          key={option.optionId}
                          className={`rounded-full border px-3 py-1 text-xs ${
                            isSelected
                              ? "border-espresso-600 bg-espresso-100 text-espresso-900"
                              : "border-slate-200 text-slate-500"
                          }`}
                          onClick={() => {
                            setSelectedOptions((prev) => {
                              const existing = prev[product.id] ?? [];
                              const next = isSelected
                                ? existing.filter((item) => item.optionId !== option.optionId)
                                : [...existing, option];
                              return { ...prev, [product.id]: next };
                            });
                          }}
                        >
                          {option.name} {option.priceDelta ? `(+₱${option.priceDelta})` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <Button
                onClick={() =>
                  addItem({
                    id: crypto.randomUUID(),
                    productId: product.id,
                    name: product.name,
                    unitPrice: product.price,
                    quantity: 1,
                    options: selectedOptions[product.id] ?? []
                  })
                }
              >
                Add to cart
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
