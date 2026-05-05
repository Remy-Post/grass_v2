import type { Request, Response, NextFunction } from 'express';

/**
 * In-memory sliding-window rate limiter.
 * Single-process only — fine at our scale (5–10 clients on one VM).
 * For multi-process later, swap to Redis-backed; the interface stays the same.
 */
type Bucket = { count: number; resetAt: number };

function makeLimiter(windowMs: number, max: number) {
  const buckets = new Map<string, Bucket>();

  return function limit(req: Request, res: Response, next: NextFunction): void {
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (existing.count >= max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({ error: 'Too Many Requests', retryAfterSeconds: retryAfter });
      return;
    }
    existing.count += 1;
    next();
  };
}

export const leadHourlyLimiter = (max: number) => makeLimiter(60 * 60 * 1000, max);
export const chatDailyLimiter = (max: number) => makeLimiter(24 * 60 * 60 * 1000, max);
