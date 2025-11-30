import "express-serve-static-core";
import { type Request, type Response, type NextFunction } from "express";
import { SecurityService } from "@src/infrastructure/services/SecurityService";
import { ScryptSecurityAdapter } from "@src/infrastructure/adapters/ScryptSecurityAdapter";
import { JWTAdapter } from "@src/infrastructure/adapters/JWTAdapter";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

const secureAdapter = new ScryptSecurityAdapter();
const tokenAdapter = new JWTAdapter();
const securityService = new SecurityService(secureAdapter, tokenAdapter);

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Unauthorized" });

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token)
      return res.status(401).json({ message: "Unauthorized" });

    const payload = await securityService.verifyToken<{ id: string }>(token);

    if (!payload || !payload.id)
      return res.status(401).json({ message: "Unauthorized" });

    req.userId = payload.id;

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
