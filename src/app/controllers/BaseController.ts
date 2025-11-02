import { Request, Response, NextFunction } from 'express';

/**
 * BaseController provides shared helpers for concrete HTTP controllers.
 * Extend this class to implement request handling logic while keeping
 * controllers thin and focused on translating HTTP semantics to use cases.
 */
export abstract class BaseController {
  /**
   * Execute the controller logic. Concrete controllers should override this method.
   */
  abstract execute(req: Request, res: Response, next: NextFunction): Promise<void>;
}
