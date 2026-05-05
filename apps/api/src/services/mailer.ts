import nodemailer, { type Transporter } from 'nodemailer';
import { env, features } from '../config/env.js';
import { logger } from '../config/logger.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!features.email) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 465,
    secure: env.SMTP_SECURE ?? true,
    auth: { user: env.SMTP_USER ?? '', pass: env.SMTP_PASS ?? '' },
  });
  return transporter;
}

type SendArgs = {
  subject: string;
  text: string;
  html?: string;
};

export async function sendOwnerEmail({ subject, text, html }: SendArgs): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    logger.warn({ subject }, 'mailer: SMTP not configured, skipping email');
    return false;
  }
  try {
    await t.sendMail({
      from: env.SMTP_USER,
      to: env.OWNER_EMAIL,
      subject,
      text,
      ...(html ? { html } : {}),
    });
    return true;
  } catch (err) {
    logger.error({ err: (err as Error).message, subject }, 'mailer: send failed');
    return false;
  }
}
