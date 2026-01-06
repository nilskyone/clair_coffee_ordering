import { openDB } from "idb";
import { CreateOrderPayload } from "@claircoffee/api-client";

export type OfflineOrder = {
  clientUuid: string;
  payload: CreateOrderPayload;
  paymentMethod?: "CASH" | "CARD" | "GCASH";
  amountPaid?: number;
};

const DB_NAME = "claircoffee-pos";
const STORE_NAME = "offline-orders";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "clientUuid" });
      }
    }
  });
}

export async function queueOfflineOrder(order: OfflineOrder) {
  const db = await getDb();
  await db.put(STORE_NAME, order);
}

export async function listOfflineOrders(): Promise<OfflineOrder[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function removeOfflineOrder(clientUuid: string) {
  const db = await getDb();
  await db.delete(STORE_NAME, clientUuid);
}
