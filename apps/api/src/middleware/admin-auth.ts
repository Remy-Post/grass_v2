import type { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Bearer-token admin auth. Phase 5 wires this onto /api/admin/*.
 * Timing-safe compare matters because the token is the only barrier.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!env.ADMIN_TOKEN) {
    res.status(503).json({ error: 'Admin disabled — ADMIN_TOKEN not configured' });
    return;
  }
  const header = req.headers.authorization ?? '';
  const presented = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

  const expected = Buffer.from(env.ADMIN_TOKEN);
  const actual = Buffer.from(presented);
  if (actual.length !== expected.length || !timingSafeEqual(expected, actual)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
