import { createApiClient } from "@claircoffee/api-client";
import { useAuthStore } from "../store/auth";

const defaultApiBaseUrl =
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? `${window.location.origin}/api`
    : "http://localhost:3001";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

export function useApiClient() {
  const token = useAuthStore((state) => state.token);
  return createApiClient({
    baseUrl: apiBaseUrl,
    getToken: () => token
  });
}
