import { create } from "zustand";

export type ToastMessage = {
  id: string;
  message: string;
  variant?: "success" | "warning" | "error";
};

type UiState = {
  adminPinOpen: boolean;
  toasts: ToastMessage[];
  openAdminPin: () => void;
  closeAdminPin: () => void;
  pushToast: (toast: ToastMessage) => void;
  removeToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  adminPinOpen: false,
  toasts: [],
  openAdminPin: () => set({ adminPinOpen: true }),
  closeAdminPin: () => set({ adminPinOpen: false }),
  pushToast: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
