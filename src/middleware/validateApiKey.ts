import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors";
import { prisma } from "db";

export interface ApiKeyRequest extends Request {
  apiKeyId?: number;
  apiKeyRecord?: {
    id: number;
    key: string;
    name: string;
    userId: number;
  };
}

export async function validateApiKey(
  req: ApiKeyRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid API key");
    }

    const key = authHeader.split(" ")[1];
    const apiKey = await prisma.apiKey.findUnique({
      where: { key },
      select: {
        id: true,
        userId: true,
        key: true,
        name: true,
        disabled: true,
        deleted: true,
      },
    });

    if (!apiKey || apiKey.deleted) {
      throw new UnauthorizedError("Missing or invalid API key");
    }
    if (apiKey.disabled) {
      throw new UnauthorizedError("API key is disabled");
    }
    req.apiKeyId = apiKey.id;
    req.apiKeyRecord = {
      id: apiKey.id,
      key: apiKey.key,
      name: apiKey.name,
      userId: apiKey.userId,
    };
    prisma.apiKey.update({
      where: {
        id: apiKey.id,
      },
      data: {
        lastUsedAt: new Date(),
      },
    }).catch(() => {});
    next();
  } catch (error) {
    next(error)
  }
}
