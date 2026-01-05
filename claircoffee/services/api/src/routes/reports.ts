import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { authRequired } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
router.use(authRequired);

function toCsv(rows: any[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  }
  return lines.join("\n");
}

router.get(
  "/sales/daily",
  asyncHandler(async (req, res) => {
    const schema = z.object({ branchId: z.string(), format: z.string().optional() });
    const { branchId, format } = schema.parse(req.query);
    const [rows] = await pool.query(
      `SELECT order_date, COUNT(*) AS orders, SUM(total_amount) AS gross_total
       FROM orders WHERE branch_id=? AND status IN ('PAID','COMPLETED')
       GROUP BY order_date ORDER BY order_date DESC`,
      [branchId]
    );
    if (format === "csv") {
      res.setHeader("content-type", "text/csv");
      return res.send(toCsv(rows as any[]));
    }
    res.json(rows);
  })
);

router.get(
  "/best-sellers",
  asyncHandler(async (req, res) => {
    const schema = z.object({ branchId: z.string(), format: z.string().optional() });
    const { branchId, format } = schema.parse(req.query);
    const [rows] = await pool.query(
      `SELECT p.name, SUM(oi.quantity) AS qty
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       WHERE o.branch_id=? AND o.status IN ('PAID','COMPLETED')
       GROUP BY p.name
       ORDER BY qty DESC`,
      [branchId]
    );
    if (format === "csv") {
      res.setHeader("content-type", "text/csv");
      return res.send(toCsv(rows as any[]));
    }
    res.json(rows);
  })
);

router.get(
  "/time-of-day",
  asyncHandler(async (req, res) => {
    const schema = z.object({ branchId: z.string(), format: z.string().optional() });
    const { branchId, format } = schema.parse(req.query);
    const [rows] = await pool.query(
      `SELECT HOUR(placed_at) AS hour, COUNT(*) AS orders
       FROM orders WHERE branch_id=?
       GROUP BY hour ORDER BY hour`,
      [branchId]
    );
    if (format === "csv") {
      res.setHeader("content-type", "text/csv");
      return res.send(toCsv(rows as any[]));
    }
    res.json(rows);
  })
);

router.get(
  "/inventory-usage",
  asyncHandler(async (req, res) => {
    const schema = z.object({ branchId: z.string(), format: z.string().optional() });
    const { branchId, format } = schema.parse(req.query);
    const [rows] = await pool.query(
      `SELECT si.name, SUM(sm.quantity) AS usage
       FROM stock_movements sm
       JOIN stock_items si ON si.id = sm.stock_item_id
       WHERE sm.branch_id=? AND sm.movement_type='CONSUME'
       GROUP BY si.name`,
      [branchId]
    );
    if (format === "csv") {
      res.setHeader("content-type", "text/csv");
      return res.send(toCsv(rows as any[]));
    }
    res.json(rows);
  })
);

router.get(
  "/cogs-margin",
  asyncHandler(async (req, res) => {
    const schema = z.object({ branchId: z.string(), format: z.string().optional() });
    const { branchId, format } = schema.parse(req.query);
    const [rows] = await pool.query(
      `SELECT o.order_date, SUM(o.total_amount) AS revenue,
       SUM(IFNULL(sm.quantity,0) * IFNULL(si.unit_cost,0) * -1) AS cogs
       FROM orders o
       LEFT JOIN stock_movements sm ON sm.reference_type='ORDER' AND sm.reference_id=o.id
       LEFT JOIN stock_items si ON si.id = sm.stock_item_id
       WHERE o.branch_id=? AND o.status IN ('PAID','COMPLETED')
       GROUP BY o.order_date`,
      [branchId]
    );
    if (format === "csv") {
      res.setHeader("content-type", "text/csv");
      return res.send(toCsv(rows as any[]));
    }
    res.json(rows);
  })
);

export default router;
