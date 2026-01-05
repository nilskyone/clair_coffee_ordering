import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { authRequired } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const openSchema = z.object({
  branchId: z.number(),
  userId: z.number(),
  openingCash: z.number().default(0)
});

router.post(
  "/open",
  authRequired,
  asyncHandler(async (req, res) => {
    const body = openSchema.parse(req.body);
    const [result] = await pool.execute(
      `INSERT INTO shifts (branch_id, user_id, status, opened_at, opening_cash)
       VALUES (?, ?, 'OPEN', NOW(), ?)`,
      [body.branchId, body.userId, body.openingCash]
    );
    res.json({ id: (result as any).insertId });
  })
);

const closeSchema = z.object({
  closingCash: z.number(),
  notes: z.string().optional()
});

router.post(
  "/:id/close",
  authRequired,
  asyncHandler(async (req, res) => {
    const body = closeSchema.parse(req.body);
    await pool.execute(
      `UPDATE shifts SET status='CLOSED', closed_at=NOW(), closing_cash=?, notes=? WHERE id=?`,
      [body.closingCash, body.notes || null, req.params.id]
    );
    res.json({ ok: true });
  })
);

export default router;
