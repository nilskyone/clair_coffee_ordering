import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { authRequired } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const identifySchema = z.object({
  orderId: z.number(),
  phone: z.string()
});

router.post(
  "/identify",
  authRequired,
  asyncHandler(async (req, res) => {
    const body = identifySchema.parse(req.body);
    const [customers] = await pool.query("SELECT id FROM customers WHERE phone = ?", [body.phone]);
    let customerId = (customers as any[])[0]?.id;
    if (!customerId) {
      const [result] = await pool.execute(
        "INSERT INTO customers (phone, created_at) VALUES (?, NOW())",
        [body.phone]
      );
      customerId = (result as any).insertId;
    }
    await pool.execute("UPDATE orders SET customer_id=?, phone=? WHERE id=?", [
      customerId,
      body.phone,
      body.orderId
    ]);
    res.json({ customerId });
  })
);

export default router;
