import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDisplayStore } from "../store/orders";

const seedOrders = [
  { id: 401, orderNo: 401, status: "ACCEPTED" },
  { id: 402, orderNo: 402, status: "READY" }
];

export const DisplayPage: React.FC = () => {
  const orders = useDisplayStore((state) => state.orders);
  const setOrders = useDisplayStore((state) => state.setOrders);

  const { data } = useQuery({
    queryKey: ["display", "poll"],
    queryFn: async () => Promise.resolve(seedOrders),
    refetchInterval: 15000
  });

  useEffect(() => {
    if (orders.length === 0 && data) {
      setOrders(data as any);
    }
  }, [data, orders.length, setOrders]);

  const nowMaking = orders.filter((order) => ["ACCEPTED", "IN_PROGRESS"].includes(order.status));
  const ready = orders.filter((order) => order.status === "READY");
  const completed = orders.filter((order) => order.status === "COMPLETED").slice(0, 6);

  return (
    <div className="min-h-screen bg-espresso-900 px-10 py-8 text-white">
      <div className="grid gap-8 lg:grid-cols-3">
        <section>
          <h2 className="text-2xl font-semibold text-espresso-100">Now Making</h2>
          <div className="mt-4 space-y-4">
            {nowMaking.map((order) => (
              <div key={order.id} className="rounded-xl bg-espresso-800 p-6 text-4xl font-bold">
                #{order.orderNo}
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-espresso-100">Ready for Pickup</h2>
          <div className="mt-4 space-y-4">
            {ready.map((order) => (
              <div key={order.id} className="rounded-xl bg-amber-500 p-6 text-4xl font-bold text-espresso-900">
                #{order.orderNo}
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-espresso-100">Recently Completed</h2>
          <div className="mt-4 space-y-3">
            {completed.map((order) => (
              <div key={order.id} className="rounded-xl bg-espresso-700 p-4 text-2xl font-semibold">
                #{order.orderNo}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
