import { create } from "zustand";
import { OrderStatus } from "@claircoffee/api-client";

export type DisplayOrder = {
  id: number;
  orderNo: number;
  status: OrderStatus;
  completedAt?: string;
};

type DisplayState = {
  orders: DisplayOrder[];
  setOrders: (orders: DisplayOrder[]) => void;
  updateStatus: (id: number, status: OrderStatus) => void;
};

export const useDisplayStore = create<DisplayState>((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  updateStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status, completedAt: status === "COMPLETED" ? new Date().toISOString() : order.completedAt } : order
      )
    }))
}));
