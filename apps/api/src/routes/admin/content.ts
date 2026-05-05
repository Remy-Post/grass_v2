import { Router, type Request, type Response, type NextFunction } from 'express';
import { ContentItem, isContentKind } from '@lawnguy/brand';
import { ContentItemModel } from '../../models/ContentItem.js';

export const contentAdminRouter = Router();

contentAdminRouter.get(
  '/content/:kind',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kind = typeof req.params['kind'] === 'string' ? req.params['kind'] : '';
      if (!kind || !isContentKind(kind)) {
        res.status(400).json({ error: 'Invalid kind' });
        return;
      }
      const items = await ContentItemModel.find({ kind })
        .sort({ order: 1, slug: 1 })
        .lean();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  },
);

contentAdminRouter.get(
  '/content/:kind/:slug',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kind = typeof req.params['kind'] === 'string' ? req.params['kind'] : '';
      const slug = typeof req.params['slug'] === 'string' ? req.params['slug'] : '';
      if (!kind || !slug || !isContentKind(kind)) {
        res.status(400).json({ error: 'Invalid kind' });
        return;
      }
      const item = await ContentItemModel.findOne({ kind, slug }).lean();
      if (!item) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json({ item });
    } catch (err) {
      next(err);
    }
  },
);

contentAdminRouter.put(
  '/content/:kind/:slug',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kind = typeof req.params['kind'] === 'string' ? req.params['kind'] : '';
      const slug = typeof req.params['slug'] === 'string' ? req.params['slug'] : '';
      if (!kind || !slug || !isContentKind(kind)) {
        res.status(400).json({ error: 'Invalid kind' });
        return;
      }
      const parsed = ContentItem.safeParse({ kind, slug, ...req.body });
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', issues: parsed.error.flatten() });
        return;
      }
      const v = parsed.data;
      const updated = await ContentItemModel.findOneAndUpdate(
        { kind, slug },
        {
          title: v.title,
          slug: v.slug,
          enabled: v.enabled,
          order: v.order,
          data: v.data,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean();
      res.json({ item: updated });
    } catch (err) {
      next(err);
    }
  },
);

contentAdminRouter.delete(
  '/content/:kind/:slug',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kind = typeof req.params['kind'] === 'string' ? req.params['kind'] : '';
      const slug = typeof req.params['slug'] === 'string' ? req.params['slug'] : '';
      if (!kind || !slug || !isContentKind(kind)) {
        res.status(400).json({ error: 'Invalid kind' });
        return;
      }
      const result = await ContentItemModel.findOneAndDelete({ kind, slug });
      if (!result) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
