import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { pool } from "./pool";

dotenv.config();

async function run() {
  const seedPath = path.resolve(__dirname, "../../seed/seed.sql");
  const sql = fs.readFileSync(seedPath, "utf8");
  await pool.query(sql);

  const passwordHash = await bcrypt.hash("password123", 10);
  await pool.execute(
    `INSERT INTO users (branch_id, username, password_hash, role, pin)\n     VALUES\n      (1, 'admin', ?, 'ADMIN', '1234'),\n      (1, 'cashier', ?, 'CASHIER', NULL),\n      (1, 'barista', ?, 'BARISTA', NULL),\n      (1, 'inventory', ?, 'INVENTORY', NULL)`,
    [passwordHash, passwordHash, passwordHash, passwordHash]
  );
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
