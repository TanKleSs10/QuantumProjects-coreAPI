import { NextFunction, Request, Response } from "express";
import { lockoutService } from "@src/infrastructure/factories/lockoutServiceFactory";

export const loginLockoutMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = req.body?.email as string | undefined;
  if (!email) return next();

  const key = `login:${email}`;
  if (lockoutService.isLocked(key)) {
    return res
      .status(429)
      .json({ success: false, message: "Too many attempts" });
  }

  return next();
};

export const resetLockoutMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.body?.token as string | undefined;
  const key = token ? `reset:${token}` : `reset-ip:${req.ip}`;

  if (lockoutService.isLocked(key)) {
    return res
      .status(429)
      .json({ success: false, message: "Too many attempts" });
  }

  return next();
};
