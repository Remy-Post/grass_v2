import { Router, type Request, type Response, type NextFunction } from 'express';
import { SiteSettings as SiteSettingsSchema } from '@lawnguy/brand';
import { SiteSettingsModel } from '../../models/SiteSettings.js';
import { upsertSiteSettings } from '../../services/contentRepo.js';

export const settingsAdminRouter = Router();

settingsAdminRouter.get(
  '/settings',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const doc = await SiteSettingsModel.findOne({ key: 'default' }).lean();
      res.json({ data: doc?.data ?? null });
    } catch (err) {
      next(err);
    }
  },
);

settingsAdminRouter.put(
  '/settings',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = SiteSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', issues: parsed.error.flatten() });
        return;
      }
      const doc = await upsertSiteSettings(parsed.data);
      res.json({ data: doc?.data });
    } catch (err) {
      next(err);
    }
  },
);
