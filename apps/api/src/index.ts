import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDb, disconnectDb } from './config/db.js';

async function main(): Promise<void> {
  try {
    await connectDb();
  } catch (err) {
    logger.error({ err }, 'failed to connect to mongo on startup');
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'api ready');
  });

  function shutdown(signal: string): void {
    logger.info({ signal }, 'shutting down');
    server.close(async (err) => {
      if (err) {
        logger.error({ err }, 'error during shutdown');
        process.exit(1);
      }
      try {
        await disconnectDb();
      } catch (disconnectErr) {
        logger.warn({ err: disconnectErr }, 'mongo disconnect threw');
      }
      process.exit(0);
    });
    setTimeout(() => {
      logger.warn('forced shutdown after 10s');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err: unknown) => {
  logger.error({ err }, 'failed to start api');
  process.exit(1);
});
