import { Router, type NextFunction, type Response } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth";
import type {
  ApiKeyDTO,
  CreateApiKeyResponse,
  ListApiKeysResponse,
} from "@repo/shared";
import { prisma } from "db";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { ForbiddenError, NotFoundError } from "../lib/errors";

const router = Router();

router.use(authenticate);

function toApiKeyDTO(key: {
  id: number;
  key: string;
  name: string;
  disabled: boolean;
  deleted: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
}): ApiKeyDTO {
  return {
    id: key.id,
    key: key.key,
    name: key.name,
    disabled: key.disabled,
    deleted: key.deleted,
    createdAt: key.createdAt.toISOString(),
    lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
  };
}

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: {
        userId: req.user?.userId,
        deleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response: ListApiKeysResponse = {
      apiKeys: keys.map(toApiKeyDTO),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

router.post(
  "/",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name } = createKeySchema.parse(req.body);

      const key = `sk-${uuidv4().replace(/-/g, "")}`;
      const apiKey = await prisma.apiKey.create({
        data: {
          userId: req.user!.userId,
          name,
          key,
        },
      });

      const response: CreateApiKeyResponse = { apiKey: toApiKeyDTO(apiKey) };
      res.status(201).json(response);
    } catch (error) {}
  },
);

const updateKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  disable: z.boolean().optional(),
  deleted: z.boolean().optional(),
});

router.patch(
  "/:id",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const updates = updateKeySchema.parse(req.body);

      const existing = await prisma.apiKey.findUnique({
        where: {
          id,
        },
      });
      if (!existing || existing.deleted) {
        throw new NotFoundError("Key does not exist");
      }
      if (existing.userId !== req.user!.userId)
        throw new ForbiddenError("You are not allowed to update this key");

      const updated = await prisma.apiKey.update({
        where: {
          id,
        },
        data: updates,
      });
      res.json({
        apiKey: toApiKeyDTO(updated),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const existing = await prisma.apiKey.findUnique({
        where: { id },
      });

      if (!existing || existing.deleted) {
        throw new NotFoundError("Key does not exist");
      }
      if (existing.userId !== req.user!.userId)
        throw new ForbiddenError("You are not allowed to delete this key");

      const updated = await prisma.apiKey.update({
        where: {
            id
        },
        data: {
            deleted: true
        }
      })
      res.json({
        message: "Api key deleted",
      })
    } catch (error) {
        next(error)
    }
  },
);

export default router;
