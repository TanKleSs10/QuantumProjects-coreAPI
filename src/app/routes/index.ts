import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Basic health check route to verify server availability.
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
