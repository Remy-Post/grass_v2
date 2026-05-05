import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env, features } from '../config/env.js';
import { logger } from '../config/logger.js';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `You are a short, friendly quote helper for The Lawn Guy Bradford, a small lawn care service in Bradford West Gwillimbury, Ontario.

Hard rules — never break these:
- NEVER quote a price.
- NEVER claim insurance, license, or pesticide/herbicide/grub/pest treatments.
- NEVER promise a specific schedule.
- Stay grade-6 readable.
- Always end by suggesting the visitor text Remy with their address and any photos.

Your job is to keep the conversation short, gather quick context (location, service need, cadence, yard state), and route them to a text. If a question is off-topic, politely redirect to texting Remy.`;

type Message = { role: 'user' | 'assistant' | 'system'; content: string };

export async function generateReply(history: Message[]): Promise<string | null> {
  if (!features.ai) return null;

  if (openai) {
    try {
      const result = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 200,
        temperature: 0.5,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        ],
      });
      const reply = result.choices[0]?.message.content?.trim();
      if (reply) return reply;
    } catch (err) {
      logger.warn({ err: (err as Error).message }, 'OpenAI failed, trying Gemini');
    }
  }

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt =
        SYSTEM_PROMPT +
        '\n\n' +
        history
          .slice(-10)
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n');
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      logger.warn({ err: (err as Error).message }, 'Gemini failed');
    }
  }

  return null;
}

export const aiAvailable = features.ai;
