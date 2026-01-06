import { io, Socket } from "socket.io-client";

export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => string | null;
};

export type MenuProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_drink: number;
  tax_category: string;
  available_from: string | null;
  available_to: string | null;
};

export type MenuOption = {
  id: number;
  product_id: number;
  type: "TEMPERATURE" | "BEANS" | "MILK" | "ADDON";
  name: string;
  price_delta: number;
  stock_item_id: number | null;
  on_hand?: number | null;
};

export type MenuBundle = {
  id: number;
  name: string;
  price: number;
  available_from: string | null;
  available_to: string | null;
};

export type MenuBundleItem = {
  bundle_id: number;
  product_id: number;
  quantity: number;
};

export type MenuResponse = {
  products: MenuProduct[];
  options: MenuOption[];
  bundles: MenuBundle[];
  bundleItems: MenuBundleItem[];
};

export type OrderItemPayload = {
  productId: number;
  quantity: number;
  unitPrice: number;
  options?: Array<{ optionId: number; priceDelta: number }>;
};

export type CreateOrderPayload = {
  branchId: number;
  source: "POS" | "KIOSK" | "DELIVERY_MANUAL";
  orderType: "DINEIN" | "TAKEOUT" | "DELIVERY_PLATFORM";
  customerId?: number | null;
  phone?: string | null;
  clientUuid?: string | null;
  notes?: string | null;
  items: OrderItemPayload[];
};

export type OrderStatus =
  | "PLACED"
  | "PAID"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "READY"
  | "COMPLETED"
  | "CANCELED"
  | "REFUNDED";

export type LoginResponse = { token: string };

export type CreateOrderResponse = { orderId: number; orderNo: number };

export type SyncOrdersResponse = {
  results: Array<{ orderId: number; orderNo: number; clientUuid: string | null }>;
};

export type ReportRow = Record<string, string | number | null>;

export type SocketOptions = {
  baseUrl: string;
  token?: string | null;
  branchId?: number | string | null;
};

function buildHeaders(options: ApiClientOptions, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  headers.set("content-type", "application/json");
  const token = options.getToken?.();
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
}

