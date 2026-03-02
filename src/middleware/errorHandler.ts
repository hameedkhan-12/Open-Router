import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";
import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    const message = err.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return res.status(422).json({ error: message, code: "VALIDATION_ERROR" });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { stack: err.stack });
    }
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  return res.status(500).json({ error: "Internal server error" });
}
