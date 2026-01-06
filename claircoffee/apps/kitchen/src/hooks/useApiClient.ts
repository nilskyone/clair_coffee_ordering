import { createApiClient } from "@claircoffee/api-client";

const defaultApiBaseUrl =
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? `${window.location.origin}/api`
    : "http://localhost:3001";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

export function useApiClient() {
  return createApiClient({
    baseUrl: apiBaseUrl,
    getToken: () => localStorage.getItem("cc_token")
  });
}
