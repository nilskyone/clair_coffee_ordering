CREATE TABLE IF NOT EXISTS branches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  pin VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS shifts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL,
  opened_at TIMESTAMP NULL,
  closed_at TIMESTAMP NULL,
  opening_cash DECIMAL(10,2) DEFAULT 0,
  closing_cash DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(30) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  balance INT DEFAULT 0,
  UNIQUE KEY uniq_loyalty (customer_id, branch_id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS loyalty_ledger (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  order_id BIGINT,
  stamps INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reversal_of_ledger_id BIGINT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_drink TINYINT(1) DEFAULT 0,
  tax_category VARCHAR(50),
  available_from DATE NULL,
  available_to DATE NULL,
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS product_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price_delta DECIMAL(10,2) DEFAULT 0,
  stock_item_id BIGINT NULL,
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS bundles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available_from DATE NULL,
  available_to DATE NULL,
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bundle_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (bundle_id) REFERENCES bundles(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  order_date DATE NOT NULL,
  order_no INT NOT NULL,
  source VARCHAR(20) NOT NULL,
  order_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  customer_id BIGINT NULL,
  phone VARCHAR(30),
  client_uuid VARCHAR(36),
  notes TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_total DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) DEFAULT 0,
  pricing_mismatch_flag TINYINT(1) DEFAULT 0,
  placed_at TIMESTAMP NULL,
  paid_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  refunded_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  updated_by_user_id BIGINT NULL,
  completed_by_user_id BIGINT NULL,
  refunded_by_user_id BIGINT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS order_item_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_item_id BIGINT NOT NULL,
  option_id BIGINT NOT NULL,
  price_delta DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  method VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS order_qr_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_token (token_hash),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS order_counters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  order_date DATE NOT NULL,
  current_no INT NOT NULL,
  UNIQUE KEY uniq_counter (branch_id, order_date)
);

CREATE TABLE IF NOT EXISTS coupons (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  code VARCHAR(50) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  UNIQUE KEY uniq_coupon (branch_id, code)
);

CREATE TABLE IF NOT EXISTS order_discounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  coupon_id BIGINT NULL,
  amount DECIMAL(10,2) NOT NULL,
  approved_by_user_id BIGINT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS stock_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  on_hand DECIMAL(12,2) DEFAULT 0,
  reorder_point DECIMAL(12,2) DEFAULT 0,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS unit_conversions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  from_unit VARCHAR(10) NOT NULL,
  to_unit VARCHAR(10) NOT NULL,
  multiplier DECIMAL(12,4) NOT NULL
);

CREATE TABLE IF NOT EXISTS recipes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS recipe_lines (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  recipe_id BIGINT NOT NULL,
  stock_item_id BIGINT NOT NULL,
  quantity DECIMAL(12,4) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id),
  FOREIGN KEY (stock_item_id) REFERENCES stock_items(id)
);

CREATE TABLE IF NOT EXISTS suppliers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  supplier_id BIGINT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NULL,
  received_at TIMESTAMP NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  purchase_order_id BIGINT NOT NULL,
  stock_item_id BIGINT NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (stock_item_id) REFERENCES stock_items(id)
);

CREATE TABLE IF NOT EXISTS stock_lots (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  stock_item_id BIGINT NOT NULL,
  lot_code VARCHAR(100),
  quantity DECIMAL(12,2) NOT NULL,
  expires_at DATE NULL,
  FOREIGN KEY (stock_item_id) REFERENCES stock_items(id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  stock_item_id BIGINT NOT NULL,
  movement_type VARCHAR(20) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reference_type VARCHAR(20),
  reference_id BIGINT NULL,
  reason VARCHAR(255),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (stock_item_id) REFERENCES stock_items(id)
);

CREATE TABLE IF NOT EXISTS inventory_counts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NULL,
  posted_at TIMESTAMP NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS inventory_count_lines (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  inventory_count_id BIGINT NOT NULL,
  stock_item_id BIGINT NOT NULL,
  counted_qty DECIMAL(12,2) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  FOREIGN KEY (inventory_count_id) REFERENCES inventory_counts(id),
  FOREIGN KEY (stock_item_id) REFERENCES stock_items(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  branch_id BIGINT NULL,
  user_id BIGINT NULL,
  action VARCHAR(255) NOT NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_branch_status ON orders(branch_id, status, placed_at);
CREATE UNIQUE INDEX idx_orders_unique_no ON orders(branch_id, order_date, order_no);
CREATE UNIQUE INDEX idx_order_qr_token ON order_qr_tokens(token_hash);
CREATE INDEX idx_stock_movements ON stock_movements(branch_id, stock_item_id, created_at);
CREATE UNIQUE INDEX idx_coupons ON coupons(branch_id, code);
