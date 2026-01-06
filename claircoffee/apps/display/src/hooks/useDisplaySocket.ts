import { useEffect } from "react";
import { createSocketClient, OrderStatus } from "@claircoffee/api-client";
import { useDisplayStore } from "../store/orders";

const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:3001";

export function useDisplaySocket() {
  const updateStatus = useDisplayStore((state) => state.updateStatus);
  const setOrders = useDisplayStore((state) => state.setOrders);

  useEffect(() => {
    const socket = createSocketClient({ baseUrl: wsUrl, branchId: 1 });

    socket.on("order.paid", (order: any) => {
      setOrders([
        {
          id: order.id,
          orderNo: order.orderNo ?? order.order_no ?? order.id,
          status: "PAID"
        },
        ...useDisplayStore.getState().orders
      ]);
    });

    socket.on("order.status", (payload: { id: number; status: OrderStatus }) => {
      updateStatus(payload.id, payload.status);
    });

    return () => socket.disconnect();
  }, [setOrders, updateStatus]);
}
