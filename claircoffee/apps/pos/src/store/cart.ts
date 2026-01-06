import { create } from "zustand";

export type CartOption = {
  optionId: number;
  name: string;
  priceDelta: number;
};

export type CartItem = {
  id: string;
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  options: CartOption[];
};

type CartState = {
  items: CartItem[];
  couponCode: string;
  discountPercent: number;
  phone: string;
  notes: string;
  addItem: (item: CartItem) => void;
  updateQty: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  setCoupon: (code: string) => void;
  setDiscountPercent: (percent: number) => void;
  setPhone: (phone: string) => void;
  setNotes: (notes: string) => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  couponCode: "",
  discountPercent: 0,
  phone: "",
  notes: "",
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item]
    })),
  updateQty: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item))
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    })),
  clear: () =>
    set({
      items: [],
      couponCode: "",
      discountPercent: 0,
      phone: "",
      notes: ""
    }),
  setCoupon: (code) => set({ couponCode: code }),
  setDiscountPercent: (percent) => set({ discountPercent: percent }),
  setPhone: (phone) => set({ phone }),
  setNotes: (notes) => set({ notes })
}));
