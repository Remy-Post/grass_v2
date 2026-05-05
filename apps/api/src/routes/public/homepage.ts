import { Router, type Request, type Response, type NextFunction } from 'express';
import { getHomepagePayload } from '../../services/contentRepo.js';

export const homepageRouter = Router();

homepageRouter.get(
  '/homepage',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = await getHomepagePayload();
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
      res.json(payload);
    } catch (err) {
      next(err);
    }
  },
);
