import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "db";
import { AppError } from "../lib/errors";
import { signToken, verifyToken } from "../lib/jwt";
import type { AuthResponse, UserDTO } from "@repo/shared";
const router = Router();

const signupSchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = signupSchema.parse(req.body);
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError("User already exists", 400);
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          role: true,
          credits: true,
          createdAt: true,
        },
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const userDTO: UserDTO = {
        id: user.id,
        email: user.email,
        role: user.role,
        credits: user.credits,
        createdAt: user.createdAt.toISOString(),
      };

      const response: AuthResponse = {
        token,
        user: userDTO,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new AppError(
          "Invalid email or password",
          401,
          "INVALID_CREDENTIALS",
        );
      }

      const isValidUser = await bcrypt.compare(password, user.passwordHash);
      if (!isValidUser) {
        throw new AppError(
          "Invalid email or password",
          401,
          "INVALID_CREDENTIALS",
        );
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const userDTO: UserDTO = {
        id: user.id,
        email: user.email,
        role: user.role,
        credits: user.credits,
        createdAt: user.createdAt.toISOString(),
      };

      const response: AuthResponse = { token, user: userDTO };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },
);

router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const payload = authHeader.split(" ")[1];
    if(!payload) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    const isValid = verifyToken(payload)
    const user = await prisma.user.findUnique({
      where: {
        id: isValid.userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        credits: true,
        createdAt: true
      }
    })

    if(!user) return res.status(404).json({
      error: "User not found"
    })

    const userDTO: UserDTO = {
      id: user.id,
      email: user.email,
      role: user.role,
      credits: user.credits,
      createdAt: user.createdAt.toISOString(),
    }

    res.json({
      user: userDTO
    })
  } catch (error) {
    next(error);
  }
});

export default router;
