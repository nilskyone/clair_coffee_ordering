import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Input, Button } from "@claircoffee/ui";
import { useApiClient } from "../hooks/useApiClient";
import { useUiStore } from "../store/ui";

export const RefundPage: React.FC = () => {
  const { id } = useParams();
  const api = useApiClient();
  const [pin, setPin] = useState("");
  const pushToast = useUiStore((state) => state.pushToast);

  const submit = async () => {
    if (!id) return;
    try {
      await api.refundOrder(Number(id), pin);
      pushToast({ id: `refund-${Date.now()}`, message: "Refunded", variant: "success" });
    } catch (error) {
      pushToast({ id: `refund-error-${Date.now()}`, message: "Refund failed", variant: "error" });
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold text-espresso-900">Refund Order #{id}</h2>
      <Input label="Admin PIN" type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
      <Button onClick={submit}>Refund</Button>
    </Card>
  );
};
