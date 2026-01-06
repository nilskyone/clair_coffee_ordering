import { useEffect, useRef } from "react";
import { listOfflineOrders, removeOfflineOrder } from "../data/offlineQueue";
import { useApiClient } from "./useApiClient";
import { useUiStore } from "../store/ui";

export function useOfflineSync() {
  const api = useApiClient();
  const pushToast = useUiStore((state) => state.pushToast);
  const syncingRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (syncingRef.current || !navigator.onLine) return;
      syncingRef.current = true;
      try {
        const queued = await listOfflineOrders();
        if (queued.length === 0) {
          return;
        }
        const response = await api.syncOrders(queued.map((order) => order.payload));
        for (const result of response.results) {
          const matched = queued.find((order) => order.clientUuid === result.clientUuid);
          if (matched?.paymentMethod) {
            await api.payOrder(result.orderId, matched.paymentMethod, matched.amountPaid);
          }
          if (result.clientUuid) {
            await removeOfflineOrder(result.clientUuid);
          }
        }
        pushToast({
          id: `sync-${Date.now()}`,
          message: "Offline orders synced.",
          variant: "success"
        });
      } catch (error) {
        pushToast({
          id: `sync-error-${Date.now()}`,
          message: "Sync failed. Will retry.",
          variant: "warning"
        });
      } finally {
        syncingRef.current = false;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api, pushToast]);
}
