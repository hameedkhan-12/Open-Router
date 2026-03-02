import { Router, type NextFunction, type Response } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth";
import { prisma } from "db";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import type { DailyMetric, MetricsResponse } from "@repo/shared";

const router = Router();
router.use(authenticate);

router.get(
  "/:id/metrics",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const days = Math.min(parseInt(req.query.days as string) ?? "30", 10);

      const apiKey = await prisma.apiKey.findUnique({
        where: { id },
        select: {
          userId: true,
          deleted: true,
        },
      });

      if (!apiKey || apiKey.deleted)
        throw new NotFoundError("Key does not exist");

      if (apiKey.userId !== req.user!.userId)
        throw new ForbiddenError("You are not allowed to access this key");

      const since = new Date();
      since.setDate(since.getDate() - days);
      since.setHours(0, 0, 0, 0);

      const metrics = await prisma.apiKeyMetric.findMany({
        where: {
          apiKeyId: id,
          date: {
            gte: since,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      const daily: DailyMetric[] = metrics.map((metric) => ({
        date: metric.date.toISOString().split("T")[0]!,
        requests: metric.requests,
        tokensIn: metric.tokensIn,
        tokensOut: metric.tokensOut,
      }));

      const totalRequests = daily.reduce(
        (acc, metric) => acc + metric.requests,
        0,
      );
      const totalTokensIn = daily.reduce(
        (acc, metric) => acc + metric.tokensIn,
        0,
      );
      const totalTokensOut = daily.reduce(
        (acc, metric) => acc + metric.tokensOut,
        0,
      );

      const response: MetricsResponse = {
        metrics: {
          totalRequests,
          totalTokensIn,
          totalTokensOut,
          daily,
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/metrics/aggregate",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const days = Math.min(parseInt((req.query.days as string) ?? "30"), 10);

      const since = new Date();
      since.setDate(since.getDate() - days);
      since.setHours(0, 0, 0, 0);

      const userKeys = await prisma.apiKey.findMany({
        where: {
          userId: req.user!.userId,
          deleted: false,
        },
        select: {
          id: true,
        },
      });

      const keyIds = userKeys.map((key) => key.id);

      const rawMetrics = await prisma.apiKeyMetric.groupBy({
        by: ["date"],
        where: {
          apiKeyId: {
            in: keyIds,
          },
          date: {
            gte: since,
          },
        },
        _sum: {
          requests: true,
          tokensIn: true,
          tokensOut: true,
        },
        orderBy: {
          date: "asc",
        },
      });

      const daily: DailyMetric[] = rawMetrics.map((metric) => ({
        date: metric.date.toISOString().split("T")[0]!,
        requests: metric._sum.requests ?? 0,
        tokensIn: metric._sum.tokensIn ?? 0,
        tokensOut: metric._sum.tokensOut ?? 0,
      }));

      const totalRequests = daily.reduce(
        (acc, metric) => acc + metric.requests,
        0,
      );
      const totalTokensIn = daily.reduce(
        (acc, metric) => acc + metric.tokensIn,
        0,
      );
      const totalTokensOut = daily.reduce(
        (acc, metric) => acc + metric.tokensOut,
        0,
      );
      res.json({
        metrics: { totalRequests, totalTokensIn, totalTokensOut, daily },
      });
    } catch (error) {
        next(error);
    }
  },
);

export default router;