import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { pool } from "../db/pool";
import { AppError } from "../utils/errors";
import {
  completeOrder,
  createOrder,
  payOrder,
  refundOrder,
  updateStatus,
  voidOrder
} from "../services/orderService";

const router = Router();

const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  options: z
    .array(
      z.object({
        optionId: z.number(),
        priceDelta: z.number().default(0)
      })
    )
    .optional()
});

const createSchema = z.object({
  branchId: z.number(),
  source: z.enum(["POS", "KIOSK", "DELIVERY_MANUAL"]),
  orderType: z.enum(["DINEIN", "TAKEOUT", "DELIVERY_PLATFORM"]),
  customerId: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  clientUuid: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(orderItemSchema).min(1)
});

router.post(
  "/",
  authRequired,
  asyncHandler(async (req, res) => {
    const body = createSchema.parse(req.body);
    const result = await createOrder(body);
    res.json(result);
  })
);

const syncSchema = z.object({
  orders: z.array(createSchema)
});

router.post(
  "/sync",
  authRequired,
  asyncHandler(async (req, res) => {
    const body = syncSchema.parse(req.body);
    const results: Array<{ orderId: number; orderNo: number; clientUuid: string | null }> = [];
    for (const order of body.orders) {
      if (order.clientUuid) {
        const [rows] = await pool.query("SELECT id, order_no FROM orders WHERE client_uuid = ?", [
          order.clientUuid
        ]);
        const existing = rows as Array<{ id: number; order_no: number }>;
        if (existing.length > 0) {
          results.push({ orderId: existing[0].id, orderNo: existing[0].order_no, clientUuid: order.clientUuid });
          continue;
        }
      }
      const result = await createOrder(order);
      results.push({ ...result, clientUuid: order.clientUuid || null });
    }
    res.json({ results });
  })
);

const paySchema = z.object({
  method: z.enum(["CASH", "CARD", "GCASH"]),
  amountPaid: z.number().optional()
});

router.post(
  "/:id/pay",
  authRequired,
  asyncHandler(async (req, res) => {
    const body = paySchema.parse(req.body);
    const result = await payOrder(Number(req.params.id), body.method, body.amountPaid);
    res.json(result);
  })
);

const statusSchema = z.object({
  status: z.enum(["PLACED", "PAID", "ACCEPTED", "IN_PROGRESS", "READY", "COMPLETED", "CANCELED", "REFUNDED"])
});

router.post(
  "/:id/status",
  authRequired,
  asyncHandler(async (req, res) => {
    const body = statusSchema.parse(req.body);
    const result = await updateStatus(Number(req.params.id), body.status, req.user?.id || null);
    res.json(result);
  })
);

router.post(
  "/:id/complete",
  authRequired,
  asyncHandler(async (req, res) => {
    const result = await completeOrder(Number(req.params.id), req.user?.id || null);
    res.json(result);
  })
);

const adminSchema = z.object({
  adminPin: z.string()
});

router.post(
  "/:id/void",
  authRequired,
  asyncHandler(async (req, res) => {
    const { adminPin } = adminSchema.parse(req.body);
    if (adminPin !== (process.env.ADMIN_PIN || "1234")) {
      throw new AppError(403, "invalid_pin", "Invalid admin pin");
    }
    const result = await voidOrder(Number(req.params.id), req.user?.id || null);
    res.json(result);
  })
);

router.post(
  "/:id/refund",
  authRequired,
  asyncHandler(async (req, res) => {
    const { adminPin } = adminSchema.parse(req.body);
    if (adminPin !== (process.env.ADMIN_PIN || "1234")) {
      throw new AppError(403, "invalid_pin", "Invalid admin pin");
    }
    const result = await refundOrder(Number(req.params.id), req.user?.id || null);
    res.json(result);
  })
);

export default router;
