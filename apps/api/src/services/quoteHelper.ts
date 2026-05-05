import type { ChatFlowState, ChatMessage, QuoteHelperStep } from '@lawnguy/brand';
import { env } from '../config/env.js';

/**
 * 5-question scripted state machine for the contact-page quote helper.
 * Pure functions, no DB, no LLM — easy to unit-test and impossible to drift
 * away from the brand-approved guardrails.
 *
 * The order matches website.json#quoteHelper.shortFlowQuestions.
 */

const STEP_ORDER: QuoteHelperStep[] = [
  'location',
  'service_need',
  'cadence',
  'yard_state',
  'contact_handoff',
  'done',
];

const STEP_QUESTIONS: Record<QuoteHelperStep, string> = {
  location: 'Hi! Is the property in Bradford or BWG?',
  service_need:
    'What do you need help with? (mowing, trimming/edging, cleanup, seeding/fertilizing, garden maintenance, or not sure)',
  cadence: 'Is this weekly, biweekly, or one-time?',
  yard_state: 'Is the lawn pretty normal, overgrown, or needing a full cleanup?',
  contact_handoff:
    'Thanks. The best next step is to text Remy with your address, what you need, and a few yard photos if you have them. He will help you book a quick look and give a clear quote.',
  done: 'You are all set — just text Remy when you are ready.',
};

export const INITIAL_FLOW_STATE: ChatFlowState = {
  step: 'location',
  answers: {},
};

export function isOutOfArea(answer: string): boolean {
  const a = answer.trim().toLowerCase();
  if (a === 'no' || a === 'nope' || a.startsWith('no,') || a.includes('not in')) return true;
  if (
    a.includes('toronto') ||
    a.includes('newmarket') ||
    a.includes('barrie') ||
    a.includes('aurora')
  ) {
    return true;
  }
  return false;
}

export type AdvanceResult = {
  reply: string;
  flowState: ChatFlowState;
  done: boolean;
  handoff?: { smsHref?: string; mailtoHref?: string };
};

export function advance(
  current: ChatFlowState,
  userMessage: string,
): AdvanceResult {
  const trimmed = userMessage.trim();
  const newAnswers: Record<string, string> = { ...current.answers, [current.step]: trimmed };

  // Bradford-only guardrail: bail early on the location step.
  if (current.step === 'location' && trimmed.length > 0 && isOutOfArea(trimmed)) {
    return {
      reply:
        'Right now The Lawn Guy Bradford only serves Bradford/BWG. Thanks for reaching out — feel free to email Remy if your property is just outside the area.',
      flowState: {
        step: 'done',
        answers: newAnswers,
      },
      done: true,
      handoff: { mailtoHref: `mailto:${env.OWNER_EMAIL}` },
    };
  }

  if (current.step === 'done') {
    return {
      reply: STEP_QUESTIONS.done,
      flowState: { step: 'done', answers: newAnswers },
      done: true,
    };
  }

  const idx = STEP_ORDER.indexOf(current.step);
  const next = STEP_ORDER[idx + 1] ?? 'done';
  const reply = STEP_QUESTIONS[next];

  const isHandoff = next === 'contact_handoff' || next === 'done';
  const handoff = isHandoff
    ? {
        ...(env.OWNER_SMS_HREF ? { smsHref: env.OWNER_SMS_HREF } : {}),
        mailtoHref: `mailto:${env.OWNER_EMAIL}`,
      }
    : undefined;

  return {
    reply,
    flowState: { step: next, answers: newAnswers },
    done: next === 'done' || next === 'contact_handoff',
    handoff,
  };
}

export function openingReply(): AdvanceResult {
  return {
    reply: STEP_QUESTIONS.location,
    flowState: INITIAL_FLOW_STATE,
    done: false,
  };
}

export function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m && m.role === 'user') return m.content;
  }
  return '';
}
