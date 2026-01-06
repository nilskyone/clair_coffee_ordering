import React, { useState } from "react";
import { Button, Card, Input } from "@claircoffee/ui";
import { useApiClient } from "../hooks/useApiClient";

export const RecipesPage: React.FC = () => {
  const api = useApiClient();
  const [productId, setProductId] = useState("");
  const [stockItemId, setStockItemId] = useState("");
  const [qty, setQty] = useState(0);
  const [unit, setUnit] = useState("ML");

  const submit = async () => {
    if (!productId || !stockItemId) return;
    await api.createRecipe({
      productId: Number(productId),
      lines: [{ stockItemId: Number(stockItemId), quantity: qty, unit }]
    });
    setProductId("");
    setStockItemId("");
    setQty(0);
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold text-espresso-900">Recipes</h2>
      <Input label="Product ID" value={productId} onChange={(event) => setProductId(event.target.value)} />
      <Input label="Stock Item ID" value={stockItemId} onChange={(event) => setStockItemId(event.target.value)} />
      <Input label="Quantity" type="number" value={qty} onChange={(event) => setQty(Number(event.target.value))} />
      <Input label="Unit" value={unit} onChange={(event) => setUnit(event.target.value)} />
      <Button onClick={submit}>Create Recipe</Button>
    </Card>
  );
};
