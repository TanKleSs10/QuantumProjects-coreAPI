import { Request, Response, NextFunction } from "express";
import { logger } from "@src/infrastructure/logs";
import { DomainError } from "@src/shared/errors/DomainError";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";
import { ExpiredTokenError } from "@src/shared/errors/ExpiredTokenError";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const log = logger.child("ErrorHandler");
  const errorMessage = err instanceof Error ? err.message : String(err);

  if (err instanceof ExpiredTokenError) {
    log.warn("Expired token error", { path: req.path });
    return res.status(410).json({ success: false, message: err.message });
  }
  if (err instanceof InvalidTokenError) {
    log.warn("Invalid token error", { path: req.path });
    return res.status(401).json({ success: false, message: err.message });
  }
  if (err instanceof DomainError) {
    log.warn("Domain error", { path: req.path, message: err.message });
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err instanceof ApplicationError) {
    log.error("Application error", { path: req.path, message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }

  log.error("Unhandled error", { path: req.path, error: errorMessage });
  return res.status(500).json({ success: false, message: "Internal server error" });
};
