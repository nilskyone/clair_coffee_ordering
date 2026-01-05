import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, errorEnvelope } from "../utils/errors";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json(errorEnvelope(err.code, err.message, err.details));
  }
  if (err instanceof ZodError) {
    return res.status(400).json(
      errorEnvelope("validation_error", "Invalid request", {
        issues: err.issues
      })
    );
  }

  console.error(err);
  return res.status(500).json(errorEnvelope("internal_error", "Unexpected server error"));
}
