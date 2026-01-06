import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Button } from "@claircoffee/ui";
import { useOrderStore } from "../store/orders";
import { useApiClient } from "../hooks/useApiClient";

const statusColumns = ["PAID", "ACCEPTED", "IN_PROGRESS", "READY"] as const;

const statusFlow: Record<string, string> = {
  PAID: "ACCEPTED",
  ACCEPTED: "IN_PROGRESS",
  IN_PROGRESS: "READY",
  READY: "COMPLETED"
};

export const KitchenBoard: React.FC = () => {
  const api = useApiClient();
  const orders = useOrderStore((state) => state.orders);
  const setOrders = useOrderStore((state) => state.setOrders);
  const updateStatus = useOrderStore((state) => state.updateStatus);

  const { data } = useQuery({
    queryKey: ["kitchen", "seed"],
    queryFn: async () =>
      Promise.resolve([
        {
          id: 101,
          orderNo: 101,
          status: "PAID",
          items: [
            { name: "Latte", quantity: 1 },
            { name: "Muffin", quantity: 2 }
          ],
          placedAt: new Date().toISOString()
        }
      ])
  });

  useEffect(() => {
    if (orders.length === 0 && data) {
      setOrders(data);
    }
  }, [data, orders.length, setOrders]);

  const handleAdvance = async (orderId: number, currentStatus: string) => {
    const nextStatus = statusFlow[currentStatus];
    if (!nextStatus) return;
    updateStatus(orderId, nextStatus as any);
    if (nextStatus === "COMPLETED") {
      await api.completeOrder(orderId);
    } else {
      await api.updateStatus(orderId, nextStatus as any);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-espresso-900">Kitchen Queue</h2>
      <div className="grid gap-4 lg:grid-cols-4">
        {statusColumns.map((status) => (
          <div key={status} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500">{status}</h3>
            <div className="space-y-3">
              {orders
                .filter((order) => order.status === status)
                .map((order) => (
                  <Card key={order.id} className="space-y-2">
                    <div className="text-lg font-semibold text-espresso-900">#{order.orderNo}</div>
                    <ul className="text-sm text-slate-600">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {item.name}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => handleAdvance(order.id, order.status)}>Advance</Button>
                    {status === "READY" && (
                      <Button variant="secondary" onClick={() => handleAdvance(order.id, order.status)}>
                        Mark Complete
                      </Button>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
