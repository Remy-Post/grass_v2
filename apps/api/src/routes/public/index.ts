import { Router } from 'express';
import { homepageRouter } from './homepage.js';
import { leadsRouter } from './leads.js';
import { chatRouter } from './chat.js';

export const publicRouter = Router();
publicRouter.use(homepageRouter);
publicRouter.use(leadsRouter);
publicRouter.use(chatRouter);
