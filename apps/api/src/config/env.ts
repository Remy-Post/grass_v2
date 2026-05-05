import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Database
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/lawnguy'),

  // Admin (Phase 5)
  ADMIN_TOKEN: z.string().min(16).optional(),

  // AI chat (both optional)
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z
    .union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')])
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  OWNER_EMAIL: z.string().email().default('remy.post.06@gmail.com'),

  // Handoff destinations
  OWNER_SMS_HREF: z.string().optional(),

  // Rate limits
  CHAT_DAILY_LIMIT: z.coerce.number().int().positive().default(50),
  LEAD_HOURLY_LIMIT: z.coerce.number().int().positive().default(20),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof EnvSchema>;

export const features = {
  ai: Boolean(env.OPENAI_API_KEY) || Boolean(env.GEMINI_API_KEY),
  email: Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
  admin: Boolean(env.ADMIN_TOKEN),
} as const;
