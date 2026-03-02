import { Router, type NextFunction, type Response } from "express";
import z from "zod";
import type { AuthRequest } from "../middleware/auth";
import type { CompletionRequest } from "@repo/shared";
import type { ApiKeyRequest } from "../middleware/validateApiKey";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";
import { recordMetrics } from "../services/metrics";

const router = Router();

const completionSchema = z.object({
  model: z.string().min(1),
  messages: z
    .array(
      z.object({
        role: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .min(1),
  max_tokens: z.number().min(1).max(4000),
  temperature: z.number().min(0).max(2).optional(),
  stream: z.boolean().optional(),
});

router.post(
  "/",
  async (req: ApiKeyRequest, res: Response, next: NextFunction) => {
    try {
      const body = completionSchema.parse(req.body) as CompletionRequest;
      const apiKeyId = req.apiKeyId!;

      const providerUrl =
        process.env.AI_PROVIDER_URL ?? "https://openrouter.ai/api/v1";
      const providerKey = process.env.AI_PROVIDER_KEY ?? "";

      if (!providerKey) {
        throw new AppError(
          "AI provider key not found",
          503,
          "PROVIDER_NOT_CONFIGURED",
        );
      }

      const upstreamResponse = await fetch(`${providerUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${providerKey}`,
          "HTTP-Referer": "https://openrouter.ai",
          "X-Title": "OpenRouter",
        },
        body: JSON.stringify(body),
      });

      if (!upstreamResponse.ok) {
        const errorText = await upstreamResponse.text();
        logger.error("Upstream AI error", {
          status: upstreamResponse.status,
          body: errorText,
        });

        throw new AppError(`AI provider error: ${upstreamResponse.statusText}`, upstreamResponse.status, "UPSTREAM_ERROR");
      }

      const data = await upstreamResponse.json() as any;

      const tokensIn = data.usage?.prompt_tokens || 0;
      const tokensOut = data.usage?.completion_tokens || 0;
      recordMetrics(apiKeyId, tokensIn, tokensOut, "/completion", "POST",200).catch(() => {});
    } catch (error) {}
  },
);
export default router;
