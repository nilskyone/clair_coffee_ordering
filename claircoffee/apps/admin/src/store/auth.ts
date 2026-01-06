import { create } from "zustand";

type AuthState = {
  token: string;
  setToken: (token: string) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("cc_token") || "",
  setToken: (token) => {
    localStorage.setItem("cc_token", token);
    set({ token });
  }
}));
