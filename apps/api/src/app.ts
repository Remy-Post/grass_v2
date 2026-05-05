import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env, features } from './config/env.js';
import { logger } from './config/logger.js';
import { publicRouter } from './routes/public/index.js';
import { adminRouter } from './routes/admin/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(pinoHttp({ logger }));
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: '@lawnguy/api',
      version: '0.1.0',
      env: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      features,
    });
  });

  app.use('/api/public', publicRouter);
  app.use('/api/admin', adminRouter);

  // 404 handler — must come after all routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Error handler — must be last and take 4 args
  app.use(errorHandler);

  return app;
}
