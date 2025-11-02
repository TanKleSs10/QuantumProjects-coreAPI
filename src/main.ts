import 'dotenv/config';
import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import router from './app/routes';
import { connectDatabase } from './infrastructure/database/connection';
import { WinstonLogger } from './infrastructure/logger/WinstonLogger';
import { AppError } from './shared/errors/AppError';

const logger = new WinstonLogger();

const bootstrap = async (): Promise<Application> => {
  await connectDatabase();

  const app = express();
  app.use(express.json());

  // Register application routes.
  app.use('/api', router);

  // Basic error handler ensuring consistent responses.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || 'Internal server error';
    logger.error(message, { stack: err.stack });
    res.status(status).json({ message });
  });

  return app;
};

void bootstrap()
  .then((app) => {
    const port = process.env.PORT ?? 3000;
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to bootstrap application', { error });
    process.exit(1);
  });