async function request<T>(options: ApiClientOptions, path: string, init?: RequestInit): Promise<T> {
  const url = `${options.baseUrl}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: buildHeaders(options, init)
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function createApiClient(options: ApiClientOptions) {
  return {
    login: (username: string, password: string) =>
      request<LoginResponse>(options, "/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      }),
    getMenu: (branchId: number) =>
      request<MenuResponse>(options, `/v1/menu?branchId=${branchId}`),
    createOrder: (payload: CreateOrderPayload) =>
      request<CreateOrderResponse>(options, "/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    syncOrders: (orders: CreateOrderPayload[]) =>
      request<SyncOrdersResponse>(options, "/v1/orders/sync", {
        method: "POST",
        body: JSON.stringify({ orders })
      }),
    payOrder: (orderId: number, method: "CASH" | "CARD" | "GCASH", amountPaid?: number) =>
      request<CreateOrderResponse>(options, `/v1/orders/${orderId}/pay`, {
        method: "POST",
        body: JSON.stringify({ method, amountPaid })
      }),
    updateStatus: (orderId: number, status: OrderStatus) =>
      request<{ ok: boolean }>(options, `/v1/orders/${orderId}/status`, {
        method: "POST",
        body: JSON.stringify({ status })
      }),
    completeOrder: (orderId: number) =>
      request<{ ok: boolean }>(options, `/v1/orders/${orderId}/complete`, {
        method: "POST"
      }),
    voidOrder: (orderId: number, adminPin: string) =>
      request<{ ok: boolean }>(options, `/v1/orders/${orderId}/void`, {
        method: "POST",
        body: JSON.stringify({ adminPin })
      }),
    refundOrder: (orderId: number, adminPin: string) =>
      request<{ ok: boolean }>(options, `/v1/orders/${orderId}/refund`, {
        method: "POST",
        body: JSON.stringify({ adminPin })
      }),
    identifyCustomer: (orderId: number, phone: string) =>
      request<{ customerId: number }>(options, "/v1/customers/identify", {
        method: "POST",
        body: JSON.stringify({ orderId, phone })
      }),
    trackOrder: (token: string) =>
      request<{ id: number; status: OrderStatus; order_no: number; order_date: string }>(
        options,
        `/v1/public/orders/track?token=${encodeURIComponent(token)}`
      ),
    getReportSalesDaily: (branchId: number, format?: "csv") =>
      request<ReportRow[]>(
        options,
        `/v1/reports/sales/daily?branchId=${branchId}${format ? `&format=${format}` : ""}`
      ),
    getReportBestSellers: (branchId: number, format?: "csv") =>
      request<ReportRow[]>(
        options,
        `/v1/reports/best-sellers?branchId=${branchId}${format ? `&format=${format}` : ""}`
      ),
    getReportTimeOfDay: (branchId: number, format?: "csv") =>
      request<ReportRow[]>(
        options,
        `/v1/reports/time-of-day?branchId=${branchId}${format ? `&format=${format}` : ""}`
      ),
    getReportInventoryUsage: (branchId: number, format?: "csv") =>
      request<ReportRow[]>(
        options,
        `/v1/reports/inventory-usage?branchId=${branchId}${format ? `&format=${format}` : ""}`
      ),
    getReportCogsMargin: (branchId: number, format?: "csv") =>
      request<ReportRow[]>(
        options,
        `/v1/reports/cogs-margin?branchId=${branchId}${format ? `&format=${format}` : ""}`
      ),
    listProducts: () => request<any[]>(options, "/v1/inventory/products"),
    createProduct: (payload: any) =>
      request<{ id: number }>(options, "/v1/inventory/products", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    updateProduct: (id: number, payload: any) =>
      request<{ ok: boolean }>(options, `/v1/inventory/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
    listOptions: () => request<any[]>(options, "/v1/inventory/options"),
    createOption: (payload: any) =>
      request<{ id: number }>(options, "/v1/inventory/options", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    updateOption: (id: number, payload: any) =>
      request<{ ok: boolean }>(options, `/v1/inventory/options/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
    listBundles: () => request<any[]>(options, "/v1/inventory/bundles"),
    createBundle: (payload: any) =>
      request<{ id: number }>(options, "/v1/inventory/bundles", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    updateBundle: (id: number, payload: any) =>
      request<{ ok: boolean }>(options, `/v1/inventory/bundles/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
    listStockItems: () => request<any[]>(options, "/v1/inventory/stock-items"),
    createStockItem: (payload: any) =>
      request<{ id: number }>(options, "/v1/inventory/stock-items", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    createRecipe: (payload: any) =>
      request<{ id: number }>(options, "/v1/inventory/recipes", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    createPurchaseOrder: (payload: any) =>
      request<{ id: number }>(options, "/v1/inventory/purchase-orders", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    receivePurchaseOrder: (id: number) =>
      request<{ ok: boolean }>(options, `/v1/inventory/purchase-orders/${id}/receive`, {
        method: "POST"
      }),
    postWastage: (payload: any) =>
      request<{ ok: boolean }>(options, "/v1/inventory/wastage", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    postAdjust: (payload: any) =>
      request<{ ok: boolean }>(options, "/v1/inventory/adjust", {
        method: "POST",
        body: JSON.stringify(payload)
      })
  };
}

function normalizeSocketBaseUrl(baseUrl: string) {
  if (typeof window !== "undefined" && window.location.protocol === "https:" && baseUrl.startsWith("http://")) {
    return baseUrl.replace("http://", "https://");
  }
  return baseUrl;
}

export function createSocketClient({ baseUrl, token, branchId }: SocketOptions): Socket {
  const socket = io(normalizeSocketBaseUrl(baseUrl), {
    transports: ["websocket"],
    auth: token ? { token } : undefined
  });
  if (branchId) {
    socket.emit("join", { branchId });
  }
  return socket;
}
