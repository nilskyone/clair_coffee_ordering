import { create } from "zustand";
import { OrderStatus } from "@claircoffee/api-client";

export type KitchenOrder = {
  id: number;
  orderNo: number;
  status: OrderStatus;
  items: Array<{ name: string; quantity: number }>;
  placedAt: string;
};

type OrderState = {
  orders: KitchenOrder[];
  setOrders: (orders: KitchenOrder[]) => void;
  addOrder: (order: KitchenOrder) => void;
  updateStatus: (id: number, status: OrderStatus) => void;
};

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((order) => (order.id === id ? { ...order, status } : order))
    }))
}));
