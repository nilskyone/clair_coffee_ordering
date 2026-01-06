import { createApiClient } from "@claircoffee/api-client";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export function useApiClient() {
  return createApiClient({
    baseUrl: apiBaseUrl,
    getToken: () => localStorage.getItem("cc_token")
  });
}
