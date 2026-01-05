import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const schema = z.object({ branchId: z.string() });
    const { branchId } = schema.parse(req.query);
    const threshold = Number(process.env.DEFAULT_STOCK_THRESHOLD || 0);

    const [products] = await pool.query(
      `SELECT id, name, description, price, is_drink, tax_category, available_from, available_to
       FROM products WHERE branch_id = ? AND is_active = 1`,
      [branchId]
    );
    const [options] = await pool.query(
      `SELECT po.id, po.product_id, po.type, po.name, po.price_delta, po.stock_item_id, si.on_hand
       FROM product_options po
       LEFT JOIN stock_items si ON si.id = po.stock_item_id
       WHERE po.branch_id = ? AND po.is_active = 1`,
      [branchId]
    );
    const [bundles] = await pool.query(
      `SELECT id, name, price, available_from, available_to FROM bundles WHERE branch_id = ? AND is_active = 1`,
      [branchId]
    );
    const [bundleItems] = await pool.query(
      `SELECT bi.bundle_id, bi.product_id, bi.quantity FROM bundle_items bi`,
      []
    );

    const optionRows = (options as any[]).filter((option) => {
      if (!option.stock_item_id) {
        return true;
      }
      return Number(option.on_hand ?? 0) > threshold;
    });

    res.json({
      products,
      options: optionRows,
      bundles,
      bundleItems
    });
  })
);

export default router;
