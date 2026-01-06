import { useEffect } from "react";
import { createSocketClient, OrderStatus } from "@claircoffee/api-client";
import { useOrderStore } from "../store/orders";

const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:3001";

function playAlert() {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  oscillator.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.2);
}

export function useKitchenSocket() {
  const addOrder = useOrderStore((state) => state.addOrder);
  const updateStatus = useOrderStore((state) => state.updateStatus);

  useEffect(() => {
    const socket = createSocketClient({ baseUrl: wsUrl, branchId: 1 });

    socket.on("order.paid", (order: any) => {
      addOrder({
        id: order.id,
        orderNo: order.orderNo ?? order.order_no ?? order.id,
        status: "PAID",
        items: order.items ?? [],
        placedAt: order.placedAt ?? new Date().toISOString()
      });
      playAlert();
    });

    socket.on("order.status", (payload: { id: number; status: OrderStatus }) => {
      updateStatus(payload.id, payload.status);
    });

    return () => {
      socket.disconnect();
    };
  }, [addOrder, updateStatus]);
}
