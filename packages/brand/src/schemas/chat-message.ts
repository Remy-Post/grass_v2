import { z } from 'zod';

export const ChatMessageRole = z.enum(['user', 'assistant', 'system']);

export const ChatMessage = z.object({
  role: ChatMessageRole,
  content: z.string().max(4000),
});

export const QUOTE_HELPER_STEPS = [
  'location',
  'service_need',
  'cadence',
  'yard_state',
  'contact_handoff',
  'done',
] as const;

export const QuoteHelperStep = z.enum(QUOTE_HELPER_STEPS);

export const ChatFlowState = z.object({
  step: QuoteHelperStep,
  answers: z.record(z.string(), z.string()).default({}),
});

export const ChatRequest = z.object({
  messages: z.array(ChatMessage).max(20),
  flowState: ChatFlowState.optional(),
});

export const ChatResponse = z.object({
  reply: z.string(),
  flowState: ChatFlowState,
  done: z.boolean(),
  handoff: z
    .object({
      smsHref: z.string().optional(),
      mailtoHref: z.string().optional(),
    })
    .optional(),
});

export type ChatMessageRole = z.infer<typeof ChatMessageRole>;
export type ChatMessage = z.infer<typeof ChatMessage>;
export type QuoteHelperStep = z.infer<typeof QuoteHelperStep>;
export type ChatFlowState = z.infer<typeof ChatFlowState>;
export type ChatRequest = z.infer<typeof ChatRequest>;
export type ChatResponse = z.infer<typeof ChatResponse>;
