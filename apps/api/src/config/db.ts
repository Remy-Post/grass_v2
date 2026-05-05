import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

let connectingPromise: Promise<typeof mongoose> | null = null;

export async function connectDb(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectingPromise) return connectingPromise;

  mongoose.connection.on('connected', () => logger.info('mongo connected'));
  mongoose.connection.on('error', (err) => logger.error({ err }, 'mongo error'));
  mongoose.connection.on('disconnected', () => logger.warn('mongo disconnected'));

  connectingPromise = mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    return await connectingPromise;
  } catch (err) {
    connectingPromise = null;
    throw err;
  }
}

export async function disconnectDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectingPromise = null;
}
