import { Router, type Request, type Response, type NextFunction } from 'express';
import { LeadModel } from '../../models/Lead.js';

export const leadsAdminRouter = Router();

leadsAdminRouter.get(
  '/leads',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Math.min(Number(req.query['limit'] ?? 50), 200);
      const items = await LeadModel.find().sort({ createdAt: -1 }).limit(limit).lean();
      const total = await LeadModel.estimatedDocumentCount();
      res.json({ items, count: items.length, total });
    } catch (err) {
      next(err);
    }
  },
);

leadsAdminRouter.delete(
  '/leads/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      const result = await LeadModel.findByIdAndDelete(id);
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
