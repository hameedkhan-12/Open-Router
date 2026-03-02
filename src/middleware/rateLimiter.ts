import rateLimit from "express-rate-limit";
import { prisma } from "db";
import { RateLimitError } from "../lib/errors";
import { logger } from "../lib/logger";
import type { NextFunction, Request, Response } from "express";

// Global rate limiter for all routes
export const globalRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// AI completion rate limiter per API key (sliding window using DB logs)
const AI_RATE_LIMIT_MAX = Number(process.env.AI_RATE_LIMIT_MAX ?? 20);
const AI_RATE_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);

export async function apiKeyRateLimiter(
  req: Request & { apiKeyId?: number },
  _res: Response,
  next: NextFunction,
) {
  try {
    if (!req.apiKeyId) return next();

    const windowStart = new Date(Date.now() - AI_RATE_WINDOW_MS);

    const recentRequests = await prisma.apiKeyRateLimitLog.count({
      where: {
        apiKeyId: req.apiKeyId,
        timestamp: { gte: windowStart },
      },
    });

    if (recentRequests >= AI_RATE_LIMIT_MAX) {
      logger.warn(`Rate limit exceeded for API key ${req.apiKeyId}`);
      return next(
        new RateLimitError(
          `Rate limit: max ${AI_RATE_LIMIT_MAX} requests per minute`,
        ),
      );
    }

    // Log this request attempt
    await prisma.apiKeyRateLimitLog.create({
      data: { apiKeyId: req.apiKeyId },
    });

    next();
  } catch (error) {
    next(error);
  }
}
