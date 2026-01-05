import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { authRequired } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authRequired);

const productSchema = z.object({
  branchId: z.number(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  isDrink: z.boolean(),
  taxCategory: z.string().default("VAT")
});

router.get(
  "/products",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  })
);

router.post(
  "/products",
  asyncHandler(async (req, res) => {
    const body = productSchema.parse(req.body);
    const [result] = await pool.execute(
      `INSERT INTO products (branch_id, name, description, price, is_drink, tax_category, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [body.branchId, body.name, body.description || null, body.price, body.isDrink ? 1 : 0, body.taxCategory]
    );
    res.json({ id: (result as any).insertId });
  })
);

router.put(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const body = productSchema.partial().parse(req.body);
    await pool.execute(
      `UPDATE products SET name=COALESCE(?, name), description=COALESCE(?, description), price=COALESCE(?, price),
       is_drink=COALESCE(?, is_drink), tax_category=COALESCE(?, tax_category)
       WHERE id=?`,
      [
        body.name ?? null,
        body.description ?? null,
        body.price ?? null,
        body.isDrink === undefined ? null : body.isDrink ? 1 : 0,
        body.taxCategory ?? null,
        req.params.id
      ]
    );
    res.json({ ok: true });
  })
);

router.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    await pool.execute("UPDATE products SET is_active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  })
);

const optionSchema = z.object({
  branchId: z.number(),
  productId: z.number(),
  type: z.enum(["TEMPERATURE", "BEANS", "MILK", "ADDON"]),
  name: z.string(),
  priceDelta: z.number().default(0),
  stockItemId: z.number().nullable().optional()
});

router.get(
  "/options",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT * FROM product_options");
    res.json(rows);
  })
);

router.post(
  "/options",
  asyncHandler(async (req, res) => {
    const body = optionSchema.parse(req.body);
    const [result] = await pool.execute(
      `INSERT INTO product_options (branch_id, product_id, type, name, price_delta, stock_item_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [body.branchId, body.productId, body.type, body.name, body.priceDelta, body.stockItemId || null]
    );
    res.json({ id: (result as any).insertId });
  })
);

router.put(
  "/options/:id",
  asyncHandler(async (req, res) => {
    const body = optionSchema.partial().parse(req.body);
    await pool.execute(
      `UPDATE product_options SET name=COALESCE(?, name), price_delta=COALESCE(?, price_delta),
       stock_item_id=COALESCE(?, stock_item_id) WHERE id=?`,
      [body.name ?? null, body.priceDelta ?? null, body.stockItemId ?? null, req.params.id]
    );
    res.json({ ok: true });
  })
);

router.delete(
  "/options/:id",
  asyncHandler(async (req, res) => {
    await pool.execute("UPDATE product_options SET is_active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  })
);

const bundleSchema = z.object({
  branchId: z.number(),
  name: z.string(),
  price: z.number()
});

router.get(
  "/bundles",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT * FROM bundles");
    res.json(rows);
  })
);

router.post(
  "/bundles",
  asyncHandler(async (req, res) => {
    const body = bundleSchema.parse(req.body);
    const [result] = await pool.execute(
      "INSERT INTO bundles (branch_id, name, price, is_active) VALUES (?, ?, ?, 1)",
      [body.branchId, body.name, body.price]
    );
    res.json({ id: (result as any).insertId });
  })
);

router.put(
  "/bundles/:id",
  asyncHandler(async (req, res) => {
    const body = bundleSchema.partial().parse(req.body);
    await pool.execute(
      "UPDATE bundles SET name=COALESCE(?, name), price=COALESCE(?, price) WHERE id=?",
      [body.name ?? null, body.price ?? null, req.params.id]
    );
    res.json({ ok: true });
  })
);

router.delete(
  "/bundles/:id",
  asyncHandler(async (req, res) => {
    await pool.execute("UPDATE bundles SET is_active=0 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  })
);

const stockSchema = z.object({
  branchId: z.number(),
  name: z.string(),
  unit: z.enum(["ML", "G", "PCS"]),
  onHand: z.number().default(0),
  reorderPoint: z.number().default(0)
});

router.get(
  "/stock-items",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT * FROM stock_items");
    res.json(rows);
  })
);

router.post(
  "/stock-items",
  asyncHandler(async (req, res) => {
    const body = stockSchema.parse(req.body);
    const [result] = await pool.execute(
      `INSERT INTO stock_items (branch_id, name, unit, on_hand, reorder_point)
       VALUES (?, ?, ?, ?, ?)`,
      [body.branchId, body.name, body.unit, body.onHand, body.reorderPoint]
    );
    res.json({ id: (result as any).insertId });
  })
);

const conversionSchema = z.object({
  fromUnit: z.enum(["ML", "G", "PCS"]),
  toUnit: z.enum(["ML", "G", "PCS"]),
  multiplier: z.number()
});

router.get(
  "/unit-conversions",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query("SELECT * FROM unit_conversions");
    res.json(rows);
  })
);

router.post(
  "/unit-conversions",
  asyncHandler(async (req, res) => {
    const body = conversionSchema.parse(req.body);
    const [result] = await pool.execute(
      "INSERT INTO unit_conversions (from_unit, to_unit, multiplier) VALUES (?, ?, ?)",
      [body.fromUnit, body.toUnit, body.multiplier]
    );
    res.json({ id: (result as any).insertId });
  })
);

const recipeSchema = z.object({
  productId: z.number(),
  lines: z.array(
    z.object({
      stockItemId: z.number(),
      quantity: z.number(),
      unit: z.enum(["ML", "G", "PCS"])
    })
  )
});

router.post(
  "/recipes",
  asyncHandler(async (req, res) => {
    const body = recipeSchema.parse(req.body);
    const [result] = await pool.execute("INSERT INTO recipes (product_id) VALUES (?)", [body.productId]);
    const recipeId = (result as any).insertId;
    for (const line of body.lines) {
      await pool.execute(
        "INSERT INTO recipe_lines (recipe_id, stock_item_id, quantity, unit) VALUES (?, ?, ?, ?)",
        [recipeId, line.stockItemId, line.quantity, line.unit]
      );
    }
    res.json({ id: recipeId });
  })
);

const poSchema = z.object({
  branchId: z.number(),
  supplierId: z.number().nullable().optional()
});

router.post(
  "/purchase-orders",
  asyncHandler(async (req, res) => {
    const body = poSchema.parse(req.body);
    const [result] = await pool.execute(
      "INSERT INTO purchase_orders (branch_id, supplier_id, status, created_at) VALUES (?, ?, 'OPEN', NOW())",
      [body.branchId, body.supplierId || null]
    );
    res.json({ id: (result as any).insertId });
  })
);

const poItemSchema = z.object({
  stockItemId: z.number(),
  quantity: z.number(),
  unitCost: z.number()
});

router.post(
  "/purchase-orders/:id/items",
  asyncHandler(async (req, res) => {
    const body = poItemSchema.parse(req.body);
    await pool.execute(
      "INSERT INTO purchase_order_items (purchase_order_id, stock_item_id, quantity, unit_cost) VALUES (?, ?, ?, ?)",
      [req.params.id, body.stockItemId, body.quantity, body.unitCost]
    );
    res.json({ ok: true });
  })
);

router.post(
  "/purchase-orders/:id/receive",
  asyncHandler(async (req, res) => {
    const [items] = await pool.query(
      "SELECT stock_item_id, quantity FROM purchase_order_items WHERE purchase_order_id=?",
      [req.params.id]
    );
    for (const item of items as any[]) {
      await pool.execute(
        `INSERT INTO stock_movements
         (branch_id, stock_item_id, movement_type, quantity, unit, created_at, reference_type, reference_id)
         VALUES ((SELECT branch_id FROM purchase_orders WHERE id=?), ?, 'RECEIVE', ?, (SELECT unit FROM stock_items WHERE id=?), NOW(), 'PO', ?)`,
        [req.params.id, item.stock_item_id, item.quantity, item.stock_item_id, req.params.id]
      );
      await pool.execute(
        "UPDATE stock_items SET on_hand = on_hand + ? WHERE id=?",
        [item.quantity, item.stock_item_id]
      );
    }
    await pool.execute("UPDATE purchase_orders SET status='RECEIVED', received_at=NOW() WHERE id=?", [
      req.params.id
    ]);
    res.json({ ok: true });
  })
);

const movementSchema = z.object({
  branchId: z.number(),
  stockItemId: z.number(),
  quantity: z.number(),
  unit: z.enum(["ML", "G", "PCS"]),
  reason: z.string()
});

router.post(
  "/wastage",
  asyncHandler(async (req, res) => {
    const body = movementSchema.parse(req.body);
    await pool.execute(
      `INSERT INTO stock_movements
       (branch_id, stock_item_id, movement_type, quantity, unit, created_at, reason)
       VALUES (?, ?, 'WASTAGE', ?, ?, NOW(), ?)`,
      [body.branchId, body.stockItemId, -Math.abs(body.quantity), body.unit, body.reason]
    );
    await pool.execute("UPDATE stock_items SET on_hand = on_hand - ? WHERE id=?", [
      Math.abs(body.quantity),
      body.stockItemId
    ]);
    res.json({ ok: true });
  })
);

router.post(
  "/adjust",
  asyncHandler(async (req, res) => {
    const body = movementSchema.parse(req.body);
    await pool.execute(
      `INSERT INTO stock_movements
       (branch_id, stock_item_id, movement_type, quantity, unit, created_at, reason)
       VALUES (?, ?, 'ADJUST', ?, ?, NOW(), ?)`,
      [body.branchId, body.stockItemId, body.quantity, body.unit, body.reason]
    );
    await pool.execute("UPDATE stock_items SET on_hand = on_hand + ? WHERE id=?", [
      body.quantity,
      body.stockItemId
    ]);
    res.json({ ok: true });
  })
);

const countSchema = z.object({
  branchId: z.number(),
  lines: z.array(
    z.object({
      stockItemId: z.number(),
      countedQty: z.number(),
      unit: z.enum(["ML", "G", "PCS"])
    })
  )
});

router.post(
  "/counts",
  asyncHandler(async (req, res) => {
    const body = countSchema.parse(req.body);
    const [result] = await pool.execute(
      "INSERT INTO inventory_counts (branch_id, status, created_at) VALUES (?, 'DRAFT', NOW())",
      [body.branchId]
    );
    const countId = (result as any).insertId;
    for (const line of body.lines) {
      await pool.execute(
        "INSERT INTO inventory_count_lines (inventory_count_id, stock_item_id, counted_qty, unit) VALUES (?, ?, ?, ?)",
        [countId, line.stockItemId, line.countedQty, line.unit]
      );
    }
    res.json({ id: countId });
  })
);

router.post(
  "/counts/:id/submit",
  asyncHandler(async (req, res) => {
    await pool.execute("UPDATE inventory_counts SET status='SUBMITTED' WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  })
);

router.post(
  "/counts/:id/post",
  asyncHandler(async (req, res) => {
    const [lines] = await pool.query(
      "SELECT stock_item_id, counted_qty, unit FROM inventory_count_lines WHERE inventory_count_id=?",
      [req.params.id]
    );
    for (const line of lines as any[]) {
      const [items] = await pool.query("SELECT on_hand FROM stock_items WHERE id=?", [line.stock_item_id]);
      const current = (items as any[])[0]?.on_hand ?? 0;
      const diff = Number(line.counted_qty) - Number(current);
      if (diff !== 0) {
        await pool.execute(
          `INSERT INTO stock_movements
           (branch_id, stock_item_id, movement_type, quantity, unit, created_at, reference_type, reference_id)
           VALUES ((SELECT branch_id FROM inventory_counts WHERE id=?), ?, 'COUNT', ?, ?, NOW(), 'COUNT', ?)`,
          [req.params.id, line.stock_item_id, diff, line.unit, req.params.id]
        );
        await pool.execute("UPDATE stock_items SET on_hand = ? WHERE id=?", [
          line.counted_qty,
          line.stock_item_id
        ]);
      }
    }
    await pool.execute("UPDATE inventory_counts SET status='POSTED', posted_at=NOW() WHERE id=?", [
      req.params.id
    ]);
    res.json({ ok: true });
  })
);

export default router;
