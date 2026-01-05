import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";
import { AppError } from "../utils/errors";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const [rows] = await pool.query(
    "SELECT id, branch_id, role, password_hash FROM users WHERE username = ?",
    [body.username]
  );
  const users = rows as Array<{ id: number; branch_id: number | null; role: string; password_hash: string }>;
  const user = users[0];
  if (!user) {
    throw new AppError(401, "invalid_credentials", "Invalid username or password");
  }
  const ok = await bcrypt.compare(body.password, user.password_hash);
  if (!ok) {
    throw new AppError(401, "invalid_credentials", "Invalid username or password");
  }
  const token = jwt.sign(
    { id: user.id, branchId: user.branch_id, role: user.role },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "12h" }
  );
    res.json({ token });
  })
);

export default router;
