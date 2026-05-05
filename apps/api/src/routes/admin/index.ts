import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin-auth.js';
import { contentAdminRouter } from './content.js';
import { settingsAdminRouter } from './settings.js';
import { leadsAdminRouter } from './leads.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);
adminRouter.use(contentAdminRouter);
adminRouter.use(settingsAdminRouter);
adminRouter.use(leadsAdminRouter);
