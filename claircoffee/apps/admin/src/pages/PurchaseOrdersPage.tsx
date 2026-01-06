import React, { useState } from "react";
import { Button, Card, Input } from "@claircoffee/ui";
import { useApiClient } from "../hooks/useApiClient";

export const PurchaseOrdersPage: React.FC = () => {
  const api = useApiClient();
  const [supplierId, setSupplierId] = useState("");
  const [poId, setPoId] = useState("");

  const createPo = async () => {
    await api.createPurchaseOrder({ branchId: 1, supplierId: supplierId ? Number(supplierId) : null });
    setSupplierId("");
  };

  const receivePo = async () => {
    if (!poId) return;
    await api.receivePurchaseOrder(Number(poId));
    setPoId("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-espresso-900">Purchase Orders</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Create PO</h3>
          <Input label="Supplier ID" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} />
          <Button onClick={createPo}>Create</Button>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Receive PO</h3>
          <Input label="Purchase Order ID" value={poId} onChange={(event) => setPoId(event.target.value)} />
          <Button onClick={receivePo}>Mark Received</Button>
        </Card>
      </div>
    </div>
  );
};
