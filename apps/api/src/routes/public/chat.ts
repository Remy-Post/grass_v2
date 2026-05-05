import { Router, type Request, type Response, type NextFunction } from 'express';
import { ChatRequest, type ChatResponse } from '@lawnguy/brand';
import { advance, openingReply, lastUserMessage } from '../../services/quoteHelper.js';
import { chatDailyLimiter } from '../../middleware/rateLimit.js';
import { env } from '../../config/env.js';

export const chatRouter = Router();

const limiter = chatDailyLimiter(env.CHAT_DAILY_LIMIT);

chatRouter.post(
  '/chat',
  limiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ChatRequest.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'ValidationError', issues: parsed.error.flatten() });
        return;
      }

      const { messages, flowState } = parsed.data;
      const userMessage = lastUserMessage(messages);

      // No prior state and no user message yet → opening greeting.
      if (!flowState && !userMessage) {
        const r = openingReply();
        const response: ChatResponse = {
          reply: r.reply,
          flowState: r.flowState,
          done: r.done,
        };
        res.json(response);
        return;
      }

      const current = flowState ?? { step: 'location' as const, answers: {} };
      const result = advance(current, userMessage);

      const response: ChatResponse = {
        reply: result.reply,
        flowState: result.flowState,
        done: result.done,
        ...(result.handoff ? { handoff: result.handoff } : {}),
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },
);
