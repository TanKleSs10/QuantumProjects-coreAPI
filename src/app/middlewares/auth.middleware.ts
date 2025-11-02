import { Request, Response, NextFunction } from 'express';

/**
 * Placeholder authentication middleware. Replace the TODO block with
 * real authentication once the identity module is defined.
 */
export const authMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  // TODO: Implement authentication and authorization strategy.
  next();
};
