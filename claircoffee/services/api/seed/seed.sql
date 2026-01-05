INSERT INTO branches (name, address) VALUES ('Main Branch', '123 Coffee St');

INSERT INTO stock_items (branch_id, name, unit, on_hand, reorder_point, unit_cost)
VALUES
  (1, 'Espresso Beans', 'G', 5000, 1000, 0.5),
  (1, 'Milk', 'ML', 20000, 5000, 0.02),
  (1, 'Sugar', 'G', 3000, 500, 0.01);

INSERT INTO products (branch_id, name, description, price, is_drink, tax_category, is_active)
VALUES
  (1, 'Americano', 'Espresso + Water', 120, 1, 'VAT', 1),
  (1, 'Latte', 'Espresso + Milk', 150, 1, 'VAT', 1),
  (1, 'Croissant', 'Butter croissant', 90, 0, 'VAT', 1);

INSERT INTO product_options (branch_id, product_id, type, name, price_delta, stock_item_id, is_active)
VALUES
  (1, 1, 'TEMPERATURE', 'Hot', 0, NULL, 1),
  (1, 1, 'TEMPERATURE', 'Iced', 10, NULL, 1),
  (1, 2, 'MILK', 'Whole Milk', 0, 2, 1),
  (1, 2, 'MILK', 'Oat Milk', 20, NULL, 1);

INSERT INTO recipes (product_id) VALUES (1), (2);

INSERT INTO recipe_lines (recipe_id, stock_item_id, quantity, unit)
VALUES
  (1, 1, 18, 'G'),
  (1, 2, 120, 'ML'),
  (2, 1, 18, 'G'),
  (2, 2, 180, 'ML');

INSERT INTO coupons (branch_id, code, discount_amount, is_active)
VALUES (1, 'WELCOME10', 10, 1);
