import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input } from "@claircoffee/ui";
import { useApiClient } from "../hooks/useApiClient";

export const InventoryPage: React.FC = () => {
  const api = useApiClient();
  const { data: items = [], refetch } = useQuery({
    queryKey: ["inventory", "stock"],
    queryFn: () => api.listStockItems()
  });

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("PCS");
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("");
  const [stockItemId, setStockItemId] = useState("");

  const addStock = async () => {
    await api.createStockItem({
      branchId: 1,
      name,
      unit,
      onHand: qty,
      reorderPoint: 5
    });
    setName("");
    setQty(0);
    refetch();
  };

  const adjustStock = async () => {
    if (!stockItemId) return;
    await api.postAdjust({
      branchId: 1,
      stockItemId: Number(stockItemId),
      quantity: qty,
      unit,
      reason
    });
    setReason("");
    refetch();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-espresso-900">Inventory</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Stock Items</h3>
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Unit" value={unit} onChange={(event) => setUnit(event.target.value)} />
          <Input label="Opening Qty" type="number" value={qty} onChange={(event) => setQty(Number(event.target.value))} />
          <Button onClick={addStock}>Add Item</Button>
          <ul className="text-sm text-slate-600">
            {items.map((item: any) => (
              <li key={item.id}>
                {item.name} - {item.on_hand} {item.unit}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Adjust / Wastage</h3>
          <Input
            label="Stock Item ID"
            value={stockItemId}
            onChange={(event) => setStockItemId(event.target.value)}
          />
          <Input label="Qty" type="number" value={qty} onChange={(event) => setQty(Number(event.target.value))} />
          <Input label="Unit" value={unit} onChange={(event) => setUnit(event.target.value)} />
          <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
          <Button onClick={adjustStock}>Adjust Stock</Button>
        </Card>
      </div>
    </div>
  );
};
