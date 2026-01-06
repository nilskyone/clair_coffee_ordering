import React from "react";
import { useOrderStore } from "../store/orders";

export const KitchenDisplay: React.FC = () => {
  const orders = useOrderStore((state) => state.orders);
  const visible = orders.filter((order) => ["PAID", "ACCEPTED", "IN_PROGRESS"].includes(order.status));

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-espresso-900">Kitchen Display</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((order) => (
          <div key={order.id} className="rounded-xl bg-espresso-50 p-6 text-center">
            <p className="text-4xl font-bold text-espresso-900">#{order.orderNo}</p>
            <p className="mt-2 text-sm uppercase tracking-wide text-espresso-700">{order.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
