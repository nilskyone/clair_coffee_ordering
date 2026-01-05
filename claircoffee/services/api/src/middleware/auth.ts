import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors";

export type AuthUser = {
  id: number;
  branchId: number | null;
  role: string;
};

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "unauthorized", "Missing authorization token");
  }

  const token = header.slice("Bearer ".length);
  const secret = process.env.JWT_SECRET || "devsecret";
  try {
    const payload = jwt.verify(token, secret) as AuthUser;
    req.user = payload;
    next();
  } catch (err) {
    throw new AppError(401, "unauthorized", "Invalid token");
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, "forbidden", "Insufficient permissions");
    }
    next();
  };
}
