import crypto from "crypto";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { computePricing } from "@claircoffee/utils";
import { withTransaction } from "../db/tx";
import { AppError } from "../utils/errors";
import { emitBranchEvent } from "../ws";

export type CreateOrderInput = {
  branchId: number;
  source: "POS" | "KIOSK" | "DELIVERY_MANUAL";
  orderType: "DINEIN" | "TAKEOUT" | "DELIVERY_PLATFORM";
  customerId?: number | null;
  phone?: string | null;
  clientUuid?: string | null;
  notes?: string | null;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    options?: Array<{ optionId: number; priceDelta: number }>;
  }>;
};

export async function createOrder(input: CreateOrderInput) {
  return withTransaction(async (conn) => {
    const orderDate = new Date().toISOString().slice(0, 10);
    const orderNo = await allocateOrderNo(conn, input.branchId, orderDate);

    const [orderResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO orders
        (branch_id, order_date, order_no, source, order_type, status, customer_id, phone, client_uuid, notes, placed_at)
       VALUES (?, ?, ?, ?, ?, 'PLACED', ?, ?, ?, ?, NOW())`,
      [
        input.branchId,
        orderDate,
        orderNo,
        input.source,
        input.orderType,
        input.customerId || null,
        input.phone || null,
        input.clientUuid || null,
        input.notes || null
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of input.items) {
      const [itemResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO order_items
          (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`
        ,
        [orderId, item.productId, item.quantity, item.unitPrice]
      );
      const orderItemId = itemResult.insertId;
      if (item.options) {
        for (const option of item.options) {
          await conn.execute(
            `INSERT INTO order_item_options
              (order_item_id, option_id, price_delta)
             VALUES (?, ?, ?)`
            ,
            [orderItemId, option.optionId, option.priceDelta]
          );
        }
      }
    }

    emitBranchEvent(input.branchId, "order.created", { orderId, orderNo });
    return { orderId, orderNo };
  });
}

