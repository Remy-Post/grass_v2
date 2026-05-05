import { Router, type Request, type Response, type NextFunction } from 'express';
import { LeadInput } from '@lawnguy/brand';
import { LeadModel } from '../../models/Lead.js';
import { sendOwnerEmail } from '../../services/mailer.js';
import { leadHourlyLimiter } from '../../middleware/rateLimit.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export const leadsRouter = Router();

const limiter = leadHourlyLimiter(env.LEAD_HOURLY_LIMIT);

leadsRouter.post(
  '/leads',
  limiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = LeadInput.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', issues: parsed.error.flatten() });
        return;
      }
      const data = parsed.data;

      // Honeypot — bots fill every field.
      if (data.website && data.website.length > 0) {
        // Pretend success to not reveal the trap.
        res.status(202).json({ ok: true });
        return;
      }

      const lead = await LeadModel.create({
        ...data,
        ip: req.ip ?? req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      const subject = `Lawn quote request — ${data.name}`;
      const text =
        `New quote request from ${data.name}\n` +
        `Contact: ${data.contact}\n` +
        `Address: ${data.address}\n` +
        (data.serviceNeed ? `Service: ${data.serviceNeed}\n` : '') +
        (data.cadence ? `Cadence: ${data.cadence}\n` : '') +
        (data.yardState ? `Yard state: ${data.yardState}\n` : '') +
        (data.notes ? `Notes: ${data.notes}\n` : '') +
        `\nLead ID: ${String(lead._id)}`;

      void sendOwnerEmail({ subject, text }).catch((err: unknown) => {
        logger.warn({ err: (err as Error).message }, 'lead email failed');
      });

      res.status(201).json({ ok: true, id: String(lead._id) });
    } catch (err) {
      next(err);
    }
  },
);
