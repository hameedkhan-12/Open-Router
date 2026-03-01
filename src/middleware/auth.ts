import { type NextFunction, type Request, type Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../lib/errors";
import { verifyToken } from "../lib/jwt";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    }else{
      next(new UnauthorizedError("Invalid or Expired token"));
    }
  }
}
