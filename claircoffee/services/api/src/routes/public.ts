import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { pool } from "../db/pool";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

const router = Router();

router.get(
  "/orders/track",
  asyncHandler(async (req, res) => {
    const schema = z.object({ token: z.string() });
    const { token } = schema.parse(req.query);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [rows] = await pool.query(
      `SELECT o.id, o.status, o.order_no, o.order_date
       FROM order_qr_tokens t
       JOIN orders o ON o.id = t.order_id
       WHERE t.token_hash = ?`,
      [tokenHash]
    );
    const result = (rows as any[])[0];
    if (!result) {
      throw new AppError(404, "not_found", "Order not found");
    }
    res.json(result);
  })
);

export default router;