export async function payOrder(orderId: number, method: "CASH" | "CARD" | "GCASH", amountPaid?: number) {
  return withTransaction(async (conn) => {
    const order = await lockOrder(conn, orderId);
    if (order.status !== "PLACED") {
      throw new AppError(400, "invalid_status", "Order is not in PLACED status");
    }
    const pricing = await computeOrderPricing(conn, orderId);
    const totalPaid = amountPaid ?? pricing.grossTotal;
    const [paymentResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO payments (order_id, method, amount, paid_at, status)
       VALUES (?, ?, ?, NOW(), 'PAID')`,
      [orderId, method, totalPaid]
    );
    await conn.execute(
      `UPDATE orders SET status='PAID', subtotal=?, discount_total=?, total_amount=?, vat_amount=?, net_amount=?, paid_at=NOW()
       WHERE id=?`,
      [pricing.subtotal, pricing.discountTotal, pricing.grossTotal, pricing.vat, pricing.net, orderId]
    );

    const rawToken = crypto.randomUUID();
    const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await conn.execute(
      `INSERT INTO order_qr_tokens (order_id, token_hash, created_at)
       VALUES (?, ?, NOW())`,
      [orderId, hash]
    );

    emitBranchEvent(order.branch_id, "order.paid", { orderId, paymentId: paymentResult.insertId });

    return { orderId, total: pricing.grossTotal, token: rawToken };
  });
}

export async function updateStatus(orderId: number, status: string, userId: number | null) {
  return withTransaction(async (conn) => {
    const order = await lockOrder(conn, orderId);
    await conn.execute(
      "UPDATE orders SET status=?, updated_at=NOW(), updated_by_user_id=? WHERE id=?",
      [status, userId, orderId]
    );
    emitBranchEvent(order.branch_id, "order.status_changed", { orderId, status });
    return { orderId, status };
  });
}

export async function completeOrder(orderId: number, userId: number | null) {
  return withTransaction(async (conn) => {
    const order = await lockOrder(conn, orderId);
    if (order.status !== "PAID" && order.status !== "READY") {
      throw new AppError(400, "invalid_status", "Order is not ready to complete");
    }
    const pricing = await computeOrderPricing(conn, orderId);
    const mismatch = Number(order.total_amount || 0) !== pricing.grossTotal;

    await conn.execute(
      "UPDATE orders SET status='COMPLETED', completed_at=NOW(), completed_by_user_id=?, pricing_mismatch_flag=? WHERE id=?",
      [userId, mismatch ? 1 : 0, orderId]
    );

    await consumeInventory(conn, orderId, order.branch_id);
    await applyLoyaltyEarn(conn, orderId, order.customer_id, order.branch_id);

    emitBranchEvent(order.branch_id, "order.completed", { orderId });
    return { orderId, pricingMismatch: mismatch };
  });
}

export async function voidOrder(orderId: number, userId: number | null) {
  return withTransaction(async (conn) => {
    const order = await lockOrder(conn, orderId);
    await conn.execute(
      "UPDATE orders SET status='CANCELED', updated_by_user_id=?, updated_at=NOW() WHERE id=?",
      [userId, orderId]
    );
    emitBranchEvent(order.branch_id, "order.canceled", { orderId });
    return { orderId };
  });
}

export async function refundOrder(orderId: number, userId: number | null) {
  return withTransaction(async (conn) => {
    const order = await lockOrder(conn, orderId);
    if (order.status !== "PAID" && order.status !== "COMPLETED") {
      throw new AppError(400, "invalid_status", "Order cannot be refunded");
    }

    await conn.execute("UPDATE payments SET status='REFUNDED' WHERE order_id=?", [orderId]);
    await conn.execute(
      "UPDATE orders SET status='REFUNDED', refunded_at=NOW(), refunded_by_user_id=? WHERE id=?",
      [userId, orderId]
    );

    await reverseLoyalty(conn, orderId, order.branch_id);

    emitBranchEvent(order.branch_id, "order.refunded", { orderId });
    return { orderId };
  });
}

async function allocateOrderNo(conn: PoolConnection, branchId: number, orderDate: string) {
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT id, current_no FROM order_counters WHERE branch_id=? AND order_date=? FOR UPDATE",
    [branchId, orderDate]
  );
  if (rows.length === 0) {
    await conn.execute(
      "INSERT INTO order_counters (branch_id, order_date, current_no) VALUES (?, ?, 1)",
      [branchId, orderDate]
    );
    return 1;
  }
  const current = rows[0].current_no + 1;
  await conn.execute("UPDATE order_counters SET current_no=? WHERE id=?", [current, rows[0].id]);
  return current;
}

async function lockOrder(conn: PoolConnection, orderId: number) {
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT * FROM orders WHERE id=? FOR UPDATE",
    [orderId]
  );
  const order = rows[0];
  if (!order) {
    throw new AppError(404, "not_found", "Order not found");
  }
  return order as RowDataPacket & {
    id: number;
    status: string;
    branch_id: number;
    customer_id: number | null;
    total_amount: number | null;
  };
}

async function computeOrderPricing(conn: PoolConnection, orderId: number) {
  const [items] = await conn.query<RowDataPacket[]>(
    `SELECT oi.id, oi.quantity, oi.unit_price, IFNULL(SUM(oio.price_delta), 0) AS options_total
     FROM order_items oi
     LEFT JOIN order_item_options oio ON oio.order_item_id = oi.id
     WHERE oi.order_id = ?
     GROUP BY oi.id`,
    [orderId]
  );

  const lines = items.map((item) => ({
    unitPrice: Number(item.unit_price) + Number(item.options_total),
    quantity: Number(item.quantity)
  }));

  return computePricing(lines, 0, 0.12);
}

async function consumeInventory(conn: PoolConnection, orderId: number, branchId: number) {
  const [items] = await conn.query<RowDataPacket[]>(
    `SELECT oi.product_id, oi.quantity
     FROM order_items oi
     WHERE oi.order_id = ?`,
    [orderId]
  );

  for (const item of items) {
    const [recipes] = await conn.query<RowDataPacket[]>(
      "SELECT id, product_id FROM recipes WHERE product_id=?",
      [item.product_id]
    );
    if (recipes.length === 0) {
      continue;
    }
    const recipeId = recipes[0].id;
    const [lines] = await conn.query<RowDataPacket[]>(
      "SELECT stock_item_id, quantity, unit FROM recipe_lines WHERE recipe_id=?",
      [recipeId]
    );

    for (const line of lines) {
      const quantityUsed = Number(line.quantity) * Number(item.quantity);
      await conn.execute(
        `INSERT INTO stock_movements
         (branch_id, stock_item_id, movement_type, quantity, unit, created_at, reference_type, reference_id)
         VALUES (?, ?, 'CONSUME', ?, ?, NOW(), 'ORDER', ?)`
        ,
        [branchId, line.stock_item_id, -quantityUsed, line.unit, orderId]
      );
      await conn.execute(
        "UPDATE stock_items SET on_hand = on_hand - ? WHERE id=?",
        [quantityUsed, line.stock_item_id]
      );
    }
  }
}

async function applyLoyaltyEarn(conn: PoolConnection, orderId: number, customerId: number | null, branchId: number) {
  if (!customerId) {
    return;
  }
  const [items] = await conn.query<RowDataPacket[]>(
    `SELECT oi.quantity, p.is_drink
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  const stamps = items.reduce((sum, row) => sum + (row.is_drink ? Number(row.quantity) : 0), 0);
  if (stamps <= 0) {
    return;
  }

  await conn.execute(
    "INSERT IGNORE INTO loyalty_accounts (customer_id, branch_id, balance) VALUES (?, ?, 0)",
    [customerId, branchId]
  );

  await conn.execute(
    "UPDATE loyalty_accounts SET balance = balance + ? WHERE customer_id=? AND branch_id=?",
    [stamps, customerId, branchId]
  );
  await conn.execute(
    "INSERT INTO loyalty_ledger (customer_id, branch_id, order_id, stamps, created_at) VALUES (?, ?, ?, ?, NOW())",
    [customerId, branchId, orderId, stamps]
  );
}

async function reverseLoyalty(conn: PoolConnection, orderId: number, branchId: number) {
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT id, customer_id, stamps FROM loyalty_ledger WHERE order_id=?",
    [orderId]
  );
  for (const row of rows) {
    await conn.execute(
      "INSERT INTO loyalty_ledger (customer_id, branch_id, order_id, stamps, created_at, reversal_of_ledger_id) VALUES (?, ?, ?, ?, NOW(), ?)",
      [row.customer_id, branchId, orderId, -Number(row.stamps), row.id]
    );
    await conn.execute(
      "UPDATE loyalty_accounts SET balance = balance - ? WHERE customer_id=? AND branch_id=?",
      [Number(row.stamps), row.customer_id, branchId]
    );
  }
}
