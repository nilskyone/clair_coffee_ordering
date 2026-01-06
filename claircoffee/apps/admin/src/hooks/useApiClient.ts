import { createApiClient } from "@claircoffee/api-client";
import { useAuthStore } from "../store/auth";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export function useApiClient() {
  const token = useAuthStore((state) => state.token);
  return createApiClient({
    baseUrl: apiBaseUrl,
    getToken: () => token
  });
}
